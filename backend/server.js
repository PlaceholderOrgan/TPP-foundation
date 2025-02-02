// Import necessary dependencies.
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Initialize the Express app.
const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware.
app.use(cors()); // Enable CORS for cross-origin requests.
app.use(express.json()); // Enable parsing of JSON bodies.

// Start the server.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Initialize SQLite database connection for users.
const db = new sqlite3.Database('./database/users.db', (err) => {
  if (err) {
    console.error('Error opening users.db:', err.message);
  } else {
    console.log('Connected to the users.db database.');
    // Create the 'users' table if it does not exist.
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT,
        password TEXT
      )`,
      (tableErr) => {
        if (tableErr) console.error('Error creating users table:', tableErr.message);
      }
    );
  }
});

// API endpoint for user registration.
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, password],
    function (err) {
      if (err) {
        console.error('Error inserting user:', err.message);
        return res.status(500).json({ error: 'Registration failed. The username might already be taken.' });
      }
      res.status(201).json({ message: 'Registration successful', userId: this.lastID });
    }
  );
});

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'A1B2C3-D4E5F6-G7H8I9-J0K1L2'; // Use a secure key in production

// API endpoint for user login.
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
      const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Login successful', token });
    } else {
      return res.status(400).json({ error: 'Incorrect password' });
    }
  });
});

app.post('/api/validate-token', (req, res) => {
  const { token } = req.body;
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ valid: false });
    }
    return res.status(200).json({ valid: true });
  });
});

// Initialize SQLite database connection for forum posts.
const forumDb = new sqlite3.Database('./database/forumListings.db', (err) => {
  if (err) {
    console.error('Error opening forumListings.db:', err.message);
  } else {
    console.log('Connected to the forumListings.db database.');
    // Create the 'posts' table if it does not exist (now with title & description).
    forumDb.run(
      `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        username TEXT,
        content TEXT,
        timestamp TEXT,
        FOREIGN KEY (post_id) REFERENCES posts (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      (tableErr) => {
        if (tableErr) console.error('Error creating comments table:', tableErr.message);
      }
    );
  }
});

// API endpoint for adding forum posts (with title & description).
app.post('/api/posts', (req, res) => {
  const { title, description, timestamp } = req.body;
  forumDb.run(
    'INSERT INTO posts (title, description, timestamp) VALUES (?, ?, ?)',
    [title, description, timestamp],
    function (err) {
      if (err) {
        console.error('Error inserting post:', err.message);
        return res.status(500).json({ error: 'Failed to add post.' });
      }
      res.status(201).json({ message: 'Post added', postId: this.lastID });
    }
  );
});

// API endpoint for retrieving forum posts.
app.get('/api/posts', (req, res) => {
  forumDb.all('SELECT * FROM posts ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching posts:', err.message);
      return res.status(500).json({ error: 'Failed to fetch posts.' });
    }
    res.status(200).json(rows);
  });
});

// Get single post with comments
app.get('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  forumDb.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch post' });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    forumDb.all('SELECT * FROM comments WHERE post_id = ? ORDER BY timestamp DESC', [postId], (err, comments) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch comments' });
      res.json({ post, comments });
    });
  });
});

// Add comment
app.post('/api/posts/:id/comments', (req, res) => {
  const { content, userId, username } = req.body;
  const postId = req.params.id;
  const timestamp = new Date().toLocaleString();

  forumDb.run(
    'INSERT INTO comments (post_id, user_id, username, content, timestamp) VALUES (?, ?, ?, ?, ?)',
    [postId, userId, username, content, timestamp],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to add comment' });
      res.status(201).json({ message: 'Comment added', commentId: this.lastID });
    }
  );
});