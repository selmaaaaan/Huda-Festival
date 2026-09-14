const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

code = code.replace(
    /const registeredCands = reg\?\.candidates \|\| \[\];/,
    `const registeredCands = reg?.candidates || [];
                    console.log('topicForm.programmeId:', topicForm.programmeId);
                    console.log('Found reg:', reg);
                    console.log('registeredProgrammeIds:', myRegistrations.map(r => r.programme._id || r.programme));`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', code);
