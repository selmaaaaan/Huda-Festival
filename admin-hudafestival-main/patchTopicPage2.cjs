const fs = require('fs');
let content = fs.readFileSync('src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

content = content.replace(
  `const openNewRegistration = () => {\n    if (isRegistrationOpen === false) return;`,
  `const openNewRegistration = () => {\n    if (isTopicRegistrationEnabled === false) return;`
);

content = content.replace(
  `const openEditTopic = (t) => {\n    if (isRegistrationOpen === false) return;`,
  `const openEditTopic = (t) => {\n    if (isTopicRegistrationEnabled === false) return;`
);

content = content.replace(
  `{isRegistrationOpen !== false && t.status !== 'approved' && (`,
  `{isTopicRegistrationEnabled !== false && t.status !== 'approved' && (`
);

fs.writeFileSync('src/pages/TeamTopicRegistrationPage.jsx', content);
