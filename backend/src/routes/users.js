const express = require('express');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'PROJECT_MANAGER'), getUsers);
router.post('/', authorize('ADMIN'), createUser);
router.put('/:id', authorize('ADMIN'), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

module.exports = router;
