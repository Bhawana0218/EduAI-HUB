const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many AI requests, try later',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = aiLimiter;
