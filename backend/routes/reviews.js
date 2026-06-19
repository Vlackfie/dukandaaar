import express from 'express';
import pool from '../config/db.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Verified Buyer Review Gateway
router.post('/', verifyToken, authorizeRoles('customer'), async (req, res) => {
  const { product_id, rating, comment } = req.body;
  try {
    const [eligibility] = await pool.query(`
      SELECT o.id FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = ? AND oi.product_id = ? AND o.status = 'Delivered'
    `, [req.user.id, product_id]);

    if (eligibility.length === 0) {
      return res.status(403).json({ error: 'Review rejected. You can only review items you have bought and had successfully Delivered.' });
    }

    await pool.query(
      'INSERT INTO reviews (customer_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [req.user.id, product_id, rating, comment]
    );

    res.status(201).json({ message: 'Review published successfully.' });
  } catch (error) {
    res.status(400).json({ error: 'You have already reviewed this product.' });
  }
});

export default router;