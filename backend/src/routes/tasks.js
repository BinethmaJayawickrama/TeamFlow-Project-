const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  uploadAttachment,
} = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);

// Create task: restricted to PM/Admin at route level (fine-grained project membership checked in controller)
router.post('/', authorize('ADMIN', 'PROJECT_MANAGER'), createTask);

// Query all tasks (typically by projectId) and single task
router.get('/', getTasks);
router.get('/:id', getTaskById);

// Update task: allowed for project members to update status/comments/etc. (checked in controller)
router.put('/:id', updateTask);

// Delete task: restricted to PM/Admin
router.delete('/:id', authorize('ADMIN', 'PROJECT_MANAGER'), deleteTask);

// Comments
router.post('/:id/comments', addComment);

// File uploads
router.post('/:id/attachments', upload.single('file'), uploadAttachment);

module.exports = router;
