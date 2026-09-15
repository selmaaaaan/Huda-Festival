const fs = require('fs');

// Patch App.jsx to fix the case label
let appContent = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf-8');
appContent = appContent.replace("case 'participant report':", "case 'participant_report':");
fs.writeFileSync('admin-hudafestival-main/src/App.jsx', appContent, 'utf-8');

// Patch Sidebar.jsx
let content = fs.readFileSync('admin-hudafestival-main/src/components/Sidebar.jsx', 'utf-8');

// Fix existing jury slips label
content = content.replace("{ key: 'jury_slips', label: 'Participant List', icon: FileText }", "{ key: 'jury_slips', label: 'Jury Slips', icon: FileText }");

// Add participant_report
content = content.replace("{ key: 'jury_slips', label: 'Jury Slips', icon: FileText },", "{ key: 'jury_slips', label: 'Jury Slips', icon: FileText },\n    { key: 'participant_report', label: 'Participant List (All)', icon: FileSpreadsheet },");

fs.writeFileSync('admin-hudafestival-main/src/components/Sidebar.jsx', content, 'utf-8');
console.log('Sidebar patched');