const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/programmeController.js', 'utf8');
console.log(c.split('\n').slice(230, 250).join('\n'));
