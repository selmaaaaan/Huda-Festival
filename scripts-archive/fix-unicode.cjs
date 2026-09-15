const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/settingsController.js', 'utf8');

const replacement = `const TEAM_QUOTAS = {
    'BID\\u0100YAH': 9,
    '\\u02BE\\u016AL\\u0100': 9,
    'TH\\u0100NIYAH': 9,
    'TH\\u0100NAWIYYAH': 11,
    '\\u02BF\\u0100LIYAH': 9
};`;

code = code.replace(/const TEAM_QUOTAS = \{[\s\S]*?\};/, replacement);
fs.writeFileSync('backend-hudafestival-main/controllers/settingsController.js', code);
console.log('Fixed');
