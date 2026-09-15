const fs = require('fs');

function fix(filePath, funcName) {
    let c = fs.readFileSync(filePath, 'utf8');
    c = c.replace(/  const confirmAction = useConfirm\(\);\n/, ''); // remove first incorrect occurrence
    
    // now we need to make sure the component has it
    if (!c.includes('  const confirmAction = useConfirm();')) {
        c = c.replace(/export default function [a-zA-Z]+\(\) \{\r?\n/, (match) => match + "  const confirmAction = useConfirm();\n");
    }
    
    fs.writeFileSync(filePath, c, 'utf8');
}

fix('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx');
fix('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx');
console.log("Fixed.");