const TopicRegistration = require('../models/TopicRegistration');
const Programme = require('../models/Programme');

const submitTopic = async (req, res) => {
    try {
        const Settings = require('../models/Settings');
        const settings = await Settings.findOne();
        const Team = require('../models/Team');
        const teamDoc = await Team.findById(req.user.role === 'team_leader' ? req.user.team : req.body.teamId);
        if (teamDoc && teamDoc.isTopicRegistrationOpen === false && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Topic Registration is closed for your team' });
        }
        
        // Global check moved below programme lookup
        const { programmeId, teamId, candidateId, topic, attachment } = req.body;
        
        const programme = await Programme.findById(programmeId);
        
        if (programme.topicMode === 'exclusive') {
            const globallyTaken = await TopicRegistration.findOne({ programme: programmeId, topic: topic });
            if (globallyTaken) {
                return res.status(400).json({ message: 'This topic has already been registered globally by another candidate.' });
            }
        }
        
        const existingCandidateTopic = await TopicRegistration.findOne({ programme: programmeId, candidate: candidateId });
        if (existingCandidateTopic) {
            return res.status(400).json({ message: 'This candidate already has a topic submitted for this programme' });
        }
        
        // Ensure the team doesn't select the same topic for two different candidates
        const existingTeamTopic = await TopicRegistration.findOne({ programme: programmeId, team: teamId, topic: topic });
        if (existingTeamTopic) {
            return res.status(400).json({ message: 'Your team has already selected this topic for another candidate in this programme' });
        }

        const registration = new TopicRegistration({
            programme: programmeId,
            team: teamId,
            candidate: candidateId,
            topic,
            attachment,
            submittedBy: req.user._id,
            status: 'pending'
        });

        const saved = await registration.save();
        
        // --- AUTO-ASSIGN LOGIC ---
        // If this is a fixed-list (Team Exclusive) and exactly 1 candidate is left without a topic, and exactly 1 topic is left, auto-assign it.
        if (programme.topicMode === 'fixed') {
            const Registration = require('../models/Registration');
            const teamReg = await Registration.findOne({ programme: programmeId, team: teamId });
            if (teamReg && teamReg.candidates && teamReg.candidates.length > 1) {
                const teamTopics = await TopicRegistration.find({ programme: programmeId, team: teamId });
                const submittedCandIds = teamTopics.map(t => t.candidate?.toString());
                const unassignedCands = teamReg.candidates.filter(c => !submittedCandIds.includes(c.toString()));
                
                const submittedTopicStrings = teamTopics.map(t => t.topic);
                const remainingTopics = programme.topicList.filter(t => !submittedTopicStrings.includes(t));
                
                // If remaining counts match, auto-assign
                if (unassignedCands.length > 0 && unassignedCands.length === remainingTopics.length) {
                    for (let i = 0; i < unassignedCands.length; i++) {
                        await TopicRegistration.create({
                            programme: programmeId,
                            team: teamId,
                            candidate: unassignedCands[i],
                            topic: remainingTopics[i],
                            submittedBy: req.user._id,
                            status: 'approved'
                        });
                    }
                }
            }
        }
        
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
        const query = req.user.role === 'team_leader' ? { team: req.user.team } : { submittedBy: req.user._id };
        const topics = await TopicRegistration.find(query)
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
        
        const registration = await TopicRegistration.findById(topicId).populate('programme');
        if (!registration) {
            return res.status(404).json({ message: 'Topic registration not found' });
        }

        if (settings && req.user.role !== 'admin') {
            if (settings.topicRegistrationEnabled === false) {
                return res.status(403).json({ message: 'Topic Registration is closed globally by Fest Admins' });
            }
            if (registration.programme && settings.categoryTopicRegistrationStatus && settings.categoryTopicRegistrationStatus.get(registration.programme.category) === false) {
                return res.status(403).json({ message: `Topic Registration is closed for category ${registration.programme.category}` });
            }
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



const updateTopic = async (req, res) => {
    try {
        const Settings = require('../models/Settings');
        const settings = await Settings.findOne();
        // Global check moved below programme lookup

        const { topic, attachment } = req.body;
        const topicId = req.params.id;
        
        const registration = await TopicRegistration.findById(topicId).populate('programme');
        if (!registration) {
            return res.status(404).json({ message: 'Topic registration not found' });
        }
        
        if (req.user.role === 'team_leader' && registration.team.toString() !== req.user.team.toString()) {
            return res.status(403).json({ message: 'You can only update your own team\'s topics' });
        }

        if (registration.status === 'approved' && req.user.role !== 'admin') {
            return res.status(400).json({ message: 'Cannot update approved topic' });
        }
        
        if (attachment !== undefined) {
            registration.attachment = attachment;
        }

        if (topic && topic !== registration.topic) {
            if (registration.programme && registration.programme.topicMode === 'exclusive') {
                const globallyTaken = await TopicRegistration.findOne({ 
                    programme: registration.programme._id, 
                    topic: topic,
                    _id: { $ne: registration._id }
                });
                if (globallyTaken) {
                    return res.status(400).json({ message: 'This topic has already been registered globally by another candidate.' });
                }
            }

            // Check if the team already picked this new topic for someone else
            const existingTeamTopic = await TopicRegistration.findOne({ 
                programme: registration.programme._id, 
                team: registration.team, 
                topic: topic,
                _id: { $ne: registration._id }
            });
            if (existingTeamTopic) {
                return res.status(400).json({ message: 'Your team has already selected this topic for another candidate in this programme' });
            }
            registration.topic = topic;
            registration.status = 'pending'; // Reset to pending if edited
            registration.reviewNote = null;
        }
        
        const saved = await registration.save();
        res.status(200).json(saved);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update topic', error: error.message });
    }
};

const deleteTopic = async (req, res) => {
    try {
        const topicId = req.params.id;
        const registration = await TopicRegistration.findById(topicId);
        
        if (!registration) {
            return res.status(404).json({ message: 'Topic registration not found' });
        }
        
        if (req.user.role === 'team_leader' && registration.team.toString() !== req.user.team.toString()) {
            return res.status(403).json({ message: 'You can only delete your own team\'s topics' });
        }
        
        await TopicRegistration.findByIdAndDelete(topicId);
        res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete topic', error: error.message });
    }
};

module.exports = {
    submitTopic,
    getTopicsForProgramme,
    getMyTopicSubmissions,
    getPendingTopics,
    getAllTopics,
    reviewTopic,
    updateTopic,
    deleteTopic,
    getTopicEnabledProgrammes
};
