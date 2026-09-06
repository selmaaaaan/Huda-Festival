const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createRegistration, getRegistrations, approveRegistration,
  rejectRegistration, updateRegistration, deleteRegistration
} = require('../controllers/registrationController');

router.route('/')
  .post(protect, createRegistration)
  .get(protect, getRegistrations);

router.route('/:id')
  .patch(protect, authorize('admin', 'judge'), updateRegistration)
  .delete(protect, authorize('admin', 'judge'), deleteRegistration);

router.patch('/:id/approve', protect, authorize('admin', 'judge'), approveRegistration);
router.patch('/:id/reject', protect, authorize('admin', 'judge'), rejectRegistration);

module.exports = router;
