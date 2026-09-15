const fs = require('fs');
const cp = require('child_process');

let currentFile = fs.readFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', 'utf8');

// I'll grab the unicode correct array from TeamRegistrationListPage.jsx
let teamRegPage = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf8');
const match = teamRegPage.match(/const CATEGORIES = \['All', (.*?)\];/);
if (!match) throw new Error("Could not find CATEGORIES");

const properArray = `const CATEGORY_ORDER = [${match[1]}];`;

// Replace .sort() with a custom sort based on CATEGORY_ORDER
currentFile = currentFile.replace(
    /const cats = \[\.\.\.new Set\(res\.data\.map\(p => p\.category\)\)\]\.filter\(Boolean\)\.sort\(\);/,
    `${properArray}\n                const cats = [...new Set(res.data.map(p => p.category))].filter(Boolean).sort((a, b) => {\n                    const idxA = CATEGORY_ORDER.indexOf(a);\n                    const idxB = CATEGORY_ORDER.indexOf(b);\n                    if (idxA === -1 && idxB === -1) return a.localeCompare(b);\n                    if (idxA === -1) return 1;\n                    if (idxB === -1) return -1;\n                    return idxA - idxB;\n                });`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', currentFile, 'utf8');
console.log("Successfully fixed ConflictCheckerPage sorting.");