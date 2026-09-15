const fs = require('fs');
const filePath = 'backend-hudafestival-main/controllers/teamController.js';
let content = fs.readFileSync(filePath, 'utf-8');

const newLogic = `
        candidates.forEach(cand => {
            let stageCount = 0;
            let nonStageCount = 0;
            
            registrations.forEach(reg => {
                if (reg.candidates && reg.candidates.map(c => c.toString()).includes(cand._id.toString())) {
                    if (reg.programme && (reg.programme.stageType === 'stage' || reg.programme.type === 'Stage')) stageCount++;
                    if (reg.programme && (reg.programme.stageType === 'non-stage' || reg.programme.type === 'Non-Stage')) nonStageCount++;
                }
            });
            
            let status = 'pending'; // Yellow (no program selected in either Stage or Non-Stage)
            if (stageCount === 1 && nonStageCount === 1) {
                status = 'compliant'; // Green
            } else if (stageCount > 1 || nonStageCount > 1) {
                status = 'violated'; // Red
            }
            
            cand.bylawStatus = {
                isCompliant: status === 'compliant',
                status,
                stageCount,
                nonStageCount,
                limits: { stage: 1, nonStage: 1 }
            };
        });
`;

content = content.replace(/candidates\.forEach\(cand => \{[\s\S]*?cand\.bylawStatus = \{[\s\S]*?\};[\s\S]*?\}\);/, newLogic);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Bylaw patched');