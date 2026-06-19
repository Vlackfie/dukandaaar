import express from 'express';
import pool from '../config/db.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Checkout with Strict ACID Transactions
router.post('/checkout', verifyToken, authorizeRoles('customer'), async (req, res) => {
  const { items, payment_method, total_amount } = req.body; 
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Log Order Entry
    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_id, total_amount, payment_method) VALUES (?, ?, ?)',
      [req.user.id, total_amount, payment_method]
    );
    const orderId = orderResult.insertId;

    // 2. Process items synchronously with isolation checks
    for (const item of items) {
      const [prodRows] = await connection.query('SELECT stock, price FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
      if (prodRows.length === 0) throw new Error(`Product ${item.product_id} not found.`);
      
      const product = prodRows[0];
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.product_id}`);
      }

      // Decrement stock levels safely
      await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);

      // Map line items
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, product.price]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Order approved successfully', orderId });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Customer Tracking Route
router.get('/tracking/:orderId', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, status, total_amount FROM orders WHERE id = ?', [req.params.orderId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order trace missing.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Order Tracking Lifecycle (Sellers / Admins)
router.patch('/:id/status', verifyToken, authorizeRoles('seller', 'admin'), async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;