const fs = require('fs');

let c = fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8');

c = c.replace(/  const confirmAction = useConfirm\(\);\n/, ''); // remove from selectProgramme

c = c.replace(/const TopicManagementPage = \(\) => \{\n/, "const TopicManagementPage = () => {\n  const confirmAction = useConfirm();\n");

fs.writeFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', c, 'utf8');
console.log("Fixed TopicManagementPage.jsx");