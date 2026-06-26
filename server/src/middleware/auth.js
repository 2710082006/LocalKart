const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ================================
// Protect routes - verify JWT token
// ================================
exports.protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Or from cookies
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // No token found
  if (!token) {
    console.log('NO TOKEN FOUND');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    );

    console.log('DECODED TOKEN:', decoded);

    // Find user
    req.user = await User.findById(decoded.id);

    console.log('AUTH USER:', req.user);

    // User not found
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Suspended account
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended',
      });
    }

    console.log('AUTH ROLE:', req.user.role);

    next();
  } catch (error) {
    console.log('JWT ERROR:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// ================================
// Role-based access control
// ================================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('USER ROLE:', req.user?.role);
    console.log('ALLOWED ROLES:', roles);

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

// ================================
// Forbid specific roles
// ================================
exports.forbidRole = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

// ================================
// Optional auth
// ================================
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret'
      );

      req.user = await User.findById(decoded.id);

      console.log('OPTIONAL AUTH USER:', req.user);
    } catch (error) {
      console.log('OPTIONAL AUTH ERROR:', error.message);
    }
  }

  next();
};