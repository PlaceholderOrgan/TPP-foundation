// config.js
module.exports = {
    PORT: process.env.PORT || 5000,
    SECRET_KEY: 'your_secret_key', // Use a secure key in production
    ALLOWED_ORIGINS: ['http://localhost:3000', 'http://spackcloud.duckdns.org:3000']
  };
  