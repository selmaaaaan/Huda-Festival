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

const { publishBatch } = require('../controllers/resultController');

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

// @desc    Publish a batch of results
// @route   POST /api/results/batch-publish
// @access  Private/Admin
router.post('/batch-publish', protect, publishBatch);


// @desc    Get current judge's submitted results
// @route   GET /api/results/my-submissions
// @access  Private/Judge
router.get('/my-submissions', protect, async (req, res) => {
    try {
        const results = await Result.find({ submittedBy: req.user._id })
            .populate('programme', 'name code')
            .populate({
                path: 'candidate',
                populate: { path: 'team', select: 'name' }
            })
            .sort({ updatedAt: -1 });
        res.json(results);
    } catch (error) {
        console.error("Error fetching my submissions:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a batch of pending results
// @route   DELETE /api/results/batch/:batchId
// @access  Private/Admin
router.delete('/batch/:batchId', protect, async (req, res) => {
    try {
        await Result.deleteMany({ batchId: req.params.batchId, status: 'pending' });
        res.json({ message: 'Batch deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
