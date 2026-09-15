const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/teamController.js', 'utf8');
c = c.replace(/if \(reg\.programme && \(reg\.programme\.stageType === 'stage' \|\| reg\.programme\.type === 'Stage'\)\) stageCount\+\+;\s*if \(reg\.programme && \(reg\.programme\.stageType === 'non-stage' \|\| reg\.programme\.type === 'Non-Stage'\)\) nonStageCount\+\+;/,
`if (reg.programme && reg.programme.format !== 'Group' && reg.programme.type !== 'Group' && reg.programme.category !== 'KULLIYYAH') {
                        if (reg.programme.stageType === 'stage' || reg.programme.type === 'Stage') stageCount++;
                        if (reg.programme.stageType === 'non-stage' || reg.programme.type === 'Non-Stage') nonStageCount++;
                    }`);
fs.writeFileSync('backend-hudafestival-main/controllers/teamController.js', c, 'utf8');
console.log('Fixed count logic');