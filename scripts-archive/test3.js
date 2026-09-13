const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/resultController.js', 'utf8').split('\n');
console.log("Lines 125-135:");
console.log(code.slice(125, 135).join('\n'));
