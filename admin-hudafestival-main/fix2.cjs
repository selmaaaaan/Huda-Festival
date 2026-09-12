const fs = require('fs');
let text = fs.readFileSync('src/pages/JudgePanel.jsx', 'utf8');
// Fix all weird escapes
text = text.replace(/className=\{\\`/g, "className={`");
text = text.replace(/\\\`\}/g, "`}");
text = text.replace(/\\\$\{/g, "${");
text = text.replace(/className=\{\\w/g, "className={`w");
fs.writeFileSync('src/pages/JudgePanel.jsx', text);
