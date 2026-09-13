const fs = require('fs');
let content = fs.readFileSync('../backend-hudafestival-main/controllers/topicRegistrationController.js', 'utf8');

// For submitTopic
content = content.replace(
  `const submitTopic = async (req, res) => {\n    try {\n        const { programmeId, teamId, candidateId, topic } = req.body;`,
  `const submitTopic = async (req, res) => {\n    try {\n        const Settings = require('../models/Settings');\n        const settings = await Settings.findOne();\n        if (settings && settings.topicRegistrationEnabled === false && req.user.role !== 'admin') {\n            return res.status(403).json({ message: 'Topic Registration is closed by Fest Admins' });\n        }\n        const { programmeId, teamId, candidateId, topic } = req.body;`
);

// For updateTopic
content = content.replace(
  `if (settings && settings.isRegistrationOpen === false && req.user.role !== 'admin') {\n            return res.status(403).json({ message: 'Registration is closed by Fest Admins' });\n        }`,
  `if (settings && settings.topicRegistrationEnabled === false && req.user.role !== 'admin') {\n            return res.status(403).json({ message: 'Topic Registration is closed by Fest Admins' });\n        }`
);

fs.writeFileSync('../backend-hudafestival-main/controllers/topicRegistrationController.js', content);
