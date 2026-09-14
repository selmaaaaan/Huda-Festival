const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

code = code.replace(
    /<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Footer Text \*\/\}/,
    `</div>\n\n          </div>\n          \n          {/* Footer Text */}`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', code);
console.log('Fixed extra div');
