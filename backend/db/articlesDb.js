// db/articlesDb.js
const sqlite3 = require('sqlite3').verbose();
const { createTable } = require('../utils/dbUtils');

const db = new sqlite3.Database('./database/articles.db', (err) => {
  if (err) {
    console.error('Error opening articles.db:', err.message);
  } else {
    console.log('Connected to the articles.db database.');
    createTable(
      db,
      `CREATE TABLE IF NOT EXISTS articles (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         title TEXT,
         description TEXT,
         content TEXT,
         author TEXT,
         timestamp TEXT
       )`,
      'articles'
    );
  }
});

module.exports = db;
