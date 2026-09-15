const fs = require('fs');

let c = fs.readFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', 'utf8');

c = c.replace(
    /className="mt-2 inline-flex items-center gap-1\.5 px-3 py-1\.5 rounded-lg bg-\[var\(--color-primary\)\]\/10 border border-\[var\(--color-primary\)\]\/20 text-\[var\(--color-primary\)\] text-xs font-bold uppercase"/g,
    `className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold uppercase tracking-wide"`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', c, 'utf8');
console.log("Done");