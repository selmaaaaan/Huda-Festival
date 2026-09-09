const TopicRegistration = require('../models/TopicRegistration');
const Programme = require('../models/Programme');

const submitTopic = async (req, res) => {
    try {
        const { programmeId, teamId, candidateId, topic } = req.body;
        
        const existing = await TopicRegistration.findOne({ programme: programmeId, team: teamId });
        if (existing) {
            return res.status(400).json({ message: 'Team has already submitted a topic for this programme' });
        }

        const registration = new TopicRegistration({
            programme: programmeId,
            team: teamId,
            candidate: candidateId,
            topic,
            submittedBy: req.user._id,
            status: 'pending'
        });

        const saved = await registration.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit topic', error: error.message });
    }
};

const getTopicsForProgramme = async (req, res) => {
    try {
        const { programmeId } = req.params;
        const topics = await TopicRegistration.find({ programme: programmeId })
            .populate('team', 'name')
            .populate('candidate', 'name admissionNo');
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch topics', error: error.message });
    }
};

const getMyTopicSubmissions = async (req, res) => {
    try {
        // Assuming team leader's team is linked or they query by their ID
        const topics = await TopicRegistration.find({ submittedBy: req.user._id })
            .populate('programme', 'name code')
            .populate('team', 'name')
            .populate('candidate', 'name admissionNo');
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
    }
};

const getPendingTopics = async (req, res) => {
    try {
        const topics = await TopicRegistration.find({ status: 'pending' })
            .populate('programme', 'name code')
            .populate('team', 'name')
            .populate('candidate', 'name admissionNo')
            .populate('submittedBy', 'name');
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending topics', error: error.message });
    }
};

const getAllTopics = async (req, res) => {
    try {
        const topics = await TopicRegistration.find()
            .populate('programme', 'name code')
            .populate('team', 'name')
            .populate('candidate', 'name admissionNo')
            .populate('submittedBy', 'name');
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all topics', error: error.message });
    }
};

const reviewTopic = async (req, res) => {
    try {
        const { status, reviewNote } = req.body;
        const topicId = req.params.id;
        
        const registration = await TopicRegistration.findById(topicId);
        if (!registration) {
            return res.status(404).json({ message: 'Topic registration not found' });
        }
        
        registration.status = status;
        registration.reviewNote = reviewNote;
        registration.reviewedBy = req.user._id;
        
        const saved = await registration.save();
        res.status(200).json(saved);
    } catch (error) {
        res.status(500).json({ message: 'Failed to review topic', error: error.message });
    }
};

const getTopicEnabledProgrammes = async (req, res) => {
    try {
        const programmes = await Programme.find({ topicMode: { $ne: 'none' } });
        res.status(200).json(programmes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch programmes', error: error.message });
    }
};

module.exports = {
    submitTopic,
    getTopicsForProgramme,
    getMyTopicSubmissions,
    getPendingTopics,
    getAllTopics,
    reviewTopic,
    getTopicEnabledProgrammes
};
