const fs = require('fs');
let content = fs.readFileSync('../backend-hudafestival-main/controllers/settingsController.js', 'utf8');

content = content.replace(
  `const { gradePoints, isRegistrationOpen, maintenanceMode, maintenanceMessage } = req.body;`,
  `const { gradePoints, isRegistrationOpen, maintenanceMode, maintenanceMessage, topicRegistrationEnabled } = req.body;`
);

content = content.replace(
  `if (typeof isRegistrationOpen !== 'undefined') {\n            settings.isRegistrationOpen = isRegistrationOpen;\n        }`,
  `if (typeof isRegistrationOpen !== 'undefined') {\n            settings.isRegistrationOpen = isRegistrationOpen;\n        }\n\n        if (typeof topicRegistrationEnabled !== 'undefined') {\n            settings.topicRegistrationEnabled = topicRegistrationEnabled;\n        }`
);

fs.writeFileSync('../backend-hudafestival-main/controllers/settingsController.js', content);
