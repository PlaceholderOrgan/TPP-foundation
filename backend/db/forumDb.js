// db/forumDb.js
const sqlite3 = require('sqlite3').verbose();
const { createTable } = require('../utils/dbUtils');

const db = new sqlite3.Database('./database/forumListings.db', (err) => {
  if (err) {
    console.error('Error opening forumListings.db:', err.message);
  } else {
    console.log('Connected to the forumListings.db database.');
    createTable(
      db,
      `CREATE TABLE IF NOT EXISTS posts (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         title TEXT,
         content TEXT,
         userId INTEGER,
         timestamp TEXT,
         username TEXT,
         pinned INTEGER DEFAULT 0,
         locked INTEGER DEFAULT 0
       )`,
      'posts'
    );
    createTable(
      db,
      `CREATE TABLE IF NOT EXISTS comments (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         postId INTEGER,
         content TEXT,
         userId INTEGER,
         timestamp TEXT,
         username TEXT
       )`,
      'comments'
    );
  }
});

module.exports = db;
