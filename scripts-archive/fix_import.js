const fs = require('fs');

const file = 'admin-hudafestival-main/src/pages/NotificationsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { useConfirm }")) {
    content = content.replace(/(import React.*?;\r?\n)/, "$1import { useConfirm } from '../context/ConfirmContext';\n");
}

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed NotificationsPage");