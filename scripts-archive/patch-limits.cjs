const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/registrationController.js', 'utf8');

// Update the counting logic to exclude Starred items
const countLogicOld = `if (p && p.format === 'Individual' && p.type !== 'Kulliyyah' && p.category === candidate.category) {`;
const countLogicNew = `if (p && p.format === 'Individual' && p.type !== 'Kulliyyah' && p.category === candidate.category && !p.isStarred) {`;
code = code.replace(new RegExp(countLogicOld.replace(/[.*+?^$\{key\}()|[\\]\\\\]/g, '\\\\$&'), 'g'), countLogicNew);

// Update the limit check logic
const checkLogicOld = `const isStage = programme.stageType.toLowerCase() === 'stage';
                    const isNonStage = programme.stageType.toLowerCase() === 'non-stage';

                    const newStageCount = stageCount + (isStage ? 1 : 0);
                    const newNonStageCount = nonStageCount + (isNonStage ? 1 : 0);
                    const newTotalCount = newStageCount + newNonStageCount;

                    if (newStageCount > limits.stage) {
                        return res.status(400).json({ message: \`This candidate has already reached the maximum of \${limits.stage} stage items for \${candidate.category}\` });
                    }
                    if (newNonStageCount > limits.nonStage) {
                        return res.status(400).json({ message: \`This candidate has already reached the maximum of \${limits.nonStage} non-stage items for \${candidate.category}\` });
                    }
                    if (newTotalCount > limits.total) {
                        return res.status(400).json({ message: \`This candidate has already reached the maximum of \${limits.total} total items for \${candidate.category}\` });
                    }`;

const checkLogicNew = `const isStage = !programme.isStarred && programme.stageType.toLowerCase() === 'stage';
                    const isNonStage = !programme.isStarred && programme.stageType.toLowerCase() === 'non-stage';

                    const newStageCount = stageCount + (isStage ? 1 : 0);
                    const newNonStageCount = nonStageCount + (isNonStage ? 1 : 0);
                    const newTotalCount = newStageCount + newNonStageCount;

                    if (isStage && newStageCount > limits.stage) {
                        return res.status(400).json({ message: \`This candidate has already reached the maximum of \${limits.stage} stage items for \${candidate.category}\` });
                    }
                    if (isNonStage && newNonStageCount > limits.nonStage) {
                        return res.status(400).json({ message: \`This candidate has already reached the maximum of \${limits.nonStage} non-stage items for \${candidate.category}\` });
                    }
                    if ((isStage || isNonStage) && newTotalCount > limits.total) {
                        return res.status(400).json({ message: \`This candidate has already reached the maximum of \${limits.total} total items for \${candidate.category}\` });
                    }`;
code = code.replace(checkLogicOld, checkLogicNew);

fs.writeFileSync('backend-hudafestival-main/controllers/registrationController.js', code);
console.log('Fixed limits check in registrationController.js');
