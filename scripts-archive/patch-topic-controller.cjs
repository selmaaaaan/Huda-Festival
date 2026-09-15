const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', 'utf8');

// 1. Fix the duplicate candidate check
const oldCheck = `const existing = await TopicRegistration.findOne({ programme: programmeId, team: teamId });
        if (existing) {
            return res.status(400).json({ message: 'Team has already submitted a topic for this programme' });
        }`;

const newCheck = `const existingCandidateTopic = await TopicRegistration.findOne({ programme: programmeId, candidate: candidateId });
        if (existingCandidateTopic) {
            return res.status(400).json({ message: 'This candidate already has a topic submitted for this programme' });
        }
        
        // Ensure the team doesn't select the same topic for two different candidates
        const existingTeamTopic = await TopicRegistration.findOne({ programme: programmeId, team: teamId, topic: topic });
        if (existingTeamTopic) {
            return res.status(400).json({ message: 'Your team has already selected this topic for another candidate in this programme' });
        }`;

code = code.replace(oldCheck, newCheck);

// 2. Do the same for `updateTopic`
const updateCheckOld = `if (topic) {
            registration.topic = topic;`;

const updateCheckNew = `if (topic && topic !== registration.topic) {
            // Check if the team already picked this new topic for someone else
            const existingTeamTopic = await TopicRegistration.findOne({ 
                programme: registration.programme, 
                team: registration.team, 
                topic: topic,
                _id: { $ne: registration._id }
            });
            if (existingTeamTopic) {
                return res.status(400).json({ message: 'Your team has already selected this topic for another candidate in this programme' });
            }
            registration.topic = topic;`;

code = code.replace(updateCheckOld, updateCheckNew);

fs.writeFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', code);
console.log('Patched topicRegistrationController.js');
