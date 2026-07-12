const bcrypt = require('bcryptjs');

/**
 * Hash a plain text password.
 * @param {string} password 
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare plain text password with a hashed password.
 * @param {string} password 
 * @param {string} hashed 
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hashed) => {
  return bcrypt.compare(password, hashed);
};

module.exports = {
  hashPassword,
  comparePassword,
};
