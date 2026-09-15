const fs = require('fs');

let content = fs.readFileSync('backend-hudafestival-main/controllers/teamController.js', 'utf-8');

const regex = /let status = 'pending';[\s\S]*?limits: \{ stage: 1, nonStage: 1 \}\s*\};\s*\}/;

const newBylawLogic = `let limitObj = { stage: 4, nonStage: 5 };
            if (settings && settings.categoryItemLimits) {
                let catKey = cand.category;
                if (catKey === 'ʾŪLĀ' || catKey === 'ŪLĀ') catKey = 'E_ŪLĀ';
                if (catKey === 'ʿĀLIYAH' || catKey === 'ĀLIYAH') catKey = 'EĀLIYAH';
                
                let sLimits = settings.categoryItemLimits.get(catKey);
                if (sLimits) {
                    limitObj = { stage: sLimits.stage, nonStage: sLimits.nonStage };
                }
            }

            let status = 'pending'; // Yellow (has not met minimum 1/1)
            if (stageCount > limitObj.stage || nonStageCount > limitObj.nonStage) {
                status = 'violated'; // Red (Exceeded maximum allowed)
            } else if (stageCount >= 1 && nonStageCount >= 1) {
                status = 'compliant'; // Green (Met minimum 1/1, and hasn't exceeded limits)
            }
            
            cand.bylawStatus = {
                isCompliant: status === 'compliant',
                status,
                stageCount,
                nonStageCount,
                limits: limitObj
            };
        }`;

content = content.replace(regex, newBylawLogic);
fs.writeFileSync('backend-hudafestival-main/controllers/teamController.js', content, 'utf-8');
console.log('Fixed teamController.js');