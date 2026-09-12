const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/resultController.js', 'utf8');
console.log(c.split('\n').slice(340, 360).join('\n'));
