const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');
console.log(code.substring(code.indexOf('const visibleNavItems'), code.indexOf('return (')));
