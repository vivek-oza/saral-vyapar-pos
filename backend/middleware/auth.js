const jwt = require('jsonwebtoken');
const { getQuery } = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database to ensure they still exist
    const user = await getQuery('users', { id: decoded.userId }, 'id, email, email_verified');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Email not verified. Please verify your email first.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await getQuery('users', { id: decoded.userId }, 'id, email, email_verified');

      if (user && user.email_verified) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // For optional auth, we just continue without setting req.user
    next();
  }
};

module.exports = { auth, optionalAuth };
