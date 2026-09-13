const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    getBylawRules, getDashboardProgress,
} = require('../controllers/settingsController')

const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/bylaw-rules', getBylawRules);
router.get('/dashboard-progress', getDashboardProgress);

router.route('/')
    .get(getSettings)
    .patch(protect, authorize('admin', 'judge'), updateSettings);

module.exports = router;