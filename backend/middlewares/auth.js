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

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1]; // Assuming "Bearer <token>" format

  if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
          return res.status(401).json({ error: 'Invalid token' });
      }

      // Attach user information to the request object
      req.user = {
          userId: decoded.userId,
          username: decoded.username,
          status: decoded.status,
          status_message: decoded.status_message,
          description: decoded.description
      };
      next();
  });
};
module.exports = { isAdmin, authenticate};
