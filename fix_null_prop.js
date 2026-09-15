const fs = require('fs');

let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

c = c.replace(/myRegistrations\.filter\(r => r\.status !== 'rejected'\)\.map\(r => r\.programme\._id \|\| r\.programme\)/g, "myRegistrations.filter(r => r.status !== 'rejected' && r.programme).map(r => r.programme._id || r.programme)");

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
console.log("Fixed TeamTopicRegistrationPage.jsx");