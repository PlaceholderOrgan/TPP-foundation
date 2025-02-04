// routes/faq.js
const express = require('express');
const faqDb = require('../db/faqDb');
const { isAdmin } = require('../middlewares/auth');

const router = express.Router();

// Get all FAQs
router.get('/', (req, res) => {
  faqDb.all('SELECT * FROM faq', [], (err, rows) => {
    if (err) {
      console.error('Error fetching FAQs:', err);
      return res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
    res.json(rows);
  });
});

// Add a new FAQ (admin only)
router.post('/', isAdmin, (req, res) => {
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

// Update an FAQ (admin only)
router.put('/:id', isAdmin, (req, res) => {
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

// Delete an FAQ (admin only)
router.delete('/:id', isAdmin, (req, res) => {
  const faqId = req.params.id;
  faqDb.run('DELETE FROM faq WHERE id = ?', [faqId], function (err) {
    if (err) {
      console.error('Error deleting FAQ:', err.message);
      return res.status(500).json({ error: 'Failed to delete FAQ' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  });
});

module.exports = router;
