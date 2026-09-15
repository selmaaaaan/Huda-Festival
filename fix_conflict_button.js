const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', 'utf8');

c = c.replace(
    /<Button onClick=\{handleCheck\} loading=\{loading\} disabled=\{!prog1Code \|\| !prog2Code\} variant="primary" className="px-8">/,
    `<Button onClick={handleCheck} loading={loading} disabled={false} variant="primary" className="px-8">`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', c, 'utf8');
console.log("Done");