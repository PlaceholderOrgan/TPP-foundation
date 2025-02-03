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
  console.log(`Server is running on port ${PORT}.`);
});

// Helper to create tables
const createTable = (db, query, tableName) => {
  db.run(query, (err) => {
    if (err) {
      console.error(`Error creating ${tableName} table:`, err.message);
    } else {
      console.log(`${tableName} table ready.`);
    }
  });
};

// Initialize SQLite database for users.
const db = new sqlite3.Database('./database/users.db', (err) => {
  if (err) {
    console.error('Error opening users.db:', err.message);
  } else {
    console.log('Connected to the users.db database.');

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT,
        password TEXT,
        status TEXT DEFAULT 'normal'
      )`;
    createTable(db, createUsersTable, 'users');

    // Setup admin account
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

    const createBannedEmailsTable = `
      CREATE TABLE IF NOT EXISTS banned_emails (
        email TEXT PRIMARY KEY
      )`;
    createTable(db, createBannedEmailsTable, 'banned_emails');
  }
});

// API endpoints for users
app.post('/api/validate-token', (req, res) => {
  const { token } = req.body;
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ valid: false });
    const admin = decoded.status === 'admin';
    res.status(200).json({ valid: true, admin });
  });
});

app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, email, status FROM users', [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err.message);
      return res.status(500).json({ error: 'Failed to fetch users.' });
    }
    res.status(200).json(rows);
  });
});

app.delete('/api/users/:id/ban', (req, res) => {
  const userId = req.params.id;
  db.get('SELECT email FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      console.error('Error fetching user for ban:', err.message);
      return res.status(500).json({ error: 'Failed to ban user.' });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const email = row.email;
    db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
      if (err) {
        console.error('Error deleting user:', err.message);
        return res.status(500).json({ error: 'Failed to ban user.' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }
      db.run('INSERT INTO banned_emails (email) VALUES (?)', [email], function (err) {
        if (err) {
          console.error('Error banning email:', err.message);
          return res.status(500).json({ error: 'Failed to ban user email.' });
        }
        res.status(200).json({ message: 'User banned successfully.' });
      });
    });
  });
});

app.put('/api/users/:id/status', (req, res) => {
  const { status } = req.body;
  const userId = req.params.id;
  db.run('UPDATE users SET status = ? WHERE id = ?', [status, userId], function (err) {
    if (err) {
      console.error('Error updating status:', err.message);
      return res.status(500).json({ error: 'Failed to update status.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ message: 'Status updated.' });
  });
});

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  db.get('SELECT email FROM banned_emails WHERE email = ?', [email], (err, bannedRow) => {
    if (err) {
      console.error('Error checking banned emails:', err.message);
      return res.status(500).json({ error: 'Registration failed.' });
    }
    if (bannedRow) {
      return res.status(403).json({ error: 'Registration blocked: email is banned.' });
    }
    
    // Check if the email is already registered.
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, existingUser) => {
      if (err) {
        console.error('Error checking existing email:', err.message);
        return res.status(500).json({ error: 'Registration failed.' });
      }
      if (existingUser) {
        return res.status(400).json({ error: 'Registration failed: email already registered.' });
      }
      
      // Insert new user if email is not in use.
      db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], function (err) {
        if (err) {
          console.error('Error inserting user:', err.message);
          return res.status(500).json({ error: 'Registration failed. The username might already be taken.' });
        }
        res.status(201).json({ message: 'Registration successful', userId: this.lastID });
      });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Error during login:', err.message);
      return res.status(500).json({ error: 'Login failed' });
    }
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    if (user.password === password) {
      const token = jwt.sign({ userId: user.id, status: user.status }, SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    } else {
      res.status(400).json({ error: 'Incorrect password' });
    }
  });
});

// Initialize SQLite database for forum posts.
const forumDb = new sqlite3.Database('./database/forumListings.db', (err) => {
  if (err) {
    console.error('Error opening forumListings.db:', err.message);
  } else {
    console.log('Connected to the forumListings.db database.');
    const createPostsTable = `
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        username TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        pinned INTEGER DEFAULT 0,
        locked INTEGER DEFAULT 0
      )`;
    createTable(forumDb, createPostsTable, 'posts');

    const createCommentsTable = `
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        username TEXT,
        content TEXT,
        timestamp TEXT,
        FOREIGN KEY (post_id) REFERENCES posts (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`;
    createTable(forumDb, createCommentsTable, 'comments');
  }
});

// API endpoints for forum posts
app.post('/api/posts', (req, res) => {
  const { title, description, username, timestamp } = req.body;
  forumDb.run('INSERT INTO posts (title, description, username, timestamp) VALUES (?, ?, ?, ?)',
    [title, description, username, timestamp],
    function (err) {
      if (err) {
        console.error('Error inserting post:', err.message);
        return res.status(500).json({ error: 'Failed to add post.' });
      }
      res.status(201).json({ message: 'Post added', postId: this.lastID });
    }
  );
});

app.get('/api/posts', (req, res) => {
  forumDb.all('SELECT * FROM posts ORDER BY (pinned * 1) DESC, id DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching posts:', err.message);
      return res.status(500).json({ error: 'Failed to fetch posts.' });
    }
    res.status(200).json(rows);
  });
});

app.get('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  forumDb.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err || !post) {
      return res.status(500).json({ error: 'Failed to fetch post' });
    }
    forumDb.all('SELECT * FROM comments WHERE post_id = ?', [postId], (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch comments' });
      }
      res.json({ post, comments });
    });
  });
});

app.post('/api/posts/:id/comments', (req, res) => {
  const { content, userId, username } = req.body;
  const postId = req.params.id;
  const timestamp = new Date().toLocaleString();
  forumDb.run('INSERT INTO comments (post_id, user_id, username, content, timestamp) VALUES (?, ?, ?, ?, ?)',
    [postId, userId, username, content, timestamp],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to add comment' });
      res.status(201).json({ message: 'Comment added', commentId: this.lastID });
    }
  );
});

app.put('/api/posts/:id/pin', (req, res) => {
  const postId = req.params.id;
  const { pinned } = req.body; // Expecting a boolean value.
  const pinnedValue = pinned ? 1 : 0;
  forumDb.run('UPDATE posts SET pinned = ? WHERE id = ?',
    [pinnedValue, postId],
    function (err) {
      if (err) {
        console.error('Error updating pin status:', err.message);
        return res.status(500).json({ error: 'Failed to update pin status.' });
      }
      res.status(200).json({ message: 'Pin status updated.', pinned: !!pinnedValue });
    }
  );
});

app.put('/api/posts/:id/lock', (req, res) => {
  const postId = req.params.id;
  const { locked } = req.body; // Expecting a boolean value.
  const lockedValue = locked ? 1 : 0;
  forumDb.run('UPDATE posts SET locked = ? WHERE id = ?',
    [lockedValue, postId],
    function (err) {
      if (err) {
        console.error('Error updating locked status:', err.message);
        return res.status(500).json({ error: 'Failed to update locked status.' });
      }
      res.status(200).json({ message: 'Locked status updated.', locked: !!lockedValue });
    }
  );
});

app.delete('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  forumDb.run('DELETE FROM posts WHERE id = ?', [postId], function (err) {
    if (err) {
      console.error('Error deleting post:', err.message);
      return res.status(500).json({ error: 'Failed to delete post.' });
    }
    res.status(200).json({ message: 'Post deleted successfully.' });
  });
});