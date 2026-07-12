const prisma = require('../utils/db');

/**
 * Get statistical cards and chart data for the Admin Dashboard
 */
const getAdminDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProjects = await prisma.project.count();
    const completedProjects = await prisma.project.count({
      where: { status: 'COMPLETED' },
    });
    const pendingTasks = await prisma.task.count({
      where: { status: { not: 'COMPLETED' } },
    });

    // Chart Data: Tasks by status
    const tasks = await prisma.task.findMany({ select: { status: true } });
    const statusCounts = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, COMPLETED: 0 };
    tasks.forEach((t) => {
      if (statusCounts[t.status] !== undefined) {
        statusCounts[t.status]++;
      }
    });

    // Chart Data: Project progress distribution
    const projects = await prisma.project.findMany({
      include: { tasks: { select: { status: true } } },
    });

    const progressDistribution = { '0-25%': 0, '26-50%': 0, '51-75%': 0, '76-100%': 0 };
    projects.forEach((proj) => {
      const total = proj.tasks.length;
      if (total === 0) {
        progressDistribution['0-25%']++;
        return;
      }
      const completed = proj.tasks.filter((t) => t.status === 'COMPLETED').length;
      const pct = (completed / total) * 100;
      if (pct <= 25) progressDistribution['0-25%']++;
      else if (pct <= 50) progressDistribution['26-50%']++;
      else if (pct <= 75) progressDistribution['51-75%']++;
      else progressDistribution['76-100%']++;
    });

    res.json({
      stats: {
        totalUsers,
        totalProjects,
        completedProjects,
        pendingTasks,
      },
      charts: {
        tasksByStatus: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
        projectsByProgress: Object.entries(progressDistribution).map(([name, value]) => ({ name, value })),
      },
    });
  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Server error retrieving admin statistics.' });
  }
};

/**
 * Get statistical cards and upcoming lists for the Project Manager Dashboard
 */
const getPMDashboardStats = async (req, res) => {
  try {
    const pmId = req.user.id;

    // Projects managed by this PM
    const managedProjects = await prisma.project.findMany({
      where: { creatorId: pmId },
      include: {
        tasks: {
          select: { status: true, dueDate: true },
        },
      },
    });

    const totalProjects = managedProjects.length;

    // Task counts
    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    const statusCounts = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, COMPLETED: 0 };

    managedProjects.forEach((proj) => {
      proj.tasks.forEach((task) => {
        totalTasks++;
        if (task.status === 'COMPLETED') completedTasks++;
        else pendingTasks++;

        if (statusCounts[task.status] !== undefined) {
          statusCounts[task.status]++;
        }
      });
    });

    // Upcoming deadlines in managed projects (not completed, due in next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        project: { creatorId: pmId },
        status: { not: 'COMPLETED' },
        dueDate: {
          gte: new Date(),
          lte: sevenDaysFromNow,
        },
      },
      include: {
        project: { select: { name: true } },
        assignee: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        teamProgressPercent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      upcomingDeadlines,
      charts: {
        tasksByStatus: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      },
    });
  } catch (error) {
    console.error('PM Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Server error retrieving manager dashboard statistics.' });
  }
};

/**
 * Get detailed project report
 */
const getProjectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid Project ID.' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: {
            assignee: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Task metric counts
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
    const pendingTasks = totalTasks - completedTasks;
    
    const now = new Date();
    const overdueTasks = project.tasks.filter(
      (t) => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    // Team Performance Metrics (Tasks assigned vs completed per member)
    const teamPerformance = project.members.map((member) => {
      const userTasks = project.tasks.filter((t) => t.assigneeId === member.userId);
      const total = userTasks.length;
      const completed = userTasks.filter((t) => t.status === 'COMPLETED').length;
      const pending = total - completed;
      const overdue = userTasks.filter(
        (t) => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < now
      ).length;

      return {
        userId: member.userId,
        userName: `${member.user.firstName} ${member.user.lastName}`,
        avatar: member.user.avatar,
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: pending,
        overdueTasks: overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    res.json({
      projectId,
      projectName: project.name,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        projectProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      teamPerformance,
    });
  } catch (error) {
    console.error('Project Report Error:', error);
    res.status(500).json({ message: 'Server error generating project report.' });
  }
};

module.exports = {
  getAdminDashboardStats,
  getPMDashboardStats,
  getProjectReport,
};
