import express from 'express';
import pool from '../config/db.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/metrics', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [sales] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE status != "Cancelled"');
    const [sellers] = await pool.query('SELECT id, name, email FROM users WHERE role = "seller" AND is_verified_seller = FALSE');
    const [categories] = await pool.query('SELECT * FROM categories');
    
    res.json({
      revenue: sales[0].revenue,
      pendingSellers: sellers,
      categories
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-seller', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const { seller_id } = req.body;
  try {
    await pool.query('UPDATE users SET is_verified_seller = TRUE WHERE id = ?', [seller_id]);
    res.json({ message: 'Seller approved and verified successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;