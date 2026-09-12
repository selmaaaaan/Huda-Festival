const fs = require('fs');
let code = fs.readFileSync('src/pages/TeamLeaderDashboard.jsx', 'utf8');

// Add editId state
code = code.replace(
    `const [form, setForm] = useState({ programmeId: '', candidateIds: [] });`,
    `const [form, setForm] = useState({ programmeId: '', candidateIds: [] });\n  const [editId, setEditId] = useState(null);`
);

// Add openNewRegistration and openEditRegistration
code = code.replace(
    `const openNewRegistration = () => {\n    if (appSettings.isRegistrationOpen === false) return;\n    setForm({ programmeId: '', candidateIds: [] });\n    setShowForm(true);\n  };`,
    `const openNewRegistration = () => {\n    if (appSettings.isRegistrationOpen === false) return;\n    setEditId(null);\n    setForm({ programmeId: '', candidateIds: [] });\n    setShowForm(true);\n  };\n\n  const openEditRegistration = (reg) => {\n    if (appSettings.isRegistrationOpen === false) return;\n    setEditId(reg._id);\n    setForm({ programmeId: reg.programme._id, candidateIds: reg.candidates.map(c => c._id) });\n    setShowForm(true);\n  };`
);

// Modify handleSubmit
const oldSubmit = `    try {\n      const { data } = await api.post('/registrations', {\n        programmeId: form.programmeId, teamId, candidateIds: form.candidateIds,\n      });\n      setMyRegistrations(prev => [data, ...prev]);\n      setSuccess(true);\n      setTimeout(() => {\n        setShowForm(false); setForm({ programmeId: '', candidateIds: [] });\n        setRegSearchQuery(''); setSuccess(false);\n      }, 1500);\n    } catch (e) { setError(e.response?.data?.message || 'Submission failed'); }\n    finally { setSubmitting(false); }`;

const newSubmit = `    try {\n      if (editId) {\n        const { data } = await api.patch('/registrations/' + editId, { candidateIds: form.candidateIds });\n        setMyRegistrations(prev => prev.map(r => r._id === editId ? data : r));\n      } else {\n        const { data } = await api.post('/registrations', {\n          programmeId: form.programmeId, teamId, candidateIds: form.candidateIds,\n        });\n        setMyRegistrations(prev => [data, ...prev]);\n      }\n      setSuccess(true);\n      setTimeout(() => {\n        setShowForm(false); setForm({ programmeId: '', candidateIds: [] }); setEditId(null);\n        setRegSearchQuery(''); setSuccess(false);\n      }, 1500);\n    } catch (e) { setError(e.response?.data?.message || 'Submission failed'); }\n    finally { setSubmitting(false); }`;

code = code.replace(oldSubmit, newSubmit);

// Add Edit Icon import (use PenLine instead of Edit if Edit doesn't exist, wait, lucide-react has Edit2 or Edit3. We can just use FileSpreadsheet or something, actually lucide has 'Edit')
code = code.replace(
  `import { Search, Plus, ClipboardList, BookOpen, CheckCircle } from 'lucide-react';`,
  `import { Search, Plus, ClipboardList, BookOpen, CheckCircle, Edit3 } from 'lucide-react';`
);

// Add Action column header
code = code.replace(
  `{['Programme', 'Candidates', 'Submitted', 'Status', 'Reason'].map(h => (`,
  `{['Programme', 'Candidates', 'Submitted', 'Status', 'Reason', ''].map(h => (`
);

// Add Action column cell
code = code.replace(
  `<td className="px-6 py-4 text-xs text-[var(--color-text-muted)] max-w-xs truncate">{reg.rejectionReason || '—'}</td>\r\n                          </motion.tr>`,
  `<td className="px-6 py-4 text-xs text-[var(--color-text-muted)] max-w-xs truncate">{reg.rejectionReason || '—'}</td>\n                            <td className="px-6 py-4 text-right">\n                              {appSettings.isRegistrationOpen !== false && reg.status !== 'approved' && (\n                                <button onClick={() => openEditRegistration(reg)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-1" title="Edit Registration">\n                                  <Edit3 size={16} />\n                                </button>\n                              )}\n                            </td>\n                          </motion.tr>`
);
code = code.replace(
  `<td className="px-6 py-4 text-xs text-[var(--color-text-muted)] max-w-xs truncate">{reg.rejectionReason || '—'}</td>\n                          </motion.tr>`,
  `<td className="px-6 py-4 text-xs text-[var(--color-text-muted)] max-w-xs truncate">{reg.rejectionReason || '—'}</td>\n                            <td className="px-6 py-4 text-right">\n                              {appSettings.isRegistrationOpen !== false && reg.status !== 'approved' && (\n                                <button onClick={() => openEditRegistration(reg)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-1" title="Edit Registration">\n                                  <Edit3 size={16} />\n                                </button>\n                              )}\n                            </td>\n                          </motion.tr>`
);

// Update Modal title and programme field
code = code.replace(
  `<Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Registration">`,
  `<Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Registration" : "New Registration"}>`
);

const oldProg = `                <div className="space-y-3">\n                  <label className="text-sm font-medium text-[var(--color-text-heading)]">Programme</label>\n                  <ProgrammeCodePicker\n                    programmes={programmes}\n                    value={form.programmeId}\n                    onSelect={prog => {\n                      setForm(f => ({ ...f, programmeId: prog?._id || '', candidateIds: [] }));\n                      setRegSearchQuery('');\n                    }}\n                  />\n                </div>`;

const newProg = `                <div className="space-y-3">\n                  <label className="text-sm font-medium text-[var(--color-text-heading)]">Programme</label>\n                  {editId ? (\n                    <div className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-muted)] opacity-70">\n                      {selectedProg?.code} - {selectedProg?.name}\n                    </div>\n                  ) : (\n                    <ProgrammeCodePicker\n                      programmes={programmes}\n                      value={form.programmeId}\n                      onSelect={prog => {\n                        setForm(f => ({ ...f, programmeId: prog?._id || '', candidateIds: [] }));\n                        setRegSearchQuery('');\n                      }}\n                    />\n                  )}\n                </div>`;
code = code.replace(oldProg, newProg);

fs.writeFileSync('src/pages/TeamLeaderDashboard.jsx', code);
