const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf8');

c = c.replace(
    /if \(prog\.format === 'Group' \|\| prog\.type === 'Group'\) {\s*setGroupModal\(\{ isOpen: true, prog, candidate: cand, selectedIds: \[cand\._id\] \}\);\s*return;\s*}/g,
    `const isCurrentlySavedLocal = registrations.some(r => r.programme?._id === prog._id && r.candidates?.includes(cand._id));
        if (prog.format === 'Group' || prog.type === 'Group') {
            if (isCurrentlySavedLocal) {
                if (window.confirm(\`Are you sure you want to remove the entire group registration for \${prog.name}?\`)) {
                    const reg = registrations.find(r => r.programme?._id === prog._id && r.candidates?.includes(cand._id));
                    if (reg) {
                        api.delete(\`/registrations/\${reg._id}\`)
                            .then(() => fetchGrid())
                            .catch(err => alert(err?.response?.data?.message || 'Removal failed'));
                    }
                }
            } else {
                setGroupModal({ isOpen: true, prog, candidate: cand, selectedIds: [cand._id] });
            }
            return;
        }`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', c, 'utf8');
console.log('Fixed handleCellClick via regex');