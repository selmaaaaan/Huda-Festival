const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

c = c.replace(/'Ad No': reg\.candidates\?\.map\(c => c\.admissionNo\)\.join\(\', '\) \|\| '-',/g, `'Ad No': reg.candidates?.map(c => c.admissionNo).join('\\n') || '-',`);
c = c.replace(/'Name': reg\.candidates\?\.map\(c => c\.name\)\.join\(\', '\) \|\| '-',/g, `'Name': reg.candidates?.map(c => c.name).join('\\n') || '-',`);

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', c, 'utf8');
console.log("Done");