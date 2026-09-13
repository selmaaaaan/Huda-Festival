const fs = require('fs');
let text = fs.readFileSync('src/pages/JudgePanel.jsx', 'utf8');
text = text.replace(/className=\{\\\`/g, "className={`");
text = text.replace(/\\`\}/g, "`}");
text = text.replace(/Candidate \\\$\{sub/g, "Candidate ${sub");
fs.writeFileSync('src/pages/JudgePanel.jsx', text);
