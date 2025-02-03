"use strict";

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; // Use a secure key in production

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: ['http://spackcloud.duckdns.org:3000', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Accept']
}));
app.use(express.json());
app.listen(PORT, () => {
  console.log("Server is running on port ".concat(PORT, "."));
});

// Initialize SQLite database connection for users.
const db = new sqlite3.Database('./database/users.db', err => {
  if (err) {
    console.error('Error opening users.db:', err.message);
  } else {
    console.log('Connected to the users.db database.');

    // Create the 'users' table.
    db.run("CREATE TABLE IF NOT EXISTS users (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        username TEXT UNIQUE,\n        email TEXT,\n        password TEXT,\n        status TEXT DEFAULT 'normal'\n      )", tableErr => {
      if (tableErr) {
        console.error('Error creating users table:', tableErr.message);
      } else {
        // Generate/update admin account.
        const newPassword = crypto.randomBytes(8).toString('hex');
        db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
          if (err) {
            console.error('Error checking admin account:', err.message);
          } else if (row) {
            db.run('UPDATE users SET password = ?, email = ? WHERE id = ?', [newPassword, 'admin@example.com', row.id], function (err) {
              if (err) {
                console.error('Error updating admin account:', err.message);
              } else {
                console.log('Default admin credentials: username: admin, password: ' + newPassword);
              }
            });
          } else {
            db.run('INSERT INTO users (username, email, password, status) VALUES (?, ?, ?, ?)', ['admin', 'admin@example.com', newPassword, 'admin'], function (err) {
              if (err) {
                console.error('Error inserting admin account:', err.message);
              } else {
                console.log('Default admin credentials: username: admin, password: ' + newPassword);
              }
            });
          }
        });
      }
    });

    // Create the banned_emails table.
    db.run("CREATE TABLE IF NOT EXISTS banned_emails (\n        email TEXT PRIMARY KEY\n      )", tableErr => {
      if (tableErr) {
        console.error('Error creating banned_emails table:', tableErr.message);
      } else {
        console.log('banned_emails table ready.');
      }
    });
  }
});

// API endpoint for token validation.
app.post('/api/validate-token', (req, res) => {
  const {
    token
  } = req.body;
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        valid: false
      });
    }
    const admin = decoded.status === 'admin';
    return res.status(200).json({
      valid: true,
      admin
    });
  });
});

// API endpoint to fetch all users.
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, email, status FROM users', [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err.message);
      return res.status(500).json({
        error: 'Failed to fetch users.'
      });
    }
    res.status(200).json(rows);
  });
});

// API endpoint to ban a user: delete user and add their email to banned_emails.
app.delete('/api/users/:id/ban', (req, res) => {
  const userId = req.params.id;
  db.get('SELECT email FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      console.error('Error fetching user for ban:', err.message);
      return res.status(500).json({
        error: 'Failed to ban user.'
      });
    }
    if (!row) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }
    const email = row.email;
    db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
      if (err) {
        console.error('Error deleting user:', err.message);
        return res.status(500).json({
          error: 'Failed to ban user.'
        });
      }
      if (this.changes === 0) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }
      db.run('INSERT INTO banned_emails (email) VALUES (?)', [email], function (err) {
        if (err) {
          console.error('Error banning email:', err.message);
          return res.status(500).json({
            error: 'Failed to ban user email.'
          });
        }
        res.status(200).json({
          message: 'User banned successfully.'
        });
      });
    });
  });
});

// API endpoint to update a user's status.
app.put('/api/users/:id/status', (req, res) => {
  const {
    status
  } = req.body;
  const userId = req.params.id;
  db.run('UPDATE users SET status = ? WHERE id = ?', [status, userId], function (err) {
    if (err) {
      console.error('Error updating status:', err.message);
      return res.status(500).json({
        error: 'Failed to update status.'
      });
    }
    if (this.changes === 0) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }
    res.status(200).json({
      message: 'Status updated.'
    });
  });
});

// API endpoint for user registration.
app.post('/api/register', (req, res) => {
  const {
    username,
    email,
    password
  } = req.body;
  db.get('SELECT email FROM banned_emails WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Error checking banned emails:', err.message);
      return res.status(500).json({
        error: 'Registration failed.'
      });
    }
    if (row) {
      return res.status(403).json({
        error: 'Registration blocked: email is banned.'
      });
    }
    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], function (err) {
      if (err) {
        console.error('Error inserting user:', err.message);
        return res.status(500).json({
          error: 'Registration failed. The username might already be taken.'
        });
      }
      res.status(201).json({
        message: 'Registration successful',
        userId: this.lastID
      });
    });
  });
});

// API endpoint for user login.
app.post('/api/login', (req, res) => {
  const {
    username,
    password
  } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Error during login:', err.message);
      return res.status(500).json({
        error: 'Login failed'
      });
    }
    if (!user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }
    if (user.password === password) {
      const token = jwt.sign({
        userId: user.id,
        status: user.status
      }, SECRET_KEY, {
        expiresIn: '1h'
      });
      return res.status(200).json({
        message: 'Login successful',
        token
      });
    } else {
      return res.status(400).json({
        error: 'Incorrect password'
      });
    }
  });
});

