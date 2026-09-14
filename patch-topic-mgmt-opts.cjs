const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8');

code = code.replace(
    /<option value="fixed-list">Fixed List<\/option>/,
    `<option value="fixed-list">Fixed List (Team Exclusive)</option>\n                      <option value="fixed-list-global">Fixed List (Global Exclusive)</option>`
);

code = code.replace(
    /topicMode === 'fixed-list'/g,
    `(topicMode === 'fixed-list' || topicMode === 'fixed-list-global')`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', code);
console.log('Updated TopicManagementPage options');
