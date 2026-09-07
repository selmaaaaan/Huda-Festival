const express = require('express');
const router = express.Router();
const {
    createNotification,
    getActiveNotifications,
    getAllNotifications,
    deactivateNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getActiveNotifications)
    .post(protect, authorize('admin'), createNotification);

router.route('/all')
    .get(protect, authorize('admin'), getAllNotifications);

router.route('/:id/deactivate')
    .patch(protect, authorize('admin'), deactivateNotification);

module.exports = router;
