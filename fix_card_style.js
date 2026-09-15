const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf8');

c = c.replace(
    'w-40 shadow-sm border-l-4 border-l-blue-500">',
    'w-40">'
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', c, 'utf8');
console.log("Done");