const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');
txt = txt.replace(/import SchedulePage from '\.\/pages\/SchedulePage';/, "import SchedulePage from './pages/SchedulePage';\nimport JurySlipsPage from './pages/JurySlipsPage';");
txt = txt.replace(/case 'schedule':/, "case 'jury_slips':\n        pageContent = <JurySlipsPage />;\n        break;\n      case 'schedule':");
fs.writeFileSync('admin-hudafestival-main/src/App.jsx', txt);
