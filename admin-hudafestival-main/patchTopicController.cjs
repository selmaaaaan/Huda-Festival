const fs = require('fs');
let content = fs.readFileSync('../backend-hudafestival-main/controllers/topicRegistrationController.js', 'utf8');

const updateFn = `

const updateTopic = async (req, res) => {
    try {
        const Settings = require('../models/Settings');
        const settings = await Settings.findOne();
        if (settings && settings.isRegistrationOpen === false && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Registration is closed by Fest Admins' });
        }

        const { topic } = req.body;
        const topicId = req.params.id;
        
        const registration = await TopicRegistration.findById(topicId);
        if (!registration) {
            return res.status(404).json({ message: 'Topic registration not found' });
        }
        
        if (req.user.role === 'team_leader' && registration.team.toString() !== req.user.team.toString()) {
            return res.status(403).json({ message: 'You can only update your own team\\'s topics' });
        }

        if (registration.status === 'approved' && req.user.role !== 'admin') {
            return res.status(400).json({ message: 'Cannot update approved topic' });
        }
        
        if (topic) {
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

`;

content = content.replace('module.exports = {', updateFn + 'module.exports = {\n    updateTopic,');
fs.writeFileSync('../backend-hudafestival-main/controllers/topicRegistrationController.js', content);
