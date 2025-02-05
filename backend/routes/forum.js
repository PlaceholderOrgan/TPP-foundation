// routes/forum.js
const express = require('express');
const forumDb = require('../db/forumDb');
const { isAdmin } = require('../middlewares/auth');

const router = express.Router();

// Create a post
router.post('/', (req, res) => {
  const { title, description, username, timestamp } = req.body;
  // Removed the hardcoded userId to ensure correct username is saved.
  forumDb.run(
    'INSERT INTO posts (title, content, timestamp, username) VALUES (?, ?, ?, ?)',
    [title, description, timestamp, username],
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
  const { content, userId, timestamp, username } = req.body;
  forumDb.run(
    'INSERT INTO comments (postId, content, userId, timestamp, username) VALUES (?, ?, ?, ?, ?)',
    [postId, content, userId, timestamp, username],
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
  const { pinned } = req.body; // expects a boolean
  forumDb.run('UPDATE posts SET pinned = ? WHERE id = ?', [pinned ? 1 : 0, postId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update pin status' });
    }
    res.json({ message: pinned ? 'Post pinned successfully' : 'Post unpinned successfully' });
  });
});

// Lock a post
router.put('/:id/lock', (req, res) => {
  const postId = req.params.id;
  const { locked } = req.body; // expects a boolean
  forumDb.run('UPDATE posts SET locked = ? WHERE id = ?', [locked ? 1 : 0, postId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update lock status' });
    }
    res.json({ message: locked ? 'Post locked successfully' : 'Post unlocked successfully' });
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

router.delete('/:id/comments/:commentId', isAdmin, (req, res) => {
  const { commentId } = req.params;
  forumDb.run('DELETE FROM comments WHERE id = ?', [commentId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
    res.json({ message: 'Comment deleted successfully' });
  });
});

module.exports = router;
