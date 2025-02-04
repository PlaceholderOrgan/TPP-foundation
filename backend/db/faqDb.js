// db/faqDb.js
const sqlite3 = require('sqlite3').verbose();
const { createTable } = require('../utils/dbUtils');

const db = new sqlite3.Database('./database/faq.db', (err) => {
  if (err) {
    console.error('Error opening faq.db:', err.message);
  } else {
    console.log('Connected to the faq.db database.');
    createTable(
      db,
      `CREATE TABLE IF NOT EXISTS faq (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         question TEXT,
         answer TEXT
       )`,
      'faq'
    );
  }
});

module.exports = db;
