const fs = require('fs');

let appContent = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf-8');
appContent = appContent.replace("import ParticipantReportPage from './pages/ParticipantReportPage';\n", "");
appContent = appContent.replace("case 'participant_report':\n        pageContent = <ParticipantReportPage />;\n        break;\n", "");
fs.writeFileSync('admin-hudafestival-main/src/App.jsx', appContent, 'utf-8');

let sidebarContent = fs.readFileSync('admin-hudafestival-main/src/components/Sidebar.jsx', 'utf-8');
sidebarContent = sidebarContent.replace("{ key: 'jury_slips', label: 'Jury Slips', icon: FileText },\n    { key: 'participant_report', label: 'Participant List (All)', icon: FileSpreadsheet },", "{ key: 'jury_slips', label: 'Participant List', icon: FileText },");
fs.writeFileSync('admin-hudafestival-main/src/components/Sidebar.jsx', sidebarContent, 'utf-8');

console.log('Fixed Sidebar and App');