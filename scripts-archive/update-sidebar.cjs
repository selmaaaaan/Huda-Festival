const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/components/Sidebar.jsx', 'utf8');

txt = txt.replace(
  "import { LayoutDashboard, Users, Calendar, Trophy, Clock, LogOut, Sliders, Activity, ChevronLeft, ChevronRight, Settings, Sun, Moon, Image as ImageIcon, Bell, ClipboardList, FileText, CalendarClock, Radio, FileSpreadsheet, BookOpen, Table2 } from 'lucide-react';",
  "import { LayoutDashboard, Users, UserPlus, Calendar, Trophy, Clock, LogOut, Sliders, Activity, ChevronLeft, ChevronRight, Settings, Sun, Moon, Image as ImageIcon, Bell, ClipboardList, FileText, CalendarClock, Radio, FileSpreadsheet, BookOpen, Table2 } from 'lucide-react';"
);

txt = txt.replace(
  "{ key: 'settings', label: 'Settings', icon: Settings }",
  "{ key: 'users', label: 'Users & Teams', icon: UserPlus },\n    { key: 'settings', label: 'Settings', icon: Settings }"
);

fs.writeFileSync('admin-hudafestival-main/src/components/Sidebar.jsx', txt);
