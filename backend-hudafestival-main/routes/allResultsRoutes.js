const express = require('express');
const router = express.Router();
const Result = require('../models/Result.js'); // Import the Result model
const { protect } = require('../middlewares/authMiddleware.js');

// @desc    Get all result documents
// @route   GET /api/results
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    try {
        const results = await Result.find({});
        res.json(results);
    } catch (error) {
        console.error("Error fetching all results:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get all published results
// @route   GET /api/results/published
// @access  Public
router.get('/published', async (req, res) => {
    try {
        const results = await Result.find({ status: 'approved' })
            .populate('programme')
            .populate({
                path: 'candidate',
                populate: { path: 'team' }
            });
        res.json(results);
    } catch (error) {
        console.error("Error fetching published results:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
