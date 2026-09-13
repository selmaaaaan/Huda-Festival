const fs = require('fs');
let text = fs.readFileSync('src/pages/JudgePanel.jsx', 'utf8');
text = text.replace(/className=\{\\\`/g, "className={`");
text = text.replace(/\\`\}/g, "`}");
text = text.replace(/Candidate \\\$\{sub/g, "Candidate ${sub");
text = text.replace(/res\.get\(`\/programmes\/\\\$\{/g, "res.get(`/programmes/${");
text = text.replace(/`\)/g, "`)");
fs.writeFileSync('src/pages/JudgePanel.jsx', text);
