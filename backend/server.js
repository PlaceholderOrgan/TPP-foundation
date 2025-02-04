// server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PORT, ALLOWED_ORIGINS, SECRET_KEY } = require('./config');

// Import route modules
const usersRoutes = require('./routes/users');
const forumRoutes = require('./routes/forum');
const articlesRoutes = require('./routes/articles');
const faqRoutes = require('./routes/faq');

const app = express();

// Global middleware
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));
app.use(express.json());

// Standalone auth endpoint (preserving original URL)
app.post('/api/validate-token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token missing' });
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.json({ valid: true, admin: decoded.status === 'admin', decoded });
  });
});

// Mount API routes
app.use('/api/users', usersRoutes);
app.use('/api/posts', forumRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/faq', faqRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
