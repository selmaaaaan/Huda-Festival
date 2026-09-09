const fs = require('fs');
const file = 'src/pages/RegistrationReviewPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add assignCategory state
content = content.replace(
  "const [assignForm, setAssignForm] = useState({ teamId: '', programmeId: '', candidateIds: [] });",
  "const [assignCategory, setAssignCategory] = useState('');\n  const [assignForm, setAssignForm] = useState({ teamId: '', programmeId: '', candidateIds: [] });"
);

// 2. Remove assignCategoryFilter state
content = content.replace("const [assignCategoryFilter, setAssignCategoryFilter] = useState('ALL');\n", "");

// 3. Update candidates fetch effect
const oldEffect = `  // Fetch candidates for selected team in the form
  useEffect(() => {
    setAssignCategoryFilter('ALL');
    if (assignForm.teamId) {
      api.get(\`/candidates?team=\${assignForm.teamId}\`)
         .then(r => setTeamCandidates(r.data))
         .catch(console.error);
    } else {
      setTeamCandidates([]);
    }
  }, [assignForm.teamId]);`;

const newEffect = `  // Fetch candidates for selected team in the form
  useEffect(() => {
    if (assignForm.teamId && assignCategory) {
      api.get(\`/candidates?team=\${assignForm.teamId}&category=\${assignCategory}\`)
         .then(r => setTeamCandidates(r.data))
         .catch(console.error);
    } else {
      setTeamCandidates([]);
    }
  }, [assignForm.teamId, assignCategory]);`;

content = content.replace(oldEffect, newEffect);

// 4. Update openAssignModal
const oldOpenModal = `  const openAssignModal = (mode, reg = null) => {
    setAssignError('');
    if (mode === 'edit' && reg) {
      setAssignForm({
        teamId: reg.team?._id || reg.team,
        programmeId: reg.programme?._id || reg.programme,
        candidateIds: reg.candidates?.map(c => c._id || c) || []
      });
      setAssignModal({ isOpen: true, mode: 'edit', editId: reg._id });
    } else {
      setAssignForm({ teamId: '', programmeId: selectedProg ? selectedProg._id : '', candidateIds: [] });
      setAssignModal({ isOpen: true, mode: 'create', editId: null });
    }
  };`;

const newOpenModal = `  const openAssignModal = (mode, reg = null) => {
    setAssignError('');
    if (mode === 'edit' && reg) {
      const prog = programmes.find(p => p._id === (reg.programme?._id || reg.programme));
      setAssignCategory(prog ? prog.category : '');
      setAssignForm({
        teamId: reg.team?._id || reg.team,
        programmeId: reg.programme?._id || reg.programme,
        candidateIds: reg.candidates?.map(c => c._id || c) || []
      });
      setAssignModal({ isOpen: true, mode: 'edit', editId: reg._id });
    } else {
      setAssignCategory(selectedProg ? selectedProg.category : '');
      setAssignForm({ teamId: filterTeam || '', programmeId: selectedProg ? selectedProg._id : '', candidateIds: [] });
      setAssignModal({ isOpen: true, mode: 'create', editId: null });
    }
  };`;

content = content.replace(oldOpenModal, newOpenModal);

// 5. Update the modal JSX
// Find where the modal starts and ends.
const modalStartRegex = /\{\/\* Assign Candidate Modal \*\/\}\s*<Modal isOpen=\{assignModal\.isOpen\}[^>]*>[\s\S]*?<\/Modal>/;
const newModalJSX = `{/* Assign Candidate Modal */}
      <Modal isOpen={assignModal.isOpen} onClose={() => setAssignModal({ isOpen: false, mode: 'create', editId: null })} title={assignModal.mode === 'edit' ? "Edit Registration" : "Assign Candidate"}>
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {assignError && <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{assignError}</div>}

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">1. Category</label>
            <select 
              value={assignCategory} 
              onChange={e => {
                setAssignCategory(e.target.value);
                setAssignForm(f => ({ ...f, programmeId: '', candidateIds: [] }));
              }}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
              <option value="">Select a category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">2. Programme</label>
            <select 
              value={assignForm.programmeId} 
              onChange={e => setAssignForm(f => ({ ...f, programmeId: e.target.value, candidateIds: [] }))}
              disabled={!assignCategory}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50">
              <option value="">Select a programme...</option>
              {programmes.filter(p => p.category === assignCategory).map(p => <option key={p._id} value={p._id}>{p.name} ({p.category})</option>)}
            </select>
          </div>

          {(() => {
            const prog = programmes.find(p => p._id === assignForm.programmeId);
            const reqCands = prog?.format === 'Group' ? (prog?.groupSize || 1) : 1;
            return prog && (
              <div className="p-3 bg-[var(--color-surface-elevated)] rounded-lg text-xs text-[var(--color-text-muted)] space-y-1">
                <div>Format: <span className="text-[var(--color-text-heading)]">{prog.format}</span></div>
                <div>Required candidates: <span className="text-[var(--color-text-heading)]">{reqCands}</span></div>
                <div>Max entries per team: <span className="text-[var(--color-text-heading)]">{prog.maxParticipants}</span></div>
              </div>
            );
          })()}

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">3. Team</label>
            <select 
              value={assignForm.teamId} 
              onChange={e => setAssignForm(f => ({ ...f, teamId: e.target.value, candidateIds: [] }))}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
              <option value="">Select a team...</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>

          {assignForm.teamId && assignForm.programmeId && (
            <div>
              <div className="flex items-center justify-between mb-2">
                {(() => {
                  const prog = programmes.find(p => p._id === assignForm.programmeId);
                  const reqCands = prog?.format === 'Group' ? (prog?.groupSize || 1) : 1;
                  return (
                    <label className="block text-xs font-medium text-[var(--color-text-muted)]">
                      4. Select {reqCands} Candidate(s) <span className="text-[var(--color-primary)]">{assignForm.candidateIds.length}/{reqCands}</span>
                    </label>
                  );
                })()}
              </div>
              <div className="max-h-48 overflow-y-auto border border-[var(--color-border)] rounded-lg">
                {teamCandidates.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">No candidates found for this team in the selected category.</div>
                ) : teamCandidates.map(c => (
                  <label key={c._id} className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--color-surface-elevated)] cursor-pointer border-b border-[var(--color-border)] last:border-0">
                    <input type="checkbox" checked={assignForm.candidateIds.includes(c._id)} onChange={() => handleCandidateToggle(c._id)} className="rounded" />
                    <div>
                      <div className="text-sm text-[var(--color-text-heading)]">{c.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{c.admissionNo} · {c.category}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-6">
            <Button type="button" variant="secondary" onClick={() => setAssignModal({ isOpen: false, mode: 'create', editId: null })}>Cancel</Button>
            <Button type="submit" variant="primary" loading={assignSubmitting}>{assignModal.mode === 'edit' ? 'Update Registration' : 'Assign Candidate'}</Button>
          </div>
        </form>
      </Modal>`;

content = content.replace(modalStartRegex, newModalJSX);

fs.writeFileSync(file, content);
console.log("Patched successfully");
