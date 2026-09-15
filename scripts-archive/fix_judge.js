const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/JudgePanel.jsx', 'utf8');
c = c.replace('fetchSubmissions();', 'fetchData();');
fs.writeFileSync('admin-hudafestival-main/src/pages/JudgePanel.jsx', c, 'utf8');
console.log("Fixed JudgePanel.jsx");