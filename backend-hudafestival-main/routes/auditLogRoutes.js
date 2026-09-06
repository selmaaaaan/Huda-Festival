const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const { getAuditLogs } = require('../controllers/auditLogController');

router.get('/', protect, authorize('admin', 'judge'), getAuditLogs);

module.exports = router;
