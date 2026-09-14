const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

code = code.replace(
    /\[cat\]: \{ \.\.\.\(currentLimits\[cat\] \|\| \{ total: 9, stage: 4, nonStage: 5 \}\), \[field\]: parseInt\(value, 10\) \|\| 0 \}/g,
    `[cat]: { ...(currentLimits[cat] || { total: cat === 'THĀNAWIYYAH' ? 11 : 9, stage: cat === 'THĀNAWIYYAH' ? 5 : 4, nonStage: cat === 'THĀNAWIYYAH' ? 6 : 5 }), [field]: parseInt(value, 10) || 0 }`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', code);
console.log('Fixed handleUpdateCategoryLimits fallback defaults');
