const fs = require('fs');
const lines = fs.readFileSync('src/pages/TeamLeaderDashboard_BACKUP.jsx', 'utf8').split('\n');

let topic = [];
let skip = false;
let modalSkip = false;
let tabSkip = false;

for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    
    topic.push(l.replace(/TeamLeaderDashboard/g, 'TeamTopicRegistrationPage'));
}

fs.writeFileSync('src/pages/TeamTopicRegistrationPage.jsx', topic.join('\n'));
