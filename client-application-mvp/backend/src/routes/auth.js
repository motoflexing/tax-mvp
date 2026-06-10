const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const toPublicUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role
});

router.post('/signup', async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || String(full_name).trim() === '') {
      return res.status(400).json({ success: false, message: 'full_name is required' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (!password || String(password).length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [full_name.trim(), email.trim(), passwordHash, 'user']
    );

    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = rows[0];

    return res.status(201).json({
      success: true,
      token: signToken(user),
      user: toPublicUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [String(email).trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];
    console.log('Input password:', password);
    console.log('Hash from DB:', user.password_hash);
    console.log('Hash length:', user.password_hash.length);
    const match = await bcrypt.compare(String(password), user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      token: signToken(user),
      user: toPublicUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user: toPublicUser(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
