const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/models/Settings.js', 'utf8');

code = code.replace(
    /'ŪLĀ': { total: 9, stage: 4, nonStage: 5 }/,
    `'E_ŪLĀ': { total: 9, stage: 4, nonStage: 5 }`
);

code = code.replace(
    /'ĀLIYAH': { total: 9, stage: 4, nonStage: 5 }/,
    `'EĀLIYAH': { total: 9, stage: 4, nonStage: 5 }`
);

fs.writeFileSync('backend-hudafestival-main/models/Settings.js', code);
console.log('Fixed keys in Settings.js');
