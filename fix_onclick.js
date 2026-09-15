const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8');
c = c.replace(/onClick=\{\(e\) => \{\r?\n\s+e\.stopPropagation\(\);\r?\n\s+const confirmed = await confirmAction/, 'onClick={async (e) => {\n                            e.stopPropagation();\n                            const confirmed = await confirmAction');
fs.writeFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', c, 'utf8');
console.log("Fixed");