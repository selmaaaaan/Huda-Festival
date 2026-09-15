const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/settingsController.js', 'utf8');

// Replace the calculation of regCompleted for categories and global
const regBlockRegex = /\/\/ Process Registrations[\s\S]*?const globalTopCompleted = allTopics\.length;/;

const replacementRegBlock = `// Process Registrations (Unique team+programme pairs)
        const uniqueGlobalRegs = new Set();
        allRegistrations.forEach(r => {
            const p = progMap[r.programme?.toString()];
            if (p && r.team && categoryGlobal[p.category]) {
                const uniqueKey = r.team.toString() + '_' + p._id.toString();
                if (!uniqueGlobalRegs.has(uniqueKey)) {
                    uniqueGlobalRegs.add(uniqueKey);
                    categoryGlobal[p.category].regCompleted += 1;
                }
            }
        });

        // Process Topics
        const uniqueGlobalTops = new Set();
        allTopics.forEach(t => {
            const p = progMap[t.programme?.toString()];
            if (p && t.team && categoryGlobal[p.category]) {
                const uniqueKey = t.team.toString() + '_' + p._id.toString();
                if (!uniqueGlobalTops.has(uniqueKey)) {
                    uniqueGlobalTops.add(uniqueKey);
                    categoryGlobal[p.category].topCompleted += 1;
                }
            }
        });

        const globalRegCompleted = uniqueGlobalRegs.size;
        const globalTopCompleted = uniqueGlobalTops.size;`;

code = code.replace(regBlockRegex, replacementRegBlock);

// Now replace team-wise logic
const teamWiseLogicRegex = /const catTeamRegCount = catTeamRegs\.length;\n\s*const catTeamTopCount = catTeamTops\.length;/g;
const replacementTeamWise = `const catTeamRegCount = new Set(catTeamRegs.map(r => r.programme?.toString())).size;
                const catTeamTopCount = new Set(catTeamTops.map(t => t.programme?.toString())).size;`;

code = code.replace(teamWiseLogicRegex, replacementTeamWise);

// Replace teamRegCount overall
const teamRegCountRegex = /const teamRegCount = teamRegs\.length;\n\s*const teamTopicCount = teamTops\.length;/;
const replacementTeamRegCount = `const teamRegCount = new Set(teamRegs.map(r => r.programme?.toString())).size;
            const teamTopicCount = new Set(teamTops.map(t => t.programme?.toString())).size;`;

code = code.replace(teamRegCountRegex, replacementTeamRegCount);

fs.writeFileSync('backend-hudafestival-main/controllers/settingsController.js', code);
console.log('Patched settingsController.js for unique registrations');
