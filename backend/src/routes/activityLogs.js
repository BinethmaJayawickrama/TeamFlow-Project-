const express = require('express');
const { getActivityLogs } = require('../controllers/activityLogController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getActivityLogs);

module.exports = router;
