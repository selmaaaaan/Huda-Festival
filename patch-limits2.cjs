const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/registrationController.js', 'utf8');

const regex = /const isStage = programme\.stageType\.toLowerCase\(\) === 'stage';[\s\S]*?if \(newTotalCount > limits\.total\) \{[\s\S]*?return res\.status\(400\)\.json\(\{ message: `This candidate has already reached the maximum of \$\{limits\.total\} total items for \$\{candidate\.category\}` \}\);\n\s*\}/;

const replacement = `const isStage = !programme.isStarred && programme.stageType.toLowerCase() === 'stage';
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

code = code.replace(regex, replacement);

fs.writeFileSync('backend-hudafestival-main/controllers/registrationController.js', code);
console.log('Successfully patched limits check');
