const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'teamflow_jwt_secret_token_key_12345!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a user.
 * @param {object} user 
 * @returns {string}
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Verify a JWT token.
 * @param {string} token 
 * @returns {object} Payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
