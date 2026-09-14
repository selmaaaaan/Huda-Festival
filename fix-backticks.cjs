const fs = require('fs');

function fixFile(file) {
  let txt = fs.readFileSync(file, 'utf8');
  txt = txt.split('\\`').join('`');
  fs.writeFileSync(file, txt);
}

fixFile('admin-hudafestival-main/src/pages/SettingsPage.jsx');
fixFile('admin-hudafestival-main/src/pages/UsersPage.jsx');
