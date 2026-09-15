const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/settingsController.js', 'utf8');
code = code.split('// Process Registrations').join(`        const TEAM_QUOTAS = {
            'BIDĀYAH': 9,
            'ʾŪLĀ': 9,
            'THĀNIYAH': 9,
            'THĀNAWIYYAH': 11,
            'ʿĀLIYAH': 9,
        };

        // Override Expected Reg based on hard quotas
        globalExpectedReg = 0;
        categories.forEach(cat => {
            const rawPerTeam = categoryGlobal[cat].expectedReg / numTeams;
            const quotaPerTeam = TEAM_QUOTAS[cat] || rawPerTeam;
            categoryGlobal[cat].expectedReg = quotaPerTeam * numTeams;
            globalExpectedReg += categoryGlobal[cat].expectedReg;
        });

        // Process Registrations`);
fs.writeFileSync('backend-hudafestival-main/controllers/settingsController.js', code);
console.log('Fixed quotas!');
