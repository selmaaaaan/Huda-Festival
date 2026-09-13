const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/resultController.js', 'utf8').split('\n');
console.log("Lines 115-135:");
console.log(code.slice(115, 135).join('\n'));
