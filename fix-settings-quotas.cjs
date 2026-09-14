const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/settingsController.js', 'utf8');

// Remove the TEAM_QUOTAS override block
const overrideRegex = /\/\/ Override Expected Reg based on hard quotas[\s\S]*?globalExpectedReg \+= categoryGlobal\[cat\]\.expectedReg;\n        \}\);/;
code = code.replace(overrideRegex, '');

// Also we need to correctly set globalExpectedReg and categoryGlobal[cat].expectedReg
// Currently it is set during `programmes.forEach` using maxParticipants * numTeams.
// Let's modify the programmes.forEach loop to just count the programmes!
code = code.replace(
    /const expectedR = \(p\.maxParticipants \|\| 1\) \* numTeams;/g,
    `const expectedR = numTeams; // 1 per team for the programme count`
);
code = code.replace(
    /let expectedT = 0;\n\s*if \(p\.topicMode && p\.topicMode !== 'none'\) \{\n\s*expectedT = \(p\.maxParticipants \|\| 1\) \* numTeams;\n\s*\}/g,
    `let expectedT = 0;\n              if (p.topicMode && p.topicMode !== 'none') {\n                  expectedT = numTeams;\n              }`
);

// We need to also fix the teamWise mapping where it might have been patched by me previously
const teamWiseRegex = /\/\/ --- START OF OVERRIDE ---[\s\S]*?\/\/ --- END OF OVERRIDE ---/g;
code = code.replace(teamWiseRegex, '');

fs.writeFileSync('backend-hudafestival-main/controllers/settingsController.js', code);
console.log('Patched settingsController.js to use programme counts');
