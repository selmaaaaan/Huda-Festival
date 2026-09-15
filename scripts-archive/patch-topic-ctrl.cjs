const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', 'utf8');

const submitOld = `        const { programmeId, teamId, candidateId, topic } = req.body;
        
        const existingCandidateTopic = await TopicRegistration.findOne({ programme: programmeId, candidate: candidateId });`;

const submitNew = `        const { programmeId, teamId, candidateId, topic, attachment } = req.body;
        
        const programme = await Programme.findById(programmeId);
        
        if (programme.topicMode === 'fixed-list-global') {
            const globallyTaken = await TopicRegistration.findOne({ programme: programmeId, topic: topic });
            if (globallyTaken) {
                return res.status(400).json({ message: 'This topic has already been registered globally by another candidate.' });
            }
        }
        
        const existingCandidateTopic = await TopicRegistration.findOne({ programme: programmeId, candidate: candidateId });`;

code = code.replace(submitOld, submitNew);

const submitSaveOld = `        const registration = new TopicRegistration({
            programme: programmeId,
            team: teamId,
            candidate: candidateId,
            topic,
            submittedBy: req.user._id,
            status: 'pending'
        });`;

const submitSaveNew = `        const registration = new TopicRegistration({
            programme: programmeId,
            team: teamId,
            candidate: candidateId,
            topic,
            attachment,
            submittedBy: req.user._id,
            status: 'pending'
        });`;
code = code.replace(submitSaveOld, submitSaveNew);

fs.writeFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', code);
console.log('Patched topicRegistrationController submitTopic');
