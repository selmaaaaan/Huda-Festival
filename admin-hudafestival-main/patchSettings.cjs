const fs = require('fs');
let content = fs.readFileSync('src/pages/SettingsPage.jsx', 'utf8');

// Add editLeaderId
content = content.replace(
  `const [leaderForm, setLeaderForm] = useState({ userName: '', password: '', team: '' });`,
  `const [leaderForm, setLeaderForm] = useState({ userName: '', password: '', team: '' });\n  const [editLeaderId, setEditLeaderId] = useState(null);`
);

// Update Modal handlers
const oldLeaderModal = `  const handleOpenLeaderModal = () => {
    setError('');
    setLeaderForm({ userName: '', password: '', team: '' });
    setShowLeaderModal(true);
  };`;
const newLeaderModal = `  const handleOpenLeaderModal = () => {
    setError('');
    setEditLeaderId(null);
    setLeaderForm({ userName: '', password: '', team: '' });
    setShowLeaderModal(true);
  };

  const handleEditLeaderModal = (leader) => {
    setError('');
    setEditLeaderId(leader._id);
    setLeaderForm({ userName: leader.userName, password: '', team: leader.team || '' });
    setShowLeaderModal(true);
  };`;
content = content.replace(oldLeaderModal, newLeaderModal);

// Update handleSaveLeader
const oldSaveLeader = `  const handleSaveLeader = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/create-team-leader', leaderForm);
      setShowLeaderModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating team leader');
    } finally {
      setSubmitting(false);
    }
  };`;
const newSaveLeader = `  const handleSaveLeader = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editLeaderId) {
          const payload = { userName: leaderForm.userName, team: leaderForm.team };
          if (leaderForm.password) payload.password = leaderForm.password;
          await api.patch('/auth/team-leaders/' + editLeaderId, payload);
      } else {
          await api.post('/auth/create-team-leader', leaderForm);
      }
      setShowLeaderModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving team leader');
    } finally {
      setSubmitting(false);
    }
  };`;
content = content.replace(oldSaveLeader, newSaveLeader);

// Add edit icon to team leaders row
content = content.replace(
  `                        <div className="font-medium text-[var(--color-text-heading)]">{leader.userName}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">Team: {leaderTeamName}</div>
                      </div>
                    </div>`,
  `                        <div className="font-medium text-[var(--color-text-heading)]">{leader.userName}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">Team: {leaderTeamName}</div>
                      </div>
                      <div className="flex items-center">
                        <button onClick={() => handleEditLeaderModal(leader)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-1" title="Edit Leader">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </div>`
);

// Update Modal title and password placeholder
content = content.replace(
  `<Modal isOpen={showLeaderModal} onClose={() => setShowLeaderModal(false)} title="Add Team Leader">`,
  `<Modal isOpen={showLeaderModal} onClose={() => setShowLeaderModal(false)} title={editLeaderId ? "Edit Team Leader" : "Add Team Leader"}>`
);
content = content.replace(
  `                  <input
                    type="text"
                    value={leaderForm.password}
                    onChange={e => setLeaderForm({ ...leaderForm, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                    required
                  />`,
  `                  <input
                    type="text"
                    value={leaderForm.password}
                    onChange={e => setLeaderForm({ ...leaderForm, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                    required={!editLeaderId}
                    placeholder={editLeaderId ? "Leave blank to keep unchanged" : ""}
                  />`
);

// Add Edit2 to lucide imports
content = content.replace(
  `import { Save, Plus, Trash2, Edit2, AlertTriangle, Key } from 'lucide-react';`,
  `import { Save, Plus, Trash2, Edit2, AlertTriangle, Key } from 'lucide-react';`
); // wait, Edit2 is already imported? Let's check!

fs.writeFileSync('src/pages/SettingsPage.jsx', content);
