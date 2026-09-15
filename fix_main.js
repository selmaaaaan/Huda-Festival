const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/main.jsx', 'utf8');
c = c.replace(
    `import { AuthProvider } from './context/AuthContext';`,
    `import { AuthProvider } from './context/AuthContext';\nimport { ConfirmProvider } from './context/ConfirmContext';`
);
c = c.replace(
    `<AuthProvider>`,
    `<AuthProvider>\n      <ConfirmProvider>`
);
c = c.replace(
    `</AuthProvider>`,
    `</ConfirmProvider>\n    </AuthProvider>`
);
fs.writeFileSync('admin-hudafestival-main/src/main.jsx', c, 'utf8');
console.log('Fixed main.jsx');