// Initialize SQLite database connection for forum posts.
const forumDb = new sqlite3.Database('./database/forumListings.db', err => {
  if (err) {
    console.error('Error opening forumListings.db:', err.message);
  } else {
    console.log('Connected to the forumListings.db database.');
    forumDb.run("CREATE TABLE IF NOT EXISTS posts (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        title TEXT NOT NULL,\n        description TEXT NOT NULL,\n        timestamp TEXT NOT NULL,\n        pinned INTEGER DEFAULT 0,\n        locked INTEGER DEFAULT 0\n      )", tableErr => {
      if (tableErr) console.error('Error creating posts table:', tableErr.message);
    });
    forumDb.run("CREATE TABLE IF NOT EXISTS comments (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        post_id INTEGER,\n        user_id INTEGER,\n        username TEXT,\n        content TEXT,\n        timestamp TEXT,\n        FOREIGN KEY (post_id) REFERENCES posts (id),\n        FOREIGN KEY (user_id) REFERENCES users (id)\n      )", tableErr => {
      if (tableErr) console.error('Error creating comments table:', tableErr.message);
    });
  }
});

// API endpoint for adding forum posts.
app.post('/api/posts', (req, res) => {
  const {
    title,
    description,
    timestamp
  } = req.body;
  forumDb.run('INSERT INTO posts (title, description, timestamp) VALUES (?, ?, ?)', [title, description, timestamp], function (err) {
    if (err) {
      console.error('Error inserting post:', err.message);
      return res.status(500).json({
        error: 'Failed to add post.'
      });
    }
    res.status(201).json({
      message: 'Post added',
      postId: this.lastID
    });
  });
});

// API endpoint for retrieving forum posts.
app.get('/api/posts', (req, res) => {
  forumDb.all('SELECT * FROM posts ORDER BY (pinned * 1) DESC, id DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching posts:', err.message);
      return res.status(500).json({
        error: 'Failed to fetch posts.'
      });
    }
    res.status(200).json(rows);
  });
});

// API endpoint to get a single post with its comments.
app.get('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  forumDb.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) return res.status(500).json({
      error: 'Failed to fetch post'
    });
    if (!post) return res.status(404).json({
      error: 'Post not found'
    });
    forumDb.all('SELECT * FROM comments WHERE post_id = ? ORDER BY timestamp DESC', [postId], (err, comments) => {
      if (err) return res.status(500).json({
        error: 'Failed to fetch comments'
      });
      res.json({
        post,
        comments
      });
    });
  });
});

// API endpoint to add a comment to a post.
app.post('/api/posts/:id/comments', (req, res) => {
  const {
    content,
    userId,
    username
  } = req.body;
  const postId = req.params.id;
  const timestamp = new Date().toLocaleString();
  forumDb.run('INSERT INTO comments (post_id, user_id, username, content, timestamp) VALUES (?, ?, ?, ?, ?)', [postId, userId, username, content, timestamp], function (err) {
    if (err) return res.status(500).json({
      error: 'Failed to add comment'
    });
    res.status(201).json({
      message: 'Comment added',
      commentId: this.lastID
    });
  });
});

// API endpoint to toggle pinned status of a post.
app.put('/api/posts/:id/pin', (req, res) => {
  const postId = req.params.id;
  const {
    pinned
  } = req.body; // Expecting a boolean value.
  const pinnedValue = pinned ? 1 : 0;
  forumDb.run('UPDATE posts SET pinned = ? WHERE id = ?', [pinnedValue, postId], function (err) {
    if (err) {
      console.error('Error updating pin status:', err.message);
      return res.status(500).json({
        error: 'Failed to update pin status.'
      });
    }
    res.status(200).json({
      message: 'Pin status updated.',
      pinned: !!pinnedValue
    });
  });
});

// API endpoint to toggle locked status of a post.
app.put('/api/posts/:id/lock', (req, res) => {
  const postId = req.params.id;
  const {
    locked
  } = req.body; // Expecting a boolean value.
  const lockedValue = locked ? 1 : 0;
  forumDb.run('UPDATE posts SET locked = ? WHERE id = ?', [lockedValue, postId], function (err) {
    if (err) {
      console.error('Error updating locked status:', err.message);
      return res.status(500).json({
        error: 'Failed to update locked status.'
      });
    }
    res.status(200).json({
      message: 'Locked status updated.',
      locked: !!lockedValue
    });
  });
});

// API endpoint to delete a post.
app.delete('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  forumDb.run('DELETE FROM posts WHERE id = ?', [postId], function (err) {
    if (err) {
      console.error('Error deleting post:', err.message);
      return res.status(500).json({
        error: 'Failed to delete post.'
      });
    }
    res.status(200).json({
      message: 'Post deleted successfully.'
    });
  });
});