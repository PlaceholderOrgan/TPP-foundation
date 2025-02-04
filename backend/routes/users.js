// routes/users.js
const express = require('express');
const jwt = require('jsonwebtoken');
const usersDb = require('../db/usersDb');
const { SECRET_KEY } = require('../config');

const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  usersDb.all('SELECT id, username, status FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
    res.json(rows);
  });
});

// Ban a user
router.delete('/:id/ban', (req, res) => {
  const userId = req.params.id;
  usersDb.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to ban user' });
    }
    res.json({ message: 'User banned successfully' });
  });
});

// Update user status
router.put('/:id/status', (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;
  usersDb.run(
    'UPDATE users SET status = ? WHERE id = ?',
    [status, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update user status' });
      }
      res.json({ message: 'User status updated successfully' });
    }
  );
});

// Register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  usersDb.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to register user' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  usersDb.get(
    'SELECT id, username, password, status FROM users WHERE username = ?',
    [username],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!row || row.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ userId: row.id, status: row.status }, SECRET_KEY);
      res.json({ token });
    }
  );
});

module.exports = router;
