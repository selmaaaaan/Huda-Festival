const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

// Move it to the top
code = code.replace(
    /\n\s*const \[savingLimits, setSavingLimits\] = useState\(false\);/,
    ''
);

code = code.replace(
    /const \[savingMaintenance, setSavingMaintenance\] = useState\(false\);/,
    `const [savingMaintenance, setSavingMaintenance] = useState(false);\n  const [savingLimits, setSavingLimits] = useState(false);`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', code);
console.log('Moved hook to the top');
