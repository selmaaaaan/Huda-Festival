const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/teamController.js', 'utf8');

c = c.replace(
    /if \(category !== 'KULLIYYAH'\) \{\s*candQuery\.category = category;\s*\}/,
    `if (category !== 'KULLIYYAH' && category !== 'All') {
            candQuery.category = category;
        }`
);

c = c.replace(
    /const progQuery = \{ category: category \};/,
    `const progQuery = {};
        if (category !== 'All') {
            progQuery.category = category;
        }`
);

fs.writeFileSync('backend-hudafestival-main/controllers/teamController.js', c, 'utf8');
console.log("Fixed teamController");