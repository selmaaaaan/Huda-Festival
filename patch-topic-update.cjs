const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', 'utf8');

const updateOld = `        const { topic } = req.body;
        const topicId = req.params.id;
        
        const registration = await TopicRegistration.findById(topicId);`;

const updateNew = `        const { topic, attachment } = req.body;
        const topicId = req.params.id;
        
        const registration = await TopicRegistration.findById(topicId).populate('programme');`;

code = code.replace(updateOld, updateNew);

const updateTopicCheckOld = `        if (topic && topic !== registration.topic) {
            // Check if the team already picked this new topic for someone else
            const existingTeamTopic = await TopicRegistration.findOne({ 
                programme: registration.programme, 
                team: registration.team, 
                topic: topic,
                _id: { $ne: registration._id }
            });`;

const updateTopicCheckNew = `        if (attachment !== undefined) {
            registration.attachment = attachment;
        }

        if (topic && topic !== registration.topic) {
            if (registration.programme && registration.programme.topicMode === 'fixed-list-global') {
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
            });`;

code = code.replace(updateTopicCheckOld, updateTopicCheckNew);

fs.writeFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', code);
console.log('Patched updateTopic');
