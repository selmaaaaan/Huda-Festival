const fs = require('fs');
let code = fs.readFileSync('src/pages/TeamTopicRegistrationPage.jsx', 'utf8');
code = code.replace(
  `<Modal isOpen={showTopicForm} onClose={() => setShowTopicForm(false)} title="Submit Topic">`,
  `<Modal isOpen={showTopicForm} onClose={() => setShowTopicForm(false)} title={editTopicId ? "Edit Topic" : "Submit Topic"}>`
);
fs.writeFileSync('src/pages/TeamTopicRegistrationPage.jsx', code);
