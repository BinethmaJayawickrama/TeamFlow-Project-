const prisma = require('../utils/db');

/**
 * Create a new Project (Admin or Project Manager)
 */
const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status } = req.body;
    const creatorId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'ACTIVE',
        creatorId,
      },
    });

    // Automatically add the creator as a project member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: creatorId,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: `Project Manager ${req.user.firstName} ${req.user.lastName} created project "${name}".`,
        userId: creatorId,
      },
    });

    res.status(201).json({ project });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ message: 'Server error creating project.' });
  }
};

/**
 * Get projects matching user role permissions
 */
const getProjects = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let projects;

    if (role === 'ADMIN') {
      // Admins see all projects
      projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          _count: { select: { members: true, tasks: true } },
        },
      });
    } else {
      // PMs and Members see projects they are assigned to
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: { userId: userId },
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          _count: { select: { members: true, tasks: true } },
        },
      });
    }

    // Enhance response with progress calculations
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const tasks = await prisma.task.findMany({
          where: { projectId: project.id },
          select: { status: true },
        });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project,
          progress,
          totalTasks,
          completedTasks,
        };
      })
    );

    res.json({ projects: projectsWithProgress });
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({ message: 'Server error retrieving projects.' });
  }
};

/**
 * Get project by ID (Must be member or admin)
 */
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid Project ID.' });
    }

    // Verify membership if not Admin
    if (userRole !== 'ADMIN') {
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId },
        },
      });

      if (!membership) {
        return res.status(403).json({ message: 'Access Denied. You are not a member of this project.' });
      }
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
            },
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Calculate progress
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      project: {
        ...project,
        progress,
        totalTasks,
        completedTasks,
      },
    });
  } catch (error) {
    console.error('Get Project By ID Error:', error);
    res.status(500).json({ message: 'Server error retrieving project details.' });
  }
};

/**
 * Update Project Details (Creator PM or Admin)
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, status } = req.body;
    const projectId = parseInt(id);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid Project ID.' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Check authority: must be Admin OR the creator PM
    if (userRole !== 'ADMIN' && project.creatorId !== userId) {
      return res.status(403).json({ message: 'Access Denied. Only the project creator or Admin can edit project details.' });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status: status || undefined,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: `User ${req.user.firstName} ${req.user.lastName} updated project "${updatedProject.name}".`,
        userId,
      },
    });

    res.json({ project: updatedProject });
  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({ message: 'Server error updating project.' });
  }
};

/**
 * Delete Project (Creator PM or Admin)
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid Project ID.' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Check authority: must be Admin OR the creator PM
    if (userRole !== 'ADMIN' && project.creatorId !== userId) {
      return res.status(403).json({ message: 'Access Denied. Only the project creator or Admin can delete projects.' });
    }

    await prisma.project.delete({ where: { id: projectId } });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: `User ${req.user.firstName} ${req.user.lastName} deleted project "${project.name}".`,
        userId,
      },
    });

    res.json({ message: `Project "${project.name}" has been deleted successfully.` });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({ message: 'Server error deleting project.' });
  }
};

/**
 * Assign members to a project
 */
const addProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body; // Array of user IDs to assign
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid Project ID.' });
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'An array of userIds is required.' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Authority: must be Admin OR the creator PM
    if (req.user.role !== 'ADMIN' && project.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Access Denied. Only the project creator or Admin can manage project members.' });
    }

    // Filter out users who are already members
    const existingMembers = await prisma.projectMember.findMany({
      where: {
        projectId,
        userId: { in: userIds },
      },
      select: { userId: true },
    });

    const existingUserIds = existingMembers.map((m) => m.userId);
    const newUserIds = userIds.filter((uid) => !existingUserIds.includes(uid));

    if (newUserIds.length === 0) {
      return res.status(400).json({ message: 'All selected users are already members of this project.' });
    }

    // Validate users existence
    const users = await prisma.user.findMany({
      where: { id: { in: newUserIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    if (users.length !== newUserIds.length) {
      return res.status(400).json({ message: 'One or more user IDs do not exist.' });
    }

    // Add members
    const memberData = users.map((u) => ({
      projectId,
      userId: u.id,
    }));

    await prisma.projectMember.createMany({ data: memberData });

    // Track activity & notify users
    for (const u of users) {
      await prisma.activityLog.create({
        data: {
          action: `${req.user.firstName} ${req.user.lastName} added ${u.firstName} ${u.lastName} to project "${project.name}".`,
          userId: req.user.id,
        },
      });

      await prisma.notification.create({
        data: {
          content: `You have been added to the project "${project.name}".`,
          userId: u.id,
        },
      });
    }

    res.status(201).json({ message: `Successfully added ${users.length} member(s) to the project.` });
  } catch (error) {
    console.error('Add Project Members Error:', error);
    res.status(500).json({ message: 'Server error adding project members.' });
  }
};

/**
 * Remove member from project
 */
const removeProjectMember = async (req, res) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const projectId = parseInt(id);
    const userId = parseInt(targetUserId);

    if (isNaN(projectId) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid Project or User ID.' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Authority: must be Admin OR the creator PM
    if (req.user.role !== 'ADMIN' && project.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'Access Denied. Only the project creator or Admin can manage project members.' });
    }

    // Prevent creator from being removed
    if (userId === project.creatorId) {
      return res.status(400).json({ message: 'Cannot remove the project creator from the project.' });
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (!membership) {
      return res.status(404).json({ message: 'User is not a member of this project.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    // Unassign tasks of this user in this project
    await prisma.task.updateMany({
      where: { projectId, assigneeId: userId },
      data: { assigneeId: null },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: `${req.user.firstName} ${req.user.lastName} removed ${user.firstName} ${user.lastName} from project "${project.name}".`,
        userId: req.user.id,
      },
    });

    res.json({ message: `Removed ${user.firstName} ${user.lastName} from the project.` });
  } catch (error) {
    console.error('Remove Project Member Error:', error);
    res.status(500).json({ message: 'Server error removing project member.' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMembers,
  removeProjectMember,
};
