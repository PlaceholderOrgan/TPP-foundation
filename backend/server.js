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
      return res.status(200).json({ message: 'Login successful', userId: user.id });
    } else {
      return res.status(400).json({ error: 'Incorrect password' });
    }
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
      `CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        timestamp TEXT
      )`,
      (tableErr) => {
        if (tableErr) console.error('Error creating posts table:', tableErr.message);
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