const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/registrationController.js', 'utf8');

code = code.replace(
    /const isStage = programme\.stageType\.toLowerCase\(\) === 'stage';/g,
    `const isStage = !programme.isStarred && programme.stageType.toLowerCase() === 'stage';`
);
code = code.replace(
    /const isNonStage = programme\.stageType\.toLowerCase\(\) === 'non-stage';/g,
    `const isNonStage = !programme.isStarred && programme.stageType.toLowerCase() === 'non-stage';`
);

code = code.replace(
    /if \(newStageCount > limits\.stage\)/g,
    `if (isStage && newStageCount > limits.stage)`
);

code = code.replace(
    /if \(newNonStageCount > limits\.nonStage\)/g,
    `if (isNonStage && newNonStageCount > limits.nonStage)`
);

code = code.replace(
    /if \(newTotalCount > limits\.total\)/g,
    `if ((isStage || isNonStage) && newTotalCount > limits.total)`
);

fs.writeFileSync('backend-hudafestival-main/controllers/registrationController.js', code);
console.log('Patched line by line successfully');
