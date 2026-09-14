const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/settingsController.js', 'utf8');

code = code.replace(
    /const \{ gradePoints, isRegistrationOpen, categoryRegistrationStatus, maintenanceMode, maintenanceMessage, \n?topicRegistrationEnabled, venues \} = req\.body;/,
    `const { gradePoints, isRegistrationOpen, categoryRegistrationStatus, categoryTopicRegistrationStatus, maintenanceMode, maintenanceMessage, topicRegistrationEnabled, venues } = req.body;`
);

code = code.replace(
    /if \(typeof topicRegistrationEnabled !== 'undefined'\) \{\n\s*settings\.topicRegistrationEnabled = topicRegistrationEnabled;\n\s*\}/,
    `if (typeof topicRegistrationEnabled !== 'undefined') {
            settings.topicRegistrationEnabled = topicRegistrationEnabled;
        }
        if (categoryTopicRegistrationStatus) {
            settings.categoryTopicRegistrationStatus = new Map(Object.entries(categoryTopicRegistrationStatus));
        }`
);

fs.writeFileSync('backend-hudafestival-main/controllers/settingsController.js', code);
console.log('Patched settingsController.js for categoryTopicRegistrationStatus');
