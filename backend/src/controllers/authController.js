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
    const { email, password, firstName, lastName } = req.body;

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

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: 'TEAM_MEMBER', // Default registration role
      },
    });

    const token = generateToken(user);

    // Track registration in activity log
    await prisma.activityLog.create({
      data: {
        action: `New user account registered for ${user.firstName} ${user.lastName}.`,
        userId: user.id,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      token,
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

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
};
