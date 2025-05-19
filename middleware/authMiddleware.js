// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { SignUpList } = require('../models/signUpSchema');

const authenticateUser = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated - No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.jwt_secret_key);
    
    // Check if user still exists
    const currentUser = await SignUpList.findById(decoded._id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists'
      });
    }
    
    // Attach user to request
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: 'Not authenticated - Invalid token'
    });
  }
};

module.exports = authenticateUser;