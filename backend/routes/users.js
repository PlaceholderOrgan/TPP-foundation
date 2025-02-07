// routes/users.js
const express = require('express');
const jwt = require('jsonwebtoken');
const usersDb = require('../db/usersDb');
const { SECRET_KEY } = require('../config');
const authenticate = require('../middlewares/auth');

const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  usersDb.all('SELECT id, username, status, status_message, description FROM users', [], (err, rows) => {
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

// Update user status, status_message, and description
// Modify the user profile GET endpoint to remove authentication requirement
router.get('/:id', (req, res) => {  // Remove authenticate middleware
  const userId = req.params.id;

  usersDb.get(
    'SELECT id, username, status, status_message, description FROM users WHERE id = ?',
    [userId],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve user' });
      }
      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(row);
    }
  );
});

router.put('/:id', authenticate.authenticate, (req, res) => {
  const userId = req.params.id;
  const { status_message, description } = req.body;

  // Optional: Compare req.user.userId with userId to ensure user is updating their own profile.
  if (req.user.userId != userId) {
    return res.status(403).json({ error: 'Forbidden: Cannot update other users' });
  }

  usersDb.run(
    'UPDATE users SET status_message = ?, description = ? WHERE id = ?',
    [status_message, description, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  // Validate username length
  if (!username || username.length < 3 || username.length > 24) {
    return res.status(400).json({ error: 'Username must be between 3 and 24 characters long' });
  }
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
    'SELECT id, username, password, status, status_message, description FROM users WHERE username = ?',
    [username],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!row || row.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign(
        { userId: row.id, username: row.username, status: row.status, status_message: row.status_message, description: row.description },
        SECRET_KEY
      );
      res.json({ token });
    }
  );
});

router.get('/token/refresh', authenticate.authenticate, (req, res) => {
  const userId = req.user.userId;
  usersDb.get(
    'SELECT id, username, status, status_message, description FROM users WHERE id = ?',
    [userId],
    (err, row) => {
      if (err || !row) {
        return res.status(500).json({ error: 'Failed to refresh token' });
      }
      const token = jwt.sign(
        {
          userId: row.id,
          username: row.username,
          status: row.status,
          status_message: row.status_message,
          description: row.description,
        },
        SECRET_KEY
      );
      res.json({ token });
    }
  );
});

module.exports = router;