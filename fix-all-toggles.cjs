const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

// Replace "Allow New Registrations" button
code = code.replace(
    /<button \n\s*onClick=\{\(\) => setShowConfirmToggleReg\(true\)\}\n\s*className=\{`relative[\s\S]*?<\/button>/,
    `<button 
                onClick={() => setShowConfirmToggleReg(true)}
                style={{ backgroundColor: settings.isRegistrationOpen ? '#10b981' : '#ef4444', width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer', border: 'none' }}
              >
                <span style={{ display: 'inline-block', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: settings.isRegistrationOpen ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              </button>`
);

// Replace "Allow Topic Registrations" button
code = code.replace(
    /<button \n\s*onClick=\{\(\) => setShowConfirmToggleTopic\(true\)\}\n\s*className=\{`relative[\s\S]*?<\/button>/,
    `<button 
                onClick={() => setShowConfirmToggleTopic(true)}
                style={{ backgroundColor: settings.topicRegistrationEnabled ? '#10b981' : '#ef4444', width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer', border: 'none' }}
              >
                <span style={{ display: 'inline-block', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: settings.topicRegistrationEnabled ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              </button>`
);

// Replace "Enable Maintenance Mode" button
code = code.replace(
    /<button \n\s*onClick=\{handleToggleMaintenance\}\n\s*className=\{`relative[\s\S]*?<\/button>/,
    `<button 
                onClick={handleToggleMaintenance}
                style={{ backgroundColor: settings.maintenanceMode ? '#ef4444' : '#cbd5e1', width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer', border: 'none' }}
              >
                <span style={{ display: 'inline-block', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: settings.maintenanceMode ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              </button>`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', code);
console.log('Fixed all remaining toggle buttons.');
