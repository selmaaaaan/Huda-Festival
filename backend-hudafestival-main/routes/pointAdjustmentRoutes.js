const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
    createAdjustment,
    getAllAdjustments,
    deleteAdjustment
} = require('../controllers/pointAdjustmentController');

router.route('/')
    .get(protect, authorize('admin'), getAllAdjustments)
    .post(protect, authorize('admin'), createAdjustment);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteAdjustment);

module.exports = router;
