const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf8');

// 1. Add state variable
c = c.replace(
    `const [groupModal, setGroupModal] = useState({ isOpen: false, prog: null, candidate: null, selectedIds: [] });`,
    `const [groupModal, setGroupModal] = useState({ isOpen: false, prog: null, candidate: null, selectedIds: [] });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState({ isOpen: false, regId: null, progName: '' });`
);

// 2. Replace handleCellClick logic
const oldHandleCellClick = `        if (prog.format === 'Group' || prog.type === 'Group') {
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
            }`;

const newHandleCellClick = `        if (prog.format === 'Group' || prog.type === 'Group') {
            if (isCurrentlySavedLocal) {
                const reg = registrations.find(r => r.programme?._id === prog._id && r.candidates?.includes(cand._id));
                if (reg) {
                    setConfirmDeleteModal({ isOpen: true, regId: reg._id, progName: prog.name });
                }
            } else {
                setGroupModal({ isOpen: true, prog, candidate: cand, selectedIds: [cand._id] });
            }`;
c = c.replace(oldHandleCellClick, newHandleCellClick);

// 3. Add confirmDeleteGroup function
c = c.replace(
    `const handleGroupSave = async (e) => {`,
    `const confirmDeleteGroup = async () => {
        setGroupSaving(true);
        try {
            await api.delete(\`/registrations/\${confirmDeleteModal.regId}\`);
            await fetchGrid();
            setConfirmDeleteModal({ isOpen: false, regId: null, progName: '' });
        } catch (err) {
            console.error('Failed to remove group registration', err);
            alert(err.response?.data?.message || 'Removal failed');
        } finally {
            setGroupSaving(false);
        }
    };

    const handleGroupSave = async (e) => {`
);

// 4. Add the modal UI
const modalUI = `
            <Modal 
                isOpen={confirmDeleteModal.isOpen} 
                onClose={() => setConfirmDeleteModal({ isOpen: false, regId: null, progName: '' })} 
                title="Remove Group Registration"
            >
                <div className="space-y-6">
                    <p className="text-[var(--color-text-body)]">
                        Are you sure you want to remove the entire group registration for <strong className="text-[var(--color-text-heading)]">{confirmDeleteModal.progName}</strong>?
                    </p>
                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                        <Button type="button" variant="ghost" onClick={() => setConfirmDeleteModal({ isOpen: false, regId: null, progName: '' })}>
                            Cancel
                        </Button>
                        <Button type="button" variant="danger" loading={groupSaving} onClick={confirmDeleteGroup}>
                            Remove
                        </Button>
                    </div>
                </div>
            </Modal>
`;

c = c.replace(
    `</Modal>`,
    `</Modal>\n${modalUI}`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', c, 'utf8');
console.log('Fixed Modal replacing confirm');