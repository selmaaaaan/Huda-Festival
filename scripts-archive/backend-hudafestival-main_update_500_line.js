const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let filePath = path.join(controllersDir, file);
    let lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    let currentFnName = 'operation';
    
    for (let i = 0; i < lines.length; i++) {
        // Match exports.fnName = async
        let m1 = lines[i].match(/exports\.(\w+)\s*=\s*(?:async\s*)?\(/);
        if (m1) currentFnName = m1[1];
        
        // Match const fnName = async
        let m2 = lines[i].match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/);
        if (m2) currentFnName = m2[1];
        
        // Match res.status(500).json({ message: 'Server error' ... })
        if (lines[i].includes('res.status(500).json({')) {
            lines[i] = lines[i].replace(
                /res\.status\(500\)\.json\(\{.*?\}\)/g, 
                "res.status(500).json({ message: 'Failed to " + currentFnName + "', error: error.message || 'Unknown error' })"
            );
        }
    }

    fs.writeFileSync(filePath, lines.join('\n'));
});
console.log('Done line by line');
