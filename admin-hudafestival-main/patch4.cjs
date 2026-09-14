const fs = require('fs');
let txt = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add import
if (!txt.includes('ConfirmDialog')) {
    txt = txt.replace('import { Search, Bell, AlertTriangle, LogOut, Sun, Moon } from \'lucide-react\';', 'import ConfirmDialog from \'./components/ConfirmDialog\';\nimport { Search, Bell, AlertTriangle, LogOut, Sun, Moon } from \'lucide-react\';');
}

// 2. Add state
if (!txt.includes('showLogoutConfirm')) {
    txt = txt.replace('const [searchOpen, setSearchOpen] = useState(false);', 'const [searchOpen, setSearchOpen] = useState(false);\n  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);');
}

// 3. Update button
txt = txt.replace('onClick={handleLogout}', 'onClick={() => setShowLogoutConfirm(true)}');

// 4. Add Dialog Component
const dialogCode = `
        <ConfirmDialog 
          open={showLogoutConfirm} 
          title="Confirm Logout" 
          message="Are you sure you want to log out?" 
          confirmLabel="Log Out" 
          onConfirm={() => {
            setShowLogoutConfirm(false);
            handleLogout();
          }} 
          onCancel={() => setShowLogoutConfirm(false)} 
        />
      </>
    );`;

txt = txt.replace('      </>\n    );', dialogCode);
fs.writeFileSync('src/App.jsx', txt);
