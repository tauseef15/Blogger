const { verifyToken } = require('../services/auth');

function checkAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    req.user = null; // Treat as guest
    return next();
  }

  try {
    const payload = verifyToken(token);
    req.user = payload; // Authenticated user
  } catch (error) {
    console.error("Token validation error:", error.message);
    req.user = null; // Invalid token, treat as guest
  }

  next(); // Continue either way
}

module.exports = checkAuth;
