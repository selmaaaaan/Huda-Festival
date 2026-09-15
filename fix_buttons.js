const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');
c = c.replace(/{isTopicRegistrationEnabled !== false && t\.status !== 'approved' && \(/g, "{t.status !== 'approved' && (");
c = c.replace(/{isTopicRegistrationEnabled !== false && \(/g, "{true && (");
c = c.replace(/if \(isTopicRegistrationEnabled === false\) return;/g, "");
c = c.replace(/!isTopicRegistrationEnabled \?/g, "!isTopicRegistrationEnabled && !editTopicId ?");
fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
console.log("Fixed TeamTopicRegistrationPage.jsx Edit/Delete buttons");