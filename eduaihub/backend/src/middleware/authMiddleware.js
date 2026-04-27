const jwt = require('jsonwebtoken');

const getTokenFromCookieHeader = (cookieHeader = '') => {
  return cookieHeader
    .split(';')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith('admin_token='))
    ?.split('=')[1];
};

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = getTokenFromCookieHeader(req.headers.cookie || '');

    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // contains admin id
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
