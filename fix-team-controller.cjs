const fs = require('fs');
let txt = fs.readFileSync('backend-hudafestival-main/controllers/teamController.js', 'utf8');
txt = txt.replace('if (color !== undefined) team.color = color;\\n        if (isTopicRegistrationOpen !== undefined) team.isTopicRegistrationOpen = isTopicRegistrationOpen;', 'if (color !== undefined) team.color = color;\n        if (isTopicRegistrationOpen !== undefined) team.isTopicRegistrationOpen = isTopicRegistrationOpen;');
fs.writeFileSync('backend-hudafestival-main/controllers/teamController.js', txt);
