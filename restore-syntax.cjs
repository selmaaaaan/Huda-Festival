const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

code = code.replace(
    /<\/motion\.div>\n\s*\);\n\s*\}\)\(\)\}/g,
    `</motion.div>\n                )}`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', code);
console.log('Restored syntax');
