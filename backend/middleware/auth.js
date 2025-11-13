// =======================
// AUTH MIDDLEWARE
// =======================
// This runs BEFORE shift routes to verify the user is logged in
// It checks the JWT token and adds user info to the request

const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    // Step 1: Get token from Authorization header
    // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided or wrong format
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Step 2: Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];
    
    // Step 3: Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // If token is valid, decoded = { userId: "abc123", iat: 1234567890, exp: 9876543210 }
    // If token is invalid/expired, jwt.verify() throws an error (caught below)
    
    // Step 4: Add user ID to request object
    req.userId = decoded.userId;
    // Now all routes can access req.userId to know who's logged in!
    
    // Step 5: Continue to the actual route
    next();
    
  } catch (error) {
    // Token verification failed (invalid or expired)
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;