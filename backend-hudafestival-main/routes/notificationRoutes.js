const express = require('express');
const router = express.Router();
const {
    createNotification,
    getActiveNotifications,
    getAllNotifications,
    toggleNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getActiveNotifications)
    .post(protect, authorize('admin'), createNotification);

router.route('/all')
    .get(protect, authorize('admin'), getAllNotifications);

router.route('/:id/toggle')
    .patch(protect, authorize('admin'), toggleNotification);

module.exports = router;
