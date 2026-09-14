const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');

txt = txt.replace("import SettingsPage from './pages/SettingsPage';", "import SettingsPage from './pages/SettingsPage';\nimport UsersPage from './pages/UsersPage';");

txt = txt.replace("case 'settings':\n        pageContent = <SettingsPage />;\n        break;", "case 'users':\n        pageContent = <UsersPage />;\n        break;\n      case 'settings':\n        pageContent = <SettingsPage />;\n        break;");

fs.writeFileSync('admin-hudafestival-main/src/App.jsx', txt);
