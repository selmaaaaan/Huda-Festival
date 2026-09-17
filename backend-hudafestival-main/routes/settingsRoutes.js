const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    getBylawRules, getDashboardProgress,
    getPublicSettingsStatus,
} = require('../controllers/settingsController')

const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/bylaw-rules', getBylawRules);
router.get('/dashboard-progress', getDashboardProgress);

router.get('/status', getPublicSettingsStatus);

router.route('/')
    .get(protect, authorize('admin'), getSettings)
    .patch(protect, authorize('admin'), updateSettings);

module.exports = router;