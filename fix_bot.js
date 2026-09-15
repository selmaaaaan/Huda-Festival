const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

const s = "{selectedTopicProg?.topicMode === 'free-text' && (";
const idx = c.indexOf(s);
if (idx !== -1) {
    const endStr = ")}";
    const endIdx = c.indexOf(endStr, idx + 100) + 2;
    c = c.substring(0, idx) + c.substring(endIdx);
    fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
    console.log("REMOVED");
} else {
    console.log("NOT FOUND");
}