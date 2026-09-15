const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove it from where it's incorrectly placed
    content = content.replace(/  const confirmAction = useConfirm\(\);\r?\n\r?\n?/g, '');
    
    // Import useConfirm if not imported
    if (!content.includes('useConfirm')) {
        content = content.replace(/(import React.*?;\r?\n)/, "$1import { useConfirm } from '../context/ConfirmContext';\n");
    }

    // Insert const confirmAction = useConfirm(); at the top of the component
    // Need to find the component definition
    const compRegex = /const [a-zA-Z]+ = \(\) => \{\r?\n/;
    const match = content.match(compRegex);
    if (match) {
        content = content.replace(compRegex, match[0] + "  const confirmAction = useConfirm();\n");
    } else {
        const compRegex2 = /const [a-zA-Z]+ = \([^)]*\) => \{\r?\n/;
        const match2 = content.match(compRegex2);
        if (match2) {
             content = content.replace(compRegex2, match2[0] + "  const confirmAction = useConfirm();\n");
        }
    }

    // Fix window.confirm replacements
    content = content.replace(/if \(!window\.confirm\([^)]+\)\) return;/g, (match) => {
        const str = match.match(/window\.confirm\(([^)]+)\)/)[1];
        return `const confirmed = await confirmAction("Confirm", ${str});\n      if (!confirmed) return;`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
}

fixFile('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx');
fixFile('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx');
fixFile('admin-hudafestival-main/src/pages/TopicManagementPage.jsx');
