const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/teamController.js', 'utf8');

c = c.replace(
    /if \(category !== 'KULLIYYAH' && category !== 'All'\) \{/,
    `if (category !== 'KULLIYYAH' && category !== 'All' && category !== 'GENERAL') {`
);

fs.writeFileSync('backend-hudafestival-main/controllers/teamController.js', c, 'utf8');
console.log("Done");