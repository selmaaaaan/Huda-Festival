const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, toggleUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, authorize('admin', 'super_admin'), getAllUsers)
    .post(protect, authorize('admin', 'super_admin'), createUser);

router.route('/:id/status')
    .patch(protect, authorize('admin', 'super_admin'), toggleUserStatus);

module.exports = router;
