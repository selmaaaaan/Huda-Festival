const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('const confirmAction = useConfirm();')) {
        content = content.replace(/export default function [a-zA-Z]+\(\) \{/, (match) => match + "\n  const confirmAction = useConfirm();\n");
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
}

fixFile('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx');
fixFile('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx');
fixFile('admin-hudafestival-main/src/pages/TopicManagementPage.jsx');
