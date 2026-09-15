const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', 'utf8');

c = c.replace(
    /onChange=\{e => setProg1Code\(e\.target\.value\.toUpperCase\(\)\)\}/,
    `onChange={e => { setProg1Code(e.target.value.toUpperCase()); setResults(null); }}`
);

c = c.replace(
    /onChange=\{e => setProg2Code\(e\.target\.value\.toUpperCase\(\)\)\}/,
    `onChange={e => { setProg2Code(e.target.value.toUpperCase()); setResults(null); }}`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', c, 'utf8');
console.log("Done");