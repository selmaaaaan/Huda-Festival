const fs = require('fs');
let txt = fs.readFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', 'utf8');
txt = txt.replace(
  "if (settings && settings.topicRegistrationEnabled === false && req.user.role !== 'admin') {",
  `const Team = require('../models/Team');
        const teamDoc = await Team.findById(req.user.role === 'team_leader' ? req.user.team : req.body.teamId);
        if (teamDoc && teamDoc.isTopicRegistrationOpen === false && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Topic Registration is closed for your team' });
        }
        
        if (settings && settings.topicRegistrationEnabled === false && req.user.role !== 'admin') {`
);
fs.writeFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', txt);
