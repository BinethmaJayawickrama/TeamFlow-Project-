const prisma = require('../utils/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

/**
 * User Login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact the administrator.' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    // Track login in activity log
    await prisma.activityLog.create({
      data: {
        action: `User ${user.firstName} ${user.lastName} logged in.`,
        userId: user.id,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

/**
 * Public Registration (Default role is TEAM_MEMBER)
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await hashPassword(password);

    // Filter role to ensure only valid roles are registered publicly (cannot self-register as ADMIN)
    const assignedRole = (role === 'PROJECT_MANAGER' || role === 'TEAM_MEMBER') ? role : 'TEAM_MEMBER';

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: assignedRole,
      },
    });

    const token = generateToken(user);

    // Send real welcome email to user inbox asynchronously using Nodemailer SMTP
    const { sendWelcomeEmail } = require('../services/email');
    sendWelcomeEmail(user.email, user.firstName, user.role);

    // Track registration in activity log
    await prisma.activityLog.create({
      data: {
        action: `New user account registered for ${user.firstName} ${user.lastName}. Welcome email dispatched to ${user.email}.`,
        userId: user.id,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      token,
      emailSent: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    // req.user is set by authenticate middleware
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error retrieving profile.' });
  }
};

/**
 * Update current user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, avatar } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        avatar: avatar || undefined,
      },
    });

    // Track update in activity log
    await prisma.activityLog.create({
      data: {
        action: `User ${updatedUser.firstName} ${updatedUser.lastName} updated their profile.`,
        userId: userId,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

/**
 * Request Password Reset Token
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't leak registered emails status, act as if success
      return res.json({ message: 'Password reset instructions sent.' });
    }

    // Generate a short-lived token (15 mins) specifically for reset
    const jwt = require('jsonwebtoken');
    const resetToken = jwt.sign(
      { id: user.id, purpose: 'reset-password' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    );

    // Track forgot password request in log
    await prisma.activityLog.create({
      data: {
        action: `User ${user.firstName} ${user.lastName} requested password reset.`,
        userId: user.id,
      },
    });

    // In a real application, you would trigger the email sender service here.
    // For local mock verification, we'll return the token so the UI can use it.
    res.json({
      message: 'Password reset instructions sent.',
      resetToken, // Returned for dev testing convenience
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error during forgot password.' });
  }
};

/**
 * Complete Password Reset
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    if (decoded.purpose !== 'reset-password') {
      return res.status(400).json({ message: 'Invalid reset token.' });
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    // Track password reset completion in activity logs
    await prisma.activityLog.create({
      data: {
        action: `User ${updatedUser.firstName} ${updatedUser.lastName} successfully reset their password.`,
        userId: updatedUser.id,
      },
    });

    res.json({ message: 'Password has been successfully updated.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};
