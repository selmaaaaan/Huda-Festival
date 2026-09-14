const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

// 1. Add state for categoryTopicRegistrationStatus
code = code.replace(
    /const \[isTopicRegistrationEnabled, setIsTopicRegistrationEnabled\] = useState\(true\);/,
    `const [isTopicRegistrationEnabled, setIsTopicRegistrationEnabled] = useState(true);
    const [categoryTopicStatus, setCategoryTopicStatus] = useState({});`
);

// 2. Set the state when fetching settings
code = code.replace(
    /if \(settingsRes\.data\?\.topicRegistrationEnabled !== undefined\)\n\s*setIsTopicRegistrationEnabled\(settingsRes\.data\.topicRegistrationEnabled\);/,
    `if (settingsRes.data?.topicRegistrationEnabled !== undefined)
            setIsTopicRegistrationEnabled(settingsRes.data.topicRegistrationEnabled);
          if (settingsRes.data?.categoryTopicRegistrationStatus) {
            setCategoryTopicStatus(settingsRes.data.categoryTopicRegistrationStatus);
          }`
);

// 3. Fix the Submit Topic button onClick bug
code = code.replace(
    /<Button onClick=\{openNewRegistration\} variant="primary" className="shadow-md">\n\s*<Plus size=\{15\} \/>\n\s*\{activeTab === 'topics' \? 'Submit Topic' : 'New Registration'\}\n\s*<\/Button>/,
    `<Button onClick={activeTab === 'topics' ? openTopicForm : openNewRegistration} variant="primary" className="shadow-md">
                  <Plus size={15} />
                  {activeTab === 'topics' ? 'Submit Topic' : 'New Registration'}
                </Button>`
);

// 4. Update the logic for eligible Topic categories
// We should exclude categories that are explicitly set to false in categoryTopicStatus
code = code.replace(
    /const topicCategories = useMemo\(\(\) => \{\n\s*const cats = \[\.\.\.new Set\(eligibleTopicProgrammes\.map\(p => p\.category\)\)\];\n\s*return cats\.sort\(\);\n\s*\}, \[eligibleTopicProgrammes\]\);/,
    `const topicCategories = useMemo(() => {
    const cats = [...new Set(eligibleTopicProgrammes.map(p => p.category))];
    return cats.filter(cat => categoryTopicStatus[cat] !== false).sort();
  }, [eligibleTopicProgrammes, categoryTopicStatus]);`
);

// 5. If `isTopicRegistrationEnabled` is globally false, block opening the form
code = code.replace(
    /const openTopicForm = \(\) => \{/,
    `const openTopicForm = () => {
    if (isTopicRegistrationEnabled === false) return;`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', code);
console.log('Patched TeamLeaderDashboard.jsx for topic settings and onClick bug');
