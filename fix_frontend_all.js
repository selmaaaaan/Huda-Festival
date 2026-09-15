const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf8');

c = c.replace(
    /const CATEGORIES = \['BID.YAH', 'E_.L.', 'TH.NIYAH', 'TH.NAWIYYAH', 'E.LIYAH', 'KULLIYYAH'\];/,
    "const CATEGORIES = ['All', 'BIDĀYAH', 'E_ŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'EĀLIYAH', 'KULLIYYAH'];"
);

// Fallback regex if encoding messed it up
if (!c.includes("'All', 'BID")) {
    c = c.replace(
        /const CATEGORIES = \[[^\]]+\];/,
        "const CATEGORIES = ['All', 'BIDĀYAH', 'E_ŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'EĀLIYAH', 'KULLIYYAH'];"
    );
}

c = c.replace(
    /useState\('BID.YAH'\);/,
    "useState('All');"
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', c, 'utf8');
console.log("Fixed frontend");