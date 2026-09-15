const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', 'utf8');

// The logic needs to look up the Programme first to check its category!
// Currently it checks settings before looking up the Programme. 
// I will move the category check down below the Programme lookup.

const createTopicReplacement = `const programme = await Programme.findById(programmeId);
        if (!programme) return res.status(404).json({ message: 'Programme not found' });

        if (settings && req.user.role !== 'admin') {
            if (settings.topicRegistrationEnabled === false) {
                return res.status(403).json({ message: 'Topic Registration is closed globally by Fest Admins' });
            }
            if (settings.categoryTopicRegistrationStatus && settings.categoryTopicRegistrationStatus.get(programme.category) === false) {
                return res.status(403).json({ message: \`Topic Registration is closed for category \${programme.category}\` });
            }
        }`;

code = code.replace(
    /const { programmeId, teamId, candidateId, topic } = req\.body;\s*const programme = await Programme\.findById\(programmeId\);\s*if \(\!programme\) return res\.status\(404\)\.json\(\{ message: 'Programme not found' \}\);/g,
    `const { programmeId, teamId, candidateId, topic } = req.body;
        ${createTopicReplacement}`
);

// We should remove the old global check from the top
code = code.replace(
    /if \(settings && settings\.topicRegistrationEnabled === false && req\.user\.role !== 'admin'\) \{\n\s*return res\.status\(403\)\.json\(\{ message: 'Topic Registration is closed by Fest Admins' \}\);\n\s*\}/,
    `// Global check moved below programme lookup`
);


// Same for update
const updateTopicReplacement = `const registration = await TopicRegistration.findById(topicId).populate('programme');
        if (!registration) {
            return res.status(404).json({ message: 'Topic registration not found' });
        }

        if (settings && req.user.role !== 'admin') {
            if (settings.topicRegistrationEnabled === false) {
                return res.status(403).json({ message: 'Topic Registration is closed globally by Fest Admins' });
            }
            if (registration.programme && settings.categoryTopicRegistrationStatus && settings.categoryTopicRegistrationStatus.get(registration.programme.category) === false) {
                return res.status(403).json({ message: \`Topic Registration is closed for category \${registration.programme.category}\` });
            }
        }`;

code = code.replace(
    /const registration = await TopicRegistration\.findById\(topicId\);\n\s*if \(\!registration\) \{\n\s*return res\.status\(404\)\.json\(\{ message: 'Topic registration not found' \}\);\n\s*\}/,
    updateTopicReplacement
);

code = code.replace(
    /if \(settings && settings\.topicRegistrationEnabled === false && req\.user\.role !== 'admin'\) \{\n\s*return res\.status\(403\)\.json\(\{ message: 'Topic Registration is closed by Fest Admins' \}\);\n\s*\}/,
    `// Global check moved below programme lookup`
);

fs.writeFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', code);
console.log('Patched topicRegistrationController.js');
