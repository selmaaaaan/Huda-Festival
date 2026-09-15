const fs = require('fs');
let content = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf-8');

content = content.replace(
    "import PointAdjustmentPage from './pages/PointAdjustmentPage';",
    "import PointAdjustmentPage from './pages/PointAdjustmentPage';\nimport ParticipantReportPage from './pages/ParticipantReportPage';"
);

content = content.replace(
    "case 'adjustments':\n        pageContent = <PointAdjustmentPage />;\n        break;",
    "case 'adjustments':\n        pageContent = <PointAdjustmentPage />;\n        break;\n      case 'participant report':\n        pageContent = <ParticipantReportPage />;\n        break;"
);

fs.writeFileSync('admin-hudafestival-main/src/App.jsx', content, 'utf-8');
console.log('App patched');