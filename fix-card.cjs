const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/components/GettingStartedCard.jsx', 'utf8');
txt = txt.replace(/\\\`/g, '`');
fs.writeFileSync('admin-hudafestival-main/src/components/GettingStartedCard.jsx', txt);
