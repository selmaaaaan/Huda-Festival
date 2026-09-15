const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/main.jsx', 'utf8');
c = c.replace(
    `import { ConfirmProvider } from './context/ConfirmContext';`,
    `import { ConfirmProvider } from './context/ConfirmContext';\nimport { AlertProvider } from './context/AlertContext';`
);
c = c.replace(
    `<ConfirmProvider>`,
    `<ConfirmProvider>\n        <AlertProvider>`
);
c = c.replace(
    `</ConfirmProvider>`,
    `</AlertProvider>\n      </ConfirmProvider>`
);
fs.writeFileSync('admin-hudafestival-main/src/main.jsx', c, 'utf8');
console.log('Fixed main.jsx for Alert');