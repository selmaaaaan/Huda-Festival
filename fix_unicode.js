const fs = require('fs');
const cp = require('child_process');

// Get the original clean string from git
const oldFile = cp.execSync('git show HEAD~2:admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', { encoding: 'utf8' });
const match = oldFile.match(/const CATEGORIES = \[.*?\];/);
if (!match) throw new Error("Could not find CATEGORIES in git history");

let originalArray = match[0]; // e.g. const CATEGORIES = ['BID...', ...];
// Insert 'All', 
let newArray = originalArray.replace('[', "['All', ");

let currentFile = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf8');
currentFile = currentFile.replace(/const CATEGORIES = \[.*?\];/, newArray);
fs.writeFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', currentFile, 'utf8');
console.log("Successfully fixed Categories array.");