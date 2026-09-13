const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let filePath = path.join(controllersDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    let newContent = content.replace(/(exports\.\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*\{)([\s\S]*?)(\n\};)/g, (match, signature, body, ending) => {
        const fnMatch = signature.match(/exports\.(\w+)/);
        const fnName = fnMatch ? fnMatch[1] : 'perform action';
        
        let newBody = body.replace(/res\.status\(500\)\.json\(\{.*?\}\)/g, 
            "res.status(500).json({ message: 'Failed to " + fnName + "', error: error.message })"
        );
        return signature + newBody + ending;
    });

    // Handle standard functions const name = async ...
    newContent = newContent.replace(/(const\s+(\w+)\s*=\s*async\s*\([^)]*\)\s*=>\s*\{)([\s\S]*?)(\n\};)/g, (match, signature, fnName, body, ending) => {
        let newBody = body.replace(/res\.status\(500\)\.json\(\{.*?\}\)/g, 
            "res.status(500).json({ message: 'Failed to " + fnName + "', error: error.message })"
        );
        return signature + newBody + ending;
    });

    fs.writeFileSync(filePath, newContent);
});
console.log('Done better');
