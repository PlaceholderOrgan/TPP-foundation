// routes/articles.js
const express = require('express');
const articlesDb = require('../db/articlesDb');

const router = express.Router();

// Create an article
router.post('/', (req, res) => {
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

// Get all articles
router.get('/', (req, res) => {
  articlesDb.all('SELECT * FROM articles', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve articles' });
    }
    res.json(rows);
  });
});

module.exports = router;
