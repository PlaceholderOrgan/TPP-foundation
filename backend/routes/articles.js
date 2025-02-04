// routes/articles.js
const express = require('express');
const articlesDb = require('../db/articlesDb');

const router = express.Router();

// Create an article
router.post('/', (req, res) => {
  const { title, description, content, author, timestamp } = req.body;
  articlesDb.run(
    'INSERT INTO articles (title, description, content, author, timestamp) VALUES (?, ?, ?, ?, ?)',
    [title, description, content, author, timestamp],
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

// Add new DELETE route at the end of the file
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  articlesDb.run('DELETE FROM articles WHERE id = ?', id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete article' });
    }
    res.json({ message: 'Article deleted' });
  });
});

module.exports = router;
