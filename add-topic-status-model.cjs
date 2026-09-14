const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/models/Settings.js', 'utf8');

if (!code.includes('categoryTopicRegistrationStatus')) {
    code = code.replace(
        /topicRegistrationEnabled: \{\n\s*type: Boolean,\n\s*default: true\n\s*\},/,
        `topicRegistrationEnabled: {
        type: Boolean,
        default: true
    },
    categoryTopicRegistrationStatus: {
        type: Map,
        of: Boolean,
        default: {}
    },`
    );
    fs.writeFileSync('backend-hudafestival-main/models/Settings.js', code);
    console.log('Added categoryTopicRegistrationStatus to Settings.js');
} else {
    console.log('Already exists in Settings.js');
}
