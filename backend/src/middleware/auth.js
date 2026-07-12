const { verifyToken } = require('../utils/jwt');
const prisma = require('../utils/db');

/**
 * Middleware to authenticate requests using JWT.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Token missing.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    // Fetch user from db to confirm they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is deactivated. Contact Admin.' });
    }

    // Attach user to request object (exclude password for security)
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

/**
 * Middleware to restrict route access by user role.
 * @param {...string} allowedRoles - Roles allowed to access the route.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User context missing. Make sure authenticate middleware is applied.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
