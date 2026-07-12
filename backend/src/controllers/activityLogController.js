const prisma = require('../utils/db');

/**
 * Get system activity logs
 * - Admins can see all logs.
 * - Others can see logs associated with their projects or operations.
 * - For simplicity, we can return the global logs list to PMs/Admins, and personal logs to Members.
 */
const getActivityLogs = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let logs;

    if (role === 'ADMIN' || role === 'PROJECT_MANAGER') {
      // Admins and PMs see everything to monitor systems/teams
      logs = await prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, role: true, avatar: true },
          },
        },
      });
    } else {
      // Members see their own activity logs
      logs = await prisma.activityLog.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, role: true, avatar: true },
          },
        },
      });
    }

    res.json({ logs });
  } catch (error) {
    console.error('Get Activity Logs Error:', error);
    res.status(500).json({ message: 'Server error retrieving activity logs.' });
  }
};

module.exports = {
  getActivityLogs,
};
