const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

code = code.replace(
    /<\/motion\.div>\n\s*\);\n\s*\}\)\(\)\}\n\n\s*\{\/\* 🎨 Step 3:/g,
    `</motion.div>\n                )}\n\n              {/* 🎨 Step 3:`
);

// Fallback in case emojis break it:
code = code.replace(
    /<\/motion\.div>\n\s*\);\n\s*\}\)\(\)\}\n\n\s*\{\/\*(.*?)(Step 3:)/g,
    `</motion.div>\n                )}\n\n              {/*$1$2`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', code);
console.log('Fixed dangling IIFE close');
