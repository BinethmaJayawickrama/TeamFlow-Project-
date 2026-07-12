const express = require('express');
const { getAdminDashboardStats, getPMDashboardStats, getProjectReport } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/admin-stats', authorize('ADMIN'), getAdminDashboardStats);
router.get('/pm-stats', authorize('ADMIN', 'PROJECT_MANAGER'), getPMDashboardStats);
router.get('/project-report/:id', getProjectReport);

module.exports = router;
