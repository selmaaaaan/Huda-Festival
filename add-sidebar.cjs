const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/components/Sidebar.jsx', 'utf8');

// Add FileText to imports if not there
if (!txt.includes('FileText')) {
  txt = txt.replace('ClipboardList, ', 'ClipboardList, FileText, ');
}

// Add jury_slips to navItems (maybe after schedule)
txt = txt.replace("{ key: 'schedule', label: 'Schedule', icon: CalendarClock },", "{ key: 'schedule', label: 'Schedule', icon: CalendarClock },\n  { key: 'jury_slips', label: 'Jury Slips', icon: FileText },");

fs.writeFileSync('admin-hudafestival-main/src/components/Sidebar.jsx', txt);
