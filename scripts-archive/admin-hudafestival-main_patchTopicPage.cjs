const fs = require('fs');
let content = fs.readFileSync('src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

// Add state
content = content.replace(
  `const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);`,
  `const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);\n  const [isTopicRegistrationEnabled, setIsTopicRegistrationEnabled] = useState(true);`
);

// Add to settings parser
content = content.replace(
  `if (settingsRes.data?.isRegistrationOpen !== undefined)\n        setIsRegistrationOpen(settingsRes.data.isRegistrationOpen);`,
  `if (settingsRes.data?.isRegistrationOpen !== undefined)\n        setIsRegistrationOpen(settingsRes.data.isRegistrationOpen);\n      if (settingsRes.data?.topicRegistrationEnabled !== undefined)\n        setIsTopicRegistrationEnabled(settingsRes.data.topicRegistrationEnabled);`
);

// Update Modal condition
content = content.replace(
  `{success ? (`,
  `{!isTopicRegistrationEnabled ? (
            <motion.div key="closed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 flex flex-col items-center text-center space-y-4">
              <motion.div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
                <AlertTriangle size={32} />
              </motion.div>
              <h3 className="text-lg font-bold text-[var(--color-text-heading)]">Topic Registration is closed</h3>
              <Button variant="ghost" onClick={() => setShowTopicForm(false)}>Close</Button>
            </motion.div>
          ) : success ? (`
);

// Update action condition (for edit button and new button)
content = content.replace(
  `if (isRegistrationOpen === false) return;`,
  `if (isTopicRegistrationEnabled === false) return;` // Wait, did I replace it with isRegistrationOpen in the previous prompt? Yes.
);
// I have to replace BOTH `isRegistrationOpen === false` and `isRegistrationOpen !== false` for TOPIC sections.
// Note: `TeamTopicRegistrationPage` uses the duplicated logic, but the actual topic form should use `isTopicRegistrationEnabled`.

fs.writeFileSync('src/pages/TeamTopicRegistrationPage.jsx', content);
