const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/components/GettingStartedCard.jsx', 'utf8');

txt = txt.replace(/`\\\$([\w.]+)%`/g, '`${$1}%`');

fs.writeFileSync('admin-hudafestival-main/src/components/GettingStartedCard.jsx', txt);
