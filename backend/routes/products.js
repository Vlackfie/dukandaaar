import express from 'express';
import pool from '../config/db.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Search, Filter, & Default Home Feed Engine
router.get('/', async (req, res) => {
  const { search, category } = req.query;
  try {
    let query = `
      SELECT p.*, c.name as category_name,
             COALESCE(SUM(oi.quantity), 0) as units_sold,
             COALESCE(AVG(r.rating), 0) as avg_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND p.name LIKE ?`;
      params.push(`%${search}%`);
    }
    if (category) {
      query += ` AND c.name = ?`;
      params.push(category);
    }

    query += ` GROUP BY p.id ORDER BY units_sold DESC, avg_rating DESC`;

    const [products] = await pool.query(query, params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seller: Add Product
router.post('/', verifyToken, authorizeRoles('seller'), async (req, res) => {
  const { name, description, price, stock, category_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO products (seller_id, category_id, name, description, price, stock) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, category_id, name, description, price, stock]
    );
    res.status(201).json({ message: 'Product added successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seller: Read Specific Inventory
router.get('/seller-inventory', verifyToken, authorizeRoles('seller'), async (req, res) => {
  try {
    const [inventory] = await pool.query('SELECT * FROM products WHERE seller_id = ?', [req.user.id]);
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;