const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/teamController.js', 'utf8');
c = c.replace(/let limitObj = \{ stage: 4, nonStage: 5 \};[\s\S]*?limits: limitObj\s*\};\s*/, 
`let limitObj = { stage: 4, nonStage: 5 };
            if (settings && settings.categoryItemLimits) {
                let catKey = cand.category;
                if (catKey.includes('ŪLĀ')) catKey = 'E_ŪLĀ';
                if (catKey.includes('ĀLIYAH')) catKey = 'EĀLIYAH';
                
                let sLimits = settings.categoryItemLimits.get(catKey) || settings.categoryItemLimits.get(cand.category);
                if (sLimits) {
                    limitObj = { stage: sLimits.stage, nonStage: sLimits.nonStage };
                }
            }

            let status = 'pending';
            if (stageCount > limitObj.stage || nonStageCount > limitObj.nonStage) {
                status = 'violated';
            } else if (stageCount >= 1 && nonStageCount >= 1) {
                status = 'compliant';
            }
            
            cand.bylawStatus = {
                isCompliant: status === 'compliant',
                status,
                stageCount,
                nonStageCount,
                limits: limitObj
            };
`);
fs.writeFileSync('backend-hudafestival-main/controllers/teamController.js', c, 'utf8');
console.log('Fixed properly');