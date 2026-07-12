const prisma = require('../utils/db');
const { hashPassword } = require('../utils/hash');

/**
 * Get all users in the system (Admin only)
 */
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
      },
    });
    res.json({ users });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Server error retrieving users list.' });
  }
};

/**
 * Admin creates a user with any role
 */
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, isActive } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'All fields (email, password, firstName, lastName, role) are required.' });
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
        role,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    // Log admin action
    await prisma.activityLog.create({
      data: {
        action: `Administrator ${req.user.firstName} ${req.user.lastName} created user account for ${user.firstName} ${user.lastName} (${user.role}).`,
        userId: req.user.id,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ message: 'Server error creating user.' });
  }
};

/**
 * Admin updates user details, roles, or status
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName, role, isActive } = req.body;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid User ID.' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if email already taken by someone else
    if (email && email.toLowerCase() !== user.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (emailTaken) {
        return res.status(400).json({ message: 'Email is already in use by another user.' });
      }
    }

    // Prepare data object
    const updateData = {};
    if (email) updateData.email = email.toLowerCase();
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Log admin action
    await prisma.activityLog.create({
      data: {
        action: `Administrator ${req.user.firstName} ${req.user.lastName} updated user account of ${updatedUser.firstName} ${updatedUser.lastName}.`,
        userId: req.user.id,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Server error updating user.' });
  }
};

/**
 * Admin deletes a user
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid User ID.' });
    }

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Self-deletion is not allowed.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await prisma.user.delete({ where: { id: userId } });

    // Log admin action
    await prisma.activityLog.create({
      data: {
        action: `Administrator ${req.user.firstName} ${req.user.lastName} deleted user account of ${user.firstName} ${user.lastName}.`,
        userId: req.user.id,
      },
    });

    res.json({ message: `User ${user.firstName} ${user.lastName} has been deleted successfully.` });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
