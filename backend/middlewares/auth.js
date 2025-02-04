// middlewares/auth.js
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

const isAdmin = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (decoded.status !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden' });
    }
    next();
  });
};

module.exports = { isAdmin };
