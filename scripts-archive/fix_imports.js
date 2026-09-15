const fs = require('fs');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = dir + '/' + f;
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir('admin-hudafestival-main/src/pages', (filePath) => {
    if (filePath.endsWith('.jsx')) {
        let c = fs.readFileSync(filePath, 'utf8');
        if (c.includes('useAlert();') && !c.includes("import { useAlert }")) {
            c = `import { useAlert } from '../context/AlertContext';\n` + c;
            fs.writeFileSync(filePath, c, 'utf8');
        }
    }
});