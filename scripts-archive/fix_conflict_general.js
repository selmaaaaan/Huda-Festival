const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', 'utf8');

c = c.replace(
    /const CATEGORY_ORDER = \['BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'\];/,
    `const CATEGORY_ORDER = ['BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH', 'GENERAL'];`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', c, 'utf8');
console.log("Done");