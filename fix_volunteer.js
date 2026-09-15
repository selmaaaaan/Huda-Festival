const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/VolunteerPortal.jsx', 'utf8');
c = c.replace(/cl\.candidate\._id/g, 'cl.candidate?._id');
fs.writeFileSync('admin-hudafestival-main/src/pages/VolunteerPortal.jsx', c, 'utf8');
console.log("Fixed VolunteerPortal.jsx");