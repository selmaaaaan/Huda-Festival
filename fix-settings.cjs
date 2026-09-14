const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/settingsController.js', 'utf8');

// 1. Remove the TEAM_QUOTAS override block completely
const overrideRegex = /const TEAM_QUOTAS = \{[\s\S]*?globalExpectedReg \+= categoryGlobal\[cat\]\.expectedReg;\n\s*\}\);/g;
code = code.replace(overrideRegex, '');

// 2. Change the expectedR calculation to just be numTeams
code = code.replace(
    /const expectedR = \(p\.maxParticipants \|\| 1\) \* numTeams;/g,
    'const expectedR = numTeams; // exactly 1 per programme per team'
);

// 3. Change expectedT calculation similarly
code = code.replace(
    /expectedT = \(p\.maxParticipants \|\| 1\) \* numTeams;/g,
    'expectedT = numTeams; // exactly 1 per programme per team'
);

fs.writeFileSync('backend-hudafestival-main/controllers/settingsController.js', code);
console.log('Successfully patched settingsController.js');
