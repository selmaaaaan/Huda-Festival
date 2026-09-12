const fs = require('fs');
let content = fs.readFileSync('../backend-hudafestival-main/models/Settings.js', 'utf8');
content = content.replace(
  `isRegistrationOpen: {
        type: Boolean,
        default: true
    },`,
  `isRegistrationOpen: {
        type: Boolean,
        default: true
    },
    topicRegistrationEnabled: {
        type: Boolean,
        default: true
    },`
);
fs.writeFileSync('../backend-hudafestival-main/models/Settings.js', content);
