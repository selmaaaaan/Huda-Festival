const fs = require('fs');
let txt = fs.readFileSync('src/App.jsx', 'utf8');

// There are two ConfirmDialogs now, the first one is misplaced.
const matches = [...txt.matchAll(/<ConfirmDialog[\s\S]*?\/>/g)];
if (matches.length > 1) {
    // replace the first one with empty string
    txt = txt.replace(matches[0][0], '');
}

fs.writeFileSync('src/App.jsx', txt);
