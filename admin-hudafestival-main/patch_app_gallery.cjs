const fs = require('fs');
const file = 'src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import GalleryPage')) {
  content = content.replace(
    "import ActivityLogsPage from './pages/ActivityLogsPage';",
    "import ActivityLogsPage from './pages/ActivityLogsPage';\nimport GalleryPage from './pages/GalleryPage';"
  );
}

if (!content.includes("case 'gallery':")) {
  content = content.replace(
    "case 'settings':",
    "case 'gallery':\n        pageContent = <GalleryPage />;\n        break;\n      case 'settings':"
  );
}

fs.writeFileSync(file, content);
console.log("App.jsx patched for GalleryPage.");
