const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf8');

// 1. Initial State
c = c.replace(
    /const \[groupModal, setGroupModal\] = useState\(\{ isOpen: false, prog: null, candidate: null, selectedIds: \[\] \}\);/,
    `const [groupModal, setGroupModal] = useState({ isOpen: false, prog: null, candidate: null, selectedIds: [], editRegId: null });`
);

// 2. Click Logic
const oldClickLogic = `if (prog.format === 'Group') {
            const isCurrentlySavedLocal = registrations.some(r => r.programme?._id === prog._id && r.candidates?.includes(cand._id));
            if (isCurrentlySavedLocal) {
                const reg = registrations.find(r => r.programme?._id === prog._id && r.candidates?.includes(cand._id));
                if (reg) {
                    setConfirmDeleteModal({ isOpen: true, regId: reg._id, progName: prog.name });
                }
            } else {
                setGroupModal({ isOpen: true, prog, candidate: cand, selectedIds: [cand._id] });
            }
            return;
        }`;

const newClickLogic = `if (prog.format === 'Group') {
            const existingReg = registrations.find(r => r.programme?._id === prog._id);
            if (existingReg) {
                let newIds = existingReg.candidates?.map(c => c._id) || [];
                if (!newIds.includes(cand._id)) {
                    newIds.push(cand._id);
                } else {
                    newIds = newIds.filter(id => id !== cand._id);
                }
                setGroupModal({ isOpen: true, prog, candidate: cand, selectedIds: newIds, editRegId: existingReg._id });
            } else {
                setGroupModal({ isOpen: true, prog, candidate: cand, selectedIds: [cand._id], editRegId: null });
            }
            return;
        }`;

c = c.replace(oldClickLogic, newClickLogic);

// 3. Save Logic
const oldSaveLogic = `await api.post('/registrations', {
                programmeId: prog._id,
                teamId: selectedTeam,
                candidateIds: selectedIds
            });
            await fetchGrid();
            setGroupModal({ isOpen: false, prog: null, candidate: null, selectedIds: [] });`;

const newSaveLogic = `if (groupModal.editRegId) {
                await api.patch(\`/registrations/\${groupModal.editRegId}\`, { candidateIds: selectedIds });
            } else {
                await api.post('/registrations', {
                    programmeId: prog._id,
                    teamId: selectedTeam,
                    candidateIds: selectedIds
                });
            }
            await fetchGrid();
            setGroupModal({ isOpen: false, prog: null, candidate: null, selectedIds: [], editRegId: null });`;

c = c.replace(oldSaveLogic, newSaveLogic);

// 4. Other setGroupModal clearings
c = c.replace(/setGroupModal\(\{ isOpen: false, prog: null, candidate: null, selectedIds: \[\] \}\)/g, `setGroupModal({ isOpen: false, prog: null, candidate: null, selectedIds: [], editRegId: null })`);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', c, 'utf8');