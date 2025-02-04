// db/usersDb.js
const sqlite3 = require('sqlite3').verbose();
const { createTable, generatePassword } = require('../utils/dbUtils');

const db = new sqlite3.Database('./database/users.db', (err) => {
  if (err) {
    console.error('Error opening users.db:', err.message);
  } else {
    console.log('Connected to the users.db database.');
    createTable(
      db,
      `CREATE TABLE IF NOT EXISTS users (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         username TEXT UNIQUE,
         password TEXT,
         status TEXT DEFAULT 'user'
       )`,
      'users',
      setupAdminUser
    );
  }
});

const setupAdminUser = () => {
  const adminPassword = generatePassword();
  db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (err) {
      console.error('Error checking admin user:', err.message);
      return;
    }
    if (row) {
      // Update existing admin
      db.run(
        'UPDATE users SET password = ?, status = ? WHERE username = ?',
        [adminPassword, 'admin', 'admin']
      );
    } else {
      // Create new admin
      db.run(
        'INSERT INTO users (username, password, status) VALUES (?, ?, ?)',
        ['admin', adminPassword, 'admin']
      );
    }
    console.log('----------------------------------------');
    console.log('Admin account created/updated');
    console.log('Username: admin');
    console.log('Password:', adminPassword);
    console.log('----------------------------------------');
  });
};

module.exports = db;
