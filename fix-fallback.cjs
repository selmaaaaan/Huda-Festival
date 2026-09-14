const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

const oldMap = `const limits = settings.categoryItemLimits ? settings.categoryItemLimits[cat] : { total: 9, stage: 4, nonStage: 5 };`;

const newMap = `
                  const defaultLimits = {
                    'BIDĀYAH': { total: 9, stage: 4, nonStage: 5 },
                    'E_ŪLĀ': { total: 9, stage: 4, nonStage: 5 },
                    'THĀNIYAH': { total: 9, stage: 4, nonStage: 5 },
                    'THĀNAWIYYAH': { total: 11, stage: 5, nonStage: 6 },
                    'EĀLIYAH': { total: 9, stage: 4, nonStage: 5 }
                  };
                  const limits = settings.categoryItemLimits && settings.categoryItemLimits[cat] ? settings.categoryItemLimits[cat] : defaultLimits[cat];`;

code = code.replace(oldMap, newMap);
fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', code);
console.log('Fixed UI fallback defaults');
