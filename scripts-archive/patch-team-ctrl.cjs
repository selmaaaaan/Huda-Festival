const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/teamController.js', 'utf8');

if (!code.includes("const Settings = require('../models/Settings');")) {
    code = code.replace("const Team = require('../models/Team');", "const Team = require('../models/Team');\nconst Settings = require('../models/Settings');");
}

code = code.replace(
    /const registrations = await Registration\.find\(\{ team: teamId \}\)\.populate\('programme', '([^']+)'\)\.lean\(\);/,
    "const registrations = await Registration.find({ team: teamId }).populate('programme', '$1 isStarred').lean();\n        const settings = await Settings.findOne();"
);

const calcOld = `        candidates.forEach(cand => {
            let stageCount = 0;
            let nonStageCount = 0;
            
            registrations.forEach(reg => {
                if (reg.candidates && reg.candidates.map(c => c.toString()).includes(cand._id.toString())) {
                    if (reg.programme && (reg.programme.stageType === 'stage' || reg.programme.type === 'Stage')) stageCount++;
                    if (reg.programme && (reg.programme.stageType === 'non-stage' || reg.programme.type === 'Non-Stage')) nonStageCount++;
                }
            });
            
            cand.bylawStatus = {
                isCompliant: stageCount >= 1 && nonStageCount >= 1,
                stageCount,
                nonStageCount
            };
        });`;

const calcNew = `        candidates.forEach(cand => {
            let stageCount = 0;
            let nonStageCount = 0;
            let individualStageCount = 0;
            let individualNonStageCount = 0;
            
            registrations.forEach(reg => {
                if (reg.candidates && reg.candidates.map(c => c.toString()).includes(cand._id.toString())) {
                    const isStage = reg.programme && (reg.programme.stageType === 'stage' || reg.programme.type === 'Stage');
                    const isNonStage = reg.programme && (reg.programme.stageType === 'non-stage' || reg.programme.type === 'Non-Stage');
                    const isGroup = reg.programme && reg.programme.format === 'Group';
                    const isStarred = reg.programme && reg.programme.isStarred === true;

                    if (isStage) {
                        stageCount++;
                        if (!isGroup && !isStarred) individualStageCount++;
                    }
                    if (isNonStage) {
                        nonStageCount++;
                        if (!isGroup && !isStarred) individualNonStageCount++;
                    }
                }
            });
            
            const limits = settings?.categoryItemLimits ? settings.categoryItemLimits.get(cand.category) : { total: 9, stage: 4, nonStage: 5 };
            
            let status = 'pending';
            if (limits && (individualStageCount > limits.stage || individualNonStageCount > limits.nonStage || (individualStageCount + individualNonStageCount) > limits.total)) {
                status = 'violated';
            } else if (stageCount >= 1 && nonStageCount >= 1) {
                status = 'compliant';
            }

            cand.bylawStatus = {
                isCompliant: status === 'compliant',
                status: status,
                stageCount,
                nonStageCount,
                individualStageCount,
                individualNonStageCount,
                limits: limits ? { total: limits.stage + limits.nonStage, stage: limits.stage, nonStage: limits.nonStage } : null
            };
        });`;

code = code.replace(calcOld, calcNew);
fs.writeFileSync('backend-hudafestival-main/controllers/teamController.js', code);
console.log('Patched teamController with new calculation');
