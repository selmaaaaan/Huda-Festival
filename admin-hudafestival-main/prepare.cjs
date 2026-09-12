const fs = require('fs');
let code = fs.readFileSync('src/pages/TeamLeaderDashboard.jsx', 'utf8');

// The new TeamTopicRegistrationPage
let topicPageCode = code.replace(/TeamLeaderDashboard/g, 'TeamTopicRegistrationPage');

// We want to KEEP topic related things, but REMOVE general registration things.
fs.writeFileSync('src/pages/TeamTopicRegistrationPage.jsx', topicPageCode);
