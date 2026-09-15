const fs = require('fs');

let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

c = c.replace(/r\.programme\._id/g, "r.programme?._id");

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
console.log("Fixed TeamTopicRegistrationPage.jsx part 2");