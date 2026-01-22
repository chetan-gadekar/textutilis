const jwt = require('jsonwebtoken');
const User = require('../schemas/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_change_in_production');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated',
        });
      }

      // For students: Check if session token matches (single device login)
      if (req.user.role === 'student') {
        if (!decoded.sessionToken || decoded.sessionToken !== req.user.sessionToken) {
          return res.status(401).json({
            success: false,
            message: 'Session expired. You have been logged in from another device.',
            code: 'SESSION_INVALIDATED',
          });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Generate JWT Token
const generateToken = (id, sessionToken = null) => {
  const payload = { id };
  if (sessionToken) {
    payload.sessionToken = sessionToken;
  }
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key_change_in_production', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = {
  protect,
  authorize,
  generateToken,
};
