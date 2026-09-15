const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

// Add candidates to topicForm, and find registered candidates for the selected programme
const topicEntryUIOld = `                {/* 🎨 Step 3: Topic entry 🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨 */}
                {topicForm.programmeId && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                        3 — Enter Topic
                      </label>`;

const topicEntryUINew = `                {/* 🎨 Step 3: Candidate Selection 🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨 */}
                {topicForm.programmeId && (() => {
                  const reg = myRegistrations.find(r => (r.programme._id || r.programme) === topicForm.programmeId);
                  const registeredCands = reg?.candidates || [];
                  return (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      {registeredCands.length > 0 && (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                            3 — Select Candidate
                          </label>
                          <select
                            value={topicForm.candidateId}
                            onChange={e => setTopicForm(f => ({ ...f, candidateId: e.target.value }))}
                            className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                          >
                            <option value="">Select a registered candidate…</option>
                            {registeredCands.map(c => (
                              <option key={c._id} value={c._id}>{c.name} ({c.admissionNo})</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                          {registeredCands.length > 0 ? '4' : '3'} — Enter Topic
                        </label>`;

code = code.replace(topicEntryUIOld, topicEntryUINew);

// We need to close the IIFE
code = code.replace(
    /<\/motion\.div>\n\s*\)}/,
    `</motion.div>\n                  );\n                })()}`
);

// We need to enforce candidateId in validation if the program has candidates registered
code = code.replace(
    /if \(!topicForm\.programmeId \|\| !topicForm\.topic\) \{ setError\('Please fill all fields'\); return; \}/,
    `if (!topicForm.programmeId || !topicForm.topic) { setError('Please fill all fields'); return; }
      const hasCands = myRegistrations.some(r => (r.programme._id || r.programme) === topicForm.programmeId && r.candidates?.length > 0);
      if (hasCands && !topicForm.candidateId) { setError('Please select a candidate'); return; }`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', code);
console.log('Added candidate selector to topic modal');
