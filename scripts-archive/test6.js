const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/resultController.js', 'utf8').split('\n');
console.log(code.slice(120, 246).join('\n'));
