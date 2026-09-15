const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/settingsController.js', 'utf8');

code = code.replace(
    /const \{ gradePoints, isRegistrationOpen, categoryRegistrationStatus, categoryTopicRegistrationStatus, maintenanceMode, maintenanceMessage, topicRegistrationEnabled, venues \} = req\.body;/,
    `const { gradePoints, isRegistrationOpen, categoryRegistrationStatus, categoryTopicRegistrationStatus, categoryItemLimits, maintenanceMode, maintenanceMessage, topicRegistrationEnabled, venues } = req.body;`
);

code = code.replace(
    /if \(categoryTopicRegistrationStatus\) \{\n\s*settings\.categoryTopicRegistrationStatus = new Map\(Object\.entries\(categoryTopicRegistrationStatus\)\);\n\s*\}/,
    `if (categoryTopicRegistrationStatus) {
            settings.categoryTopicRegistrationStatus = new Map(Object.entries(categoryTopicRegistrationStatus));
        }
        if (categoryItemLimits) {
            settings.categoryItemLimits = new Map(Object.entries(categoryItemLimits));
        }`
);

fs.writeFileSync('backend-hudafestival-main/controllers/settingsController.js', code);
console.log('Patched settingsController.js for categoryItemLimits');
