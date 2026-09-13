const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let filePath = path.join(controllersDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace generic 500 errors
    let modifiedContent = content.replace(
        /res\.status\(500\)\.json\(\{\s*message:\s*(['"])(.*?Server\s*[Ee]rror.*?)\1\s*\}\)/g,
        "res.status(500).json({ message: 'Error: ' + error.message || \\\, error: error.message })"
    );

    // Some might not have been matched due to formatting, let's just do a simpler replace.
    modifiedContent = modifiedContent.replace(
        /res\.status\(500\)\.json\(\{.*?\}\)/g,
        "res.status(500).json({ message: 'Server operation failed', error: error.message })"
    );

    fs.writeFileSync(filePath, modifiedContent);
});
console.log('Done');
