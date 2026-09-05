const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    createAdjustment,
    getAllAdjustments,
    deleteAdjustment
} = require('../controllers/pointAdjustmentController');

router.route('/')
    .get(protect, getAllAdjustments)
    .post(protect, createAdjustment);

router.route('/:id')
    .delete(protect, deleteAdjustment);

module.exports = router;
