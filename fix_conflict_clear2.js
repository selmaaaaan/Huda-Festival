const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', 'utf8');

c = c.replace(
    /setProg2Code\(''\);/g,
    `setProg2Code('');\n                                setResults(null);`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', c, 'utf8');
console.log("Done");