const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

c = c.replace(/3 \?"/g, '3 -');
c = c.replace(/Select a topic\?/g, 'Select a topic...');
c = c.replace(/Enter group topic\?/g, 'Enter group topic...');
c = c.replace(/Enter topic\?/g, 'Enter topic text...');

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');