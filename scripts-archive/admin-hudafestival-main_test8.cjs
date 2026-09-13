const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
console.log(code.substring(code.indexOf('const renderPage = () => {'), code.indexOf('return (')));
