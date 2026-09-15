const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8');
c = c.replace(/export default function TopicManagementPage\(\) \{\r?\n/, (match) => match + "  const confirmAction = useConfirm();\n");
fs.writeFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', c, 'utf8');
console.log("Fixed TopicManagementPage.jsx");