const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMembers,
  removeProjectMember,
} = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Project Manager & Admin routes for creation
router.post('/', authorize('ADMIN', 'PROJECT_MANAGER'), createProject);

// General viewing (with membership filters applied in controller)
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Editing & Deleting restricted to PM/Admin
router.put('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), updateProject);
router.delete('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), deleteProject);

// Managing members
router.post('/:id/members', authorize('ADMIN', 'PROJECT_MANAGER'), addProjectMembers);
router.delete('/:id/members/:userId', authorize('ADMIN', 'PROJECT_MANAGER'), removeProjectMember);

module.exports = router;
