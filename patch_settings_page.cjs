const fs = require('fs');

let c = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

c = c.replace(
    /import ConfirmDialog from '\.\.\/components\/ConfirmDialog';/,
    "import ConfirmDialog from '../components/ConfirmDialog';\nimport DataImportSection from '../components/DataImportSection';"
);

const renderRegex = /\{showConfirmToggleReg && \([\s\S]*?<\/div>\s*\);\s*\};\s*export default SettingsPage;/;
const match = c.match(renderRegex)[0];
const replaced = match.replace(
    /<\/div>\s*\);\s*\}\s*;/g, 
    ""
);
// Wait, regex replace might be tricky on the end of the file.
// Let's just append it before the last </div>
