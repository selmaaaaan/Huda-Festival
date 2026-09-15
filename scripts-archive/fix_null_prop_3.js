const fs = require('fs');

let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

c = c.replace(/r\.programme\._id/g, "r.programme?._id");
c = c.replace(/reg\.programme\._id/g, "reg.programme?._id");

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', c, 'utf8');
console.log("Fixed TeamLeaderDashboard.jsx");