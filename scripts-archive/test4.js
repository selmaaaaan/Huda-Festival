const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/resultController.js', 'utf8').split('\n');
console.log("Lines 1-15:");
console.log(code.slice(0, 15).join('\n'));
