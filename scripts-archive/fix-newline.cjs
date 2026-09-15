const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');

txt = txt.replace(/const \[isDark, setIsDark\] = useState\(false\);\\n  const \[showLogoutConfirm, setShowLogoutConfirm\] = useState\(false\);/, 
'const [isDark, setIsDark] = useState(false);\n  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);');

fs.writeFileSync('admin-hudafestival-main/src/App.jsx', txt);
