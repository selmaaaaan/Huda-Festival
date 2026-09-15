const fs = require('fs');
let tld = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

if (!tld.includes('const [isTopicRegistrationEnabled')) {
    tld = tld.replace(
        /const \[isRegistrationOpen, setIsRegistrationOpen\] = useState\(true\);/,
        `const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
    const [isTopicRegistrationEnabled, setIsTopicRegistrationEnabled] = useState(true);`
    );

    tld = tld.replace(
        /if \(settingsRes\.data\?\.isRegistrationOpen !== undefined\)\s*setIsRegistrationOpen\(settingsRes\.data\.isRegistrationOpen\);/,
        `if (settingsRes.data?.isRegistrationOpen !== undefined)
          setIsRegistrationOpen(settingsRes.data.isRegistrationOpen);
        if (settingsRes.data?.topicRegistrationEnabled !== undefined)
          setIsTopicRegistrationEnabled(settingsRes.data.topicRegistrationEnabled);`
    );

    tld = tld.replace(
        /disabled=\{activeTab !== 'topics' && isRegistrationOpen === false\}/g,
        `disabled={activeTab === 'topics' ? !isTopicRegistrationEnabled : !isRegistrationOpen}`
    );

    fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', tld);
    console.log('Patched Topic toggle in Dashboard');
}
