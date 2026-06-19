import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const isVerifiedSeller = role === 'seller' ? false : false;

    await pool.query(
      'INSERT INTO users (name, email, password, role, is_verified_seller) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, isVerifiedSeller]
    );
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.role === 'seller' && !user.is_verified_seller) {
      return res.status(403).json({ error: 'Seller account pending admin verification.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name }, 
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '24h' }
    );
    res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;