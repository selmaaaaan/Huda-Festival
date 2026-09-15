const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/components/Sidebar.jsx', 'utf8');

c = c.replace(
    `{ key: 'jury_slips', label: 'Participant List', icon: FileText },`,
    `{ key: 'jury_slips', label: 'Participant List', icon: FileText },
  { key: 'conflict_checker', label: 'Conflict Checker', icon: FileText },`
);

fs.writeFileSync('admin-hudafestival-main/src/components/Sidebar.jsx', c, 'utf8');
console.log('Fixed Sidebar.jsx');