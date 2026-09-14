const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

code = code.replace(
    /\{\/\* Maintenance Mode \*\/\}\}\}/g,
    `{/* Maintenance Mode */}`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', code);
console.log('Fixed rogue braces');
