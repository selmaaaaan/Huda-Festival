const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    getBylawRules,
} = require('../controllers/settingsController')

const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/bylaw-rules', getBylawRules);

router.route('/')
    .get(getSettings)
    .patch(protect, admin, updateSettings);

module.exports = router;