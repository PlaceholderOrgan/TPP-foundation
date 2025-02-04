// routes/forum.js
const express = require('express');
const forumDb = require('../db/forumDb');

const router = express.Router();

// Create a post
router.post('/', (req, res) => {
  // Expect title, description (for content), username, and timestamp from client.
  const { title, description, username, timestamp } = req.body;
  // Default userId to 1 or adjust according to your auth system.
  const userId = 1;
  forumDb.run(
    'INSERT INTO posts (title, content, userId, timestamp, username) VALUES (?, ?, ?, ?, ?)',
    [title, description, userId, timestamp, username],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create post' });
      }
      res.status(201).json({ message: 'Post created', postId: this.lastID });
    }
  );
});

// Get all posts
router.get('/', (req, res) => {
  forumDb.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve posts' });
    }
    res.json(rows);
  });
});

// Get a single post
router.get('/:id', (req, res) => {
  const postId = req.params.id;
  forumDb.get('SELECT * FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve post' });
    }
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    forumDb.all('SELECT * FROM comments WHERE postId = ?', [postId], (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to retrieve comments' });
      }
      res.json({ post, comments });
    });
  });
});

// Add a comment to a post
router.post('/:id/comments', (req, res) => {
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

// Pin a post
router.put('/:id/pin', (req, res) => {
  const postId = req.params.id;
  forumDb.run('UPDATE posts SET pinned = 1 WHERE id = ?', [postId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to pin post' });
    }
    res.json({ message: 'Post pinned successfully' });
  });
});

// Lock a post
router.put('/:id/lock', (req, res) => {
  const postId = req.params.id;
  forumDb.run('UPDATE posts SET locked = 1 WHERE id = ?', [postId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to lock post' });
    }
    res.json({ message: 'Post locked successfully' });
  });
});

// Delete a post
router.delete('/:id', (req, res) => {
  const postId = req.params.id;
  forumDb.run('DELETE FROM posts WHERE id = ?', [postId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete post' });
    }
    res.json({ message: 'Post deleted successfully' });
  });
});

module.exports = router;
