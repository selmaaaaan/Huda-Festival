const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');

c = c.replace(
    `import SettingsPage from './pages/SettingsPage';`,
    `import SettingsPage from './pages/SettingsPage';\nimport ConflictCheckerPage from './pages/ConflictCheckerPage';`
);

c = c.replace(
    `      case 'jury_slips':
        pageContent = <JurySlipsPage />;
        break;`,
    `      case 'jury_slips':
        pageContent = <JurySlipsPage />;
        break;
      case 'conflict_checker':
        pageContent = <ConflictCheckerPage />;
        break;`
);

fs.writeFileSync('admin-hudafestival-main/src/App.jsx', c, 'utf8');
console.log('Fixed App.jsx');