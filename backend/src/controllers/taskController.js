const prisma = require('../utils/db');
const path = require('path');

/**
 * Create a new task (Project Manager or Admin)
 */
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, projectId, assigneeId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Task title and projectId are required.' });
    }

    const parsedProjectId = parseInt(projectId);
    const parsedAssigneeId = assigneeId ? parseInt(assigneeId) : null;

    if (isNaN(parsedProjectId)) {
      return res.status(400).json({ message: 'Invalid Project ID.' });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: parsedProjectId },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Authority: must be Admin OR the project creator / project member PM
    const isMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: parsedProjectId, userId: req.user.id },
      },
    });

    if (req.user.role !== 'ADMIN' && (!isMember || req.user.role === 'TEAM_MEMBER')) {
      return res.status(403).json({ message: 'Access Denied. Only Project Managers or Admins assigned to the project can create tasks.' });
    }

    // Verify assignee is a member of the project if assignee is provided
    if (parsedAssigneeId) {
      const isAssigneeMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: parsedProjectId, userId: parsedAssigneeId },
        },
      });

      if (!isAssigneeMember) {
        return res.status(400).json({ message: 'Assignee must be a member of the project.' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: parsedProjectId,
        assigneeId: parsedAssigneeId,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: `${req.user.firstName} ${req.user.lastName} created task "${title}" in project "${project.name}".`,
        userId: req.user.id,
      },
    });

    // Send notification to assignee
    if (parsedAssigneeId) {
      await prisma.notification.create({
        data: {
          content: `New task assigned: "${title}" in project "${project.name}".`,
          userId: parsedAssigneeId,
        },
      });
    }

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ message: 'Server error creating task.' });
  }
};

/**
 * Get all tasks for a project
 */
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const parsedProjectId = parseInt(projectId);

    if (isNaN(parsedProjectId)) {
      return res.status(400).json({ message: 'Invalid Project ID.' });
    }

    // Verify project member or admin
    if (req.user.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: parsedProjectId, userId: req.user.id },
        },
      });
      if (!isMember) {
        return res.status(403).json({ message: 'Access Denied. You are not a member of this project.' });
      }
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: parsedProjectId },
      include: {
        assignee: {
          select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ message: 'Server error retrieving tasks.' });
  }
};

/**
 * Get details of a single task (including comments and attachments)
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid Task ID.' });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, name: true, creatorId: true },
        },
        assignee: {
          select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, role: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Verify access permission
    if (req.user.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: task.projectId, userId: req.user.id },
        },
      });
      if (!isMember) {
        return res.status(403).json({ message: 'Access Denied. You are not a member of this project.' });
      }
    }

    res.json({ task });
  } catch (error) {
    console.error('Get Task By ID Error:', error);
    res.status(500).json({ message: 'Server error retrieving task details.' });
  }
};

/**
 * Update task (assignee, priority, status, details, due date)
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, dueDate, assigneeId } = req.body;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid Task ID.' });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Verify user is a member of the project or Admin
    if (req.user.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: task.projectId, userId: req.user.id },
        },
      });
      if (!isMember) {
        return res.status(403).json({ message: 'Access Denied. You are not a member of this project.' });
      }
    }

    const parsedAssigneeId = assigneeId !== undefined ? (assigneeId ? parseInt(assigneeId) : null) : undefined;

    // Verify new assignee is a member of the project
    if (parsedAssigneeId) {
      const isAssigneeMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: task.projectId, userId: parsedAssigneeId },
        },
      });

      if (!isAssigneeMember) {
        return res.status(400).json({ message: 'Assignee must be a member of this project.' });
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (parsedAssigneeId !== undefined) updateData.assigneeId = parsedAssigneeId;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    // Logging & Notifications
    const actions = [];
    if (status && status !== task.status) {
      actions.push(`changed status of task "${task.title}" to "${status}"`);
      
      // Notify PM and Assignee if it's completed
      if (status === 'COMPLETED') {
        if (task.assigneeId && task.assigneeId !== req.user.id) {
          await prisma.notification.create({
            data: {
              content: `Task "${task.title}" has been completed by ${req.user.firstName}.`,
              userId: task.assigneeId,
            },
          });
        }
        if (task.project.creatorId !== req.user.id) {
          await prisma.notification.create({
            data: {
              content: `Task "${task.title}" in project "${task.project.name}" is completed.`,
              userId: task.project.creatorId,
            },
          });
        }
      }
    }

    if (parsedAssigneeId !== undefined && parsedAssigneeId !== task.assigneeId) {
      actions.push(`reassigned task "${task.title}"`);
      if (parsedAssigneeId) {
        await prisma.notification.create({
          data: {
            content: `You have been assigned to task: "${task.title}".`,
            userId: parsedAssigneeId,
          },
        });
      }
    }

    if (actions.length === 0) {
      actions.push(`updated details of task "${task.title}"`);
    }

    // Save activity log
    await prisma.activityLog.create({
      data: {
        action: `${req.user.firstName} ${req.user.lastName} ${actions.join(' and ')}.`,
        userId: req.user.id,
      },
    });

    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({ message: 'Server error updating task.' });
  }
};

/**
 * Delete task (PM or Admin only)
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid Task ID.' });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Verify role (Admin or PM on project)
    if (req.user.role !== 'ADMIN' && (task.project.creatorId !== req.user.id || req.user.role === 'TEAM_MEMBER')) {
      return res.status(403).json({ message: 'Access Denied. Only the project manager or Admin can delete tasks.' });
    }

    await prisma.task.delete({ where: { id: taskId } });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: `${req.user.firstName} ${req.user.lastName} deleted task "${task.title}" from project "${task.project.name}".`,
        userId: req.user.id,
      },
    });

    res.json({ message: `Task "${task.title}" deleted successfully.` });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({ message: 'Server error deleting task.' });
  }
};

/**
 * Add Comment to a Task
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params; // Task ID
    const { content } = req.body;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid Task ID.' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Verify user membership
    if (req.user.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: task.projectId, userId: req.user.id },
        },
      });
      if (!isMember) {
        return res.status(403).json({ message: 'Access Denied. You cannot comment on tasks in projects you are not a member of.' });
      }
    }

    const comment = await prisma.taskComment.create({
      data: {
        content,
        taskId,
        userId: req.user.id,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true, avatar: true },
        },
      },
    });

    // Notify assignee if someone else comments
    if (task.assigneeId && task.assigneeId !== req.user.id) {
      await prisma.notification.create({
        data: {
          content: `${req.user.firstName} commented on your task: "${task.title}".`,
          userId: task.assigneeId,
        },
      });
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: `${req.user.firstName} ${req.user.lastName} commented on task "${task.title}".`,
        userId: req.user.id,
      },
    });

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ message: 'Server error adding comment.' });
  }
};

/**
 * Upload attachment file linked to task
 */
const uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params; // Task ID
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid Task ID.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or file rejected by filter.' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Verify user membership
    if (req.user.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: task.projectId, userId: req.user.id },
        },
      });
      if (!isMember) {
        return res.status(403).json({ message: 'Access Denied.' });
      }
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const attachment = await prisma.attachment.create({
      data: {
        fileName: req.file.originalname,
        fileUrl,
        fileType: path.extname(req.file.originalname).substring(1),
        taskId,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: `${req.user.firstName} ${req.user.lastName} uploaded attachment "${req.file.originalname}" to task "${task.title}".`,
        userId: req.user.id,
      },
    });

    res.status(201).json({ attachment });
  } catch (error) {
    console.error('Upload Attachment Error:', error);
    res.status(500).json({ message: 'Server error uploading file.' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  uploadAttachment,
};
