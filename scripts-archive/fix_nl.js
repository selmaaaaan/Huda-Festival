const fs = require('fs'); 
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8'); 
c = c.replace(/split\('\\\\n'\)/g, "split('\\n')"); 
fs.writeFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', c, 'utf8'); 
console.log('fixed newline');