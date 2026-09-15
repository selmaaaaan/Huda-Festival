const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

c = c.replace(/const approvedCount = useMemo\(\(\) => myRegistrations\.filter\(r => r\.status === 'approved'\)\.length, \[myRegistrations\]\);/,
"const approvedCount = useMemo(() => myTopics.filter(r => r.status === 'approved').length, [myTopics]);");

c = c.replace(/const pendingCount  = useMemo\(\(\) => myRegistrations\.filter\(r => r\.status === 'pending'\)\.length, \[myRegistrations\]\);/,
"const pendingCount  = useMemo(() => myTopics.filter(r => r.status === 'pending').length, [myTopics]);");

c = c.replace(/<StatCard label="Total Submitted" value=\{myRegistrations\.length\}       \/>/,
"<StatCard label=\"Total Submitted\" value={myTopics.length}       />");

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
console.log("Fixed stats");