const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; // Use a secure key in production

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://spackcloud.duckdns.org:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Helper to create tables
const createTable = (db, query, tableName, callback) => {
  db.run(query, (err) => {
    if (err) {
      console.error(`Failed to create table '${tableName}':`, err.message);
    } else {
      console.log(`Table '${tableName}' created or already exists.`);
    }
    if (callback) callback();
  });
};

// Initialize SQLite database for users
const usersDb = new sqlite3.Database('./database/users.db', (err) => {
  if (err) {
    console.error('Error opening users.db:', err.message);
  } else {
    console.log('Connected to the users.db database.');
    createTable(
      usersDb,
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        status TEXT DEFAULT 'user'
       )`,
      'users',
      setupAdminUser // Add as callback
    );
  }
});

// Initialize SQLite database for forum posts
const forumDb = new sqlite3.Database('./database/forumListings.db', (err) => {
  if (err) {
    console.error('Error opening forumListings.db:', err.message);
  } else {
    console.log('Connected to the forumListings.db database.');
    createTable(
      forumDb,
      `CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        userId INTEGER,
        timestamp TEXT,
        pinned INTEGER DEFAULT 0,
        locked INTEGER DEFAULT 0
      )`,
      'posts'
    );
    createTable(
      forumDb,
      `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        postId INTEGER,
        content TEXT,
        userId INTEGER,
        timestamp TEXT
      )`,
      'comments'
    );
  }
});

// Initialize SQLite database for articles
const articlesDb = new sqlite3.Database('./database/articles.db', (err) => {
  if (err) {
    console.error('Error opening articles.db:', err.message);
  } else {
    console.log('Connected to the articles.db database.');
    createTable(
      articlesDb,
      `CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        userId INTEGER,
        timestamp TEXT
      )`,
      'articles'
    );
  }
});

// Initialize SQLite database for FAQ
const faqDb = new sqlite3.Database('./database/faq.db', (err) => {
  if (err) {
    console.error('Error opening faq.db:', err.message);
  } else {
    console.log('Connected to the faq.db database.');
    createTable(
      faqDb,
      `CREATE TABLE IF NOT EXISTS faq (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT,
        answer TEXT
      )`,
      'faq'
    );
  }
});

const generatePassword = (length = 12) => {
  return crypto.randomBytes(length)
    .toString('base64')
    .slice(0, length)
    .replace(/[/+=]/g, '!'); // Replace URL-unsafe chars
};

const setupAdminUser = () => {
  const adminPassword = generatePassword();
  usersDb.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (err) {
      console.error('Error checking admin user:', err.message);
      return;
    }
    
    if (row) {
      // Update existing admin
      usersDb.run('UPDATE users SET password = ?, status = ? WHERE username = ?', 
        [adminPassword, 'admin', 'admin']);
    } else {
      // Create new admin
      usersDb.run('INSERT INTO users (username, password, status) VALUES (?, ?, ?)',
        ['admin', adminPassword, 'admin']);
    }
    
    console.log('----------------------------------------');
    console.log('Admin account created/updated');
    console.log('Username: admin');
    console.log('Password:', adminPassword);
    console.log('----------------------------------------');
  });
};



// API endpoints for users
app.post('/api/validate-token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token missing' });
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.json({ valid: true, decoded });
  });
});

app.get('/api/users', (req, res) => {
  usersDb.all('SELECT id, username, status FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
    res.json(rows);
  });
});

app.delete('/api/users/:id/ban', (req, res) => {
  const userId = req.params.id;
  usersDb.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to ban user' });
    }
    res.json({ message: 'User banned successfully' });
  });
});

app.put('/api/users/:id/status', (req, res) => {
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

app.post('/api/register', (req, res) => {
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

app.post('/api/login', (req, res) => {
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

// API endpoints for forum posts
app.post('/api/posts', (req, res) => {
  const { title, content, userId, timestamp } = req.body;
  forumDb.run(
    'INSERT INTO posts (title, content, userId, timestamp) VALUES (?, ?, ?, ?)',
    [title, content, userId, timestamp],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create post' });
      }
      res.status(201).json({ message: 'Post created', postId: this.lastID });
    }
  );
});

app.get('/api/posts', (req, res) => {
  forumDb.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve posts' });
    }
    res.json(rows);
  });
});

app.get('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  forumDb.get('SELECT * FROM posts WHERE id = ?', [postId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve post' });
    }
    res.json(row);
  });
});

app.post('/api/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  const { content, userId, timestamp } = req.body;
  forumDb.run(
    'INSERT INTO comments (postId, content, userId, timestamp) VALUES (?, ?, ?, ?)',
    [postId, content, userId, timestamp],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add comment' });
      }
      res.status(201).json({ message: 'Comment added', commentId: this.lastID });
    }
  );
});

app.put('/api/posts/:id/pin', (req, res) => {
  const postId = req.params.id;
  forumDb.run('UPDATE posts SET pinned = 1 WHERE id = ?', [postId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to pin post' });
    }
    res.json({ message: 'Post pinned successfully' });
  });
});

app.put('/api/posts/:id/lock', (req, res) => {
  const postId = req.params.id;
  forumDb.run('UPDATE posts SET locked = 1 WHERE id = ?', [postId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to lock post' });
    }
    res.json({ message: 'Post locked successfully' });
  });
});

app.delete('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  forumDb.run('DELETE FROM posts WHERE id = ?', [postId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete post' });
    }
    res.json({ message: 'Post deleted successfully' });
  });
});

// API endpoints for articles
app.post('/api/articles', (req, res) => {
  const { title, content, userId, timestamp } = req.body;
  articlesDb.run(
    'INSERT INTO articles (title, content, userId, timestamp) VALUES (?, ?, ?, ?)',
    [title, content, userId, timestamp],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create article' });
      }
      res.status(201).json({ message: 'Article created', articleId: this.lastID });
    }
  );
});

app.get('/api/articles', (req, res) => {
  articlesDb.all('SELECT * FROM articles', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve articles' });
    }
    res.json(rows);
  });
});

// Middleware to check for admin
const isAdmin = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (decoded.status !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden' });
    }
    next();
  });
};

// API endpoints for FAQ
app.get('/api/faq', (req, res) => {
  faqDb.all('SELECT * FROM faq', [], (err, rows) => {
    if (err) {
      console.error('Error fetching FAQs:', err);
      return res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
    res.json(rows);
  });
});

app.post('/api/faq', isAdmin, (req, res) => {
  const { question, answer } = req.body;
  faqDb.run(
    'INSERT INTO faq (question, answer) VALUES (?, ?)',
    [question, answer],
    function (err) {
      if (err) {
        console.error('Error adding FAQ:', err.message);
        return res.status(500).json({ error: 'Failed to add FAQ' });
      }
      res.status(201).json({ message: 'FAQ added', faqId: this.lastID });
    }
  );
});

app.put('/api/faq/:id', isAdmin, (req, res) => {
  const faqId = req.params.id;
  const { question, answer } = req.body;
  faqDb.run(
    'UPDATE faq SET question = ?, answer = ? WHERE id = ?',
    [question, answer, faqId],
    function (err) {
      if (err) {
        console.error('Error updating FAQ:', err.message);
        return res.status(500).json({ error: 'Failed to update FAQ' });
      }
      res.json({ message: 'FAQ updated successfully' });
    }
  );
});

app.delete('/api/faq/:id', isAdmin, (req, res) => {
  const faqId = req.params.id;
  faqDb.run('DELETE FROM faq WHERE id = ?', [faqId], function (err) {
    if (err) {
      console.error('Error deleting FAQ:', err.message);
      return res.status(500).json({ error: 'Failed to delete FAQ' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  });
});