const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/settingsController.js', 'utf8');

c = c.replace(
    /const expectedR = numTeams; \/\/ exactly 1 per programme per team/,
    `const expectedR = p.requiresRegistration === false ? 0 : numTeams; // exactly 1 per programme per team`
);

fs.writeFileSync('backend-hudafestival-main/controllers/settingsController.js', c, 'utf8');
console.log("Done");