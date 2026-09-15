const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/teamController.js', 'utf8');

c = c.replace(
    /const registeredCount = progRegs\.length;/g,
    `const registeredCount = progRegs.reduce((sum, r) => sum + (r.candidates ? r.candidates.length : 0), 0);`
);

fs.writeFileSync('backend-hudafestival-main/controllers/teamController.js', c, 'utf8');
console.log('Fixed backend quota summary calculation');