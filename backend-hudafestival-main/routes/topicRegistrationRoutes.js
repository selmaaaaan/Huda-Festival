const express = require('express');
const router = express.Router();
const {
    submitTopic,
    getTopicsForProgramme,
    getMyTopicSubmissions,
    getPendingTopics,
    getAllTopics,
    reviewTopic,
    getTopicEnabledProgrammes
} = require('../controllers/topicRegistrationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/enabled-programmes', protect, getTopicEnabledProgrammes);
router.get('/my-submissions', protect, getMyTopicSubmissions);
router.get('/pending', protect, authorize('admin'), getPendingTopics);
router.get('/programme/:programmeId', protect, getTopicsForProgramme);
router.get('/', protect, authorize('admin'), getAllTopics);

router.post('/', protect, submitTopic);
router.patch('/:id/review', protect, authorize('admin'), reviewTopic);

module.exports = router;
