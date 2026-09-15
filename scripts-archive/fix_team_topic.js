const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

c = c.replace(/{t\.status !== 'approved' && \(/g, "{isTopicRegistrationEnabled !== false && t.status !== 'approved' && (");
c = c.replace(/{true && \(\s*<button onClick=\{\(\) => handleDeleteTopic\(t\._id\)\}/g, "{isTopicRegistrationEnabled !== false && t.status !== 'approved' && (\n                              <button onClick={() => handleDeleteTopic(t._id)}");

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
console.log("Fixed TeamTopicRegistrationPage constraints");