const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

c = c.replace(/\{selectedTopicProg\?\.topicMode === 'free-text' && \([\s\S]*?<\/div>[\s\S]*?\}\)/, '');

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
console.log("REMOVED IT FOR REAL!");