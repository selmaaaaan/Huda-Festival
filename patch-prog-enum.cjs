const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/models/Programme.js', 'utf8');

code = code.replace(
    /enum: \['none', 'free-text', 'fixed-list'\]/,
    `enum: ['none', 'free-text', 'fixed-list', 'fixed-list-global']`
);

fs.writeFileSync('backend-hudafestival-main/models/Programme.js', code);
console.log('Updated Programme.js enum');
