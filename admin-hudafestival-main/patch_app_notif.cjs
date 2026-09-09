const fs = require('fs');
const file = 'src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import NotificationsPage')) {
  content = content.replace(
    "import GalleryPage from './pages/GalleryPage';",
    "import GalleryPage from './pages/GalleryPage';\nimport NotificationsPage from './pages/NotificationsPage';"
  );
}

if (!content.includes("case 'notifications':")) {
  content = content.replace(
    "case 'settings':",
    "case 'notifications':\n        pageContent = <NotificationsPage />;\n        break;\n      case 'settings':"
  );
}

fs.writeFileSync(file, content);
console.log("App.jsx patched for NotificationsPage.");
