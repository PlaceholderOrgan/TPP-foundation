// utils/dbUtils.js
const crypto = require('crypto');

const createTable = (db, query, tableName, callback) => {
  db.run(query, (err) => {
    if (err) {
      console.error(`Failed to create table '${tableName}':`, err.message);
    } else {
      console.log(`Table '${tableName}' created or already exists.`);
    }
    if (callback) callback();
  });
};

const generatePassword = (length = 12) => {
  return crypto.randomBytes(length)
    .toString('base64')
    .slice(0, length)
    .replace(/[/+=]/g, '!');
};

module.exports = { createTable, generatePassword };
