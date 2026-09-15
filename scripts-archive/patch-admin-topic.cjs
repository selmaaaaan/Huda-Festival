const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

// 1. Program Filter Patch
const progFilterRegex = /const topicProgrammesInCategory = useMemo\(\(\) =>\s*topicCategory\s*\?\s*eligibleTopicProgrammes\.filter\(p => p\.category === topicCategory \|\| p\.category === 'KULLIYYAH'\)\s*:\s*\[\],\s*\[eligibleTopicProgrammes, topicCategory\]\);/s;
const newProgFilter = `const topicProgrammesInCategory = useMemo(() => {
    if (!topicCategory) return [];
    // Only allow selecting programmes the team has actually registered for
    const registeredProgrammeIds = teamRegistrations.filter(r => r.status !== 'rejected').map(r => r.programme._id || r.programme);
    return eligibleTopicProgrammes.filter(p => 
      (p.category === topicCategory || p.category === 'KULLIYYAH') && registeredProgrammeIds.includes(p._id)
    );
  }, [eligibleTopicProgrammes, topicCategory, teamRegistrations]);`;
if (progFilterRegex.test(code)) {
    code = code.replace(progFilterRegex, newProgFilter);
}

// 2. Candidate Dropdown Patch
const candidateDropdownRegex = /\{\/\* \u2500\u2500 Step 3: Topic entry \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 \*\/\}\s*\{topicForm\.programmeId && \(\s*<motion\.div initial.*?className="space-y-4">\s*<div>\s*<label.*?>.*?Enter Topic\s*<\/label>/s;

const newCandidateDropdown = `{/* ── Step 3: Topic entry ───────────────────────────────────────── */}
              {topicForm.programmeId && (() => {
                  const regs = teamRegistrations.filter(r => (r.programme._id || r.programme) === topicForm.programmeId);
                  const registeredCands = regs.flatMap(r => r.candidates || []);
                  
                  const uniqueCandsMap = new Map();
                  registeredCands.forEach(c => {
                      if (c && c._id) uniqueCandsMap.set(c._id, c);
                  });
                  const uniqueCands = Array.from(uniqueCandsMap.values());

                  const isGroup = selectedTopicProg?.format === 'Group';
                  
                  return (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      {uniqueCands.length > 0 && !isGroup && !editTopicId && (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                            3 — Select Candidate
                          </label>
                          <select
                            value={topicForm.candidateId || ''}
                            onChange={e => setTopicForm(f => ({ ...f, candidateId: e.target.value }))}
                            className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                          >
                            <option value="">Select a registered candidate…</option>
                            {uniqueCands.map(c => {
                                const alreadySubmitted = otherTopics[topicForm.programmeId]?.some(t => t.candidate?._id === c._id && t.team?._id === selectedTeamId);
                                return (
                                    <option key={c._id} value={c._id} disabled={alreadySubmitted}>
                                        {c.name} ({c.admissionNo}) {alreadySubmitted ? '(Topic Submitted)' : ''}
                                    </option>
                                );
                            })}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                          {uniqueCands.length > 0 && !isGroup && !editTopicId ? '4' : '3'} — Enter Topic
                        </label>`;

if (candidateDropdownRegex.test(code)) {
    code = code.replace(candidateDropdownRegex, newCandidateDropdown);
    // Also we need to close the `})()` at the end of the `motion.div` block
    code = code.replace(/<\/motion\.div>\s*\)/g, "</motion.div>\n                    );\n                  })()}");
}

// 3. Validation Logic Patch
const oldValidation = `if (!topicForm.programmeId || !topicForm.topic) { setError('Please fill all fields'); return; }
      setSubmitting(true);`;
const newValidation = `if (!topicForm.programmeId || !topicForm.topic) { setError('Please fill all fields'); return; }
      const hasCands = teamRegistrations.some(r => (r.programme._id || r.programme) === topicForm.programmeId && r.candidates?.length > 0);
      const isGroup = selectedTopicProg?.format === 'Group';
      if (hasCands && !isGroup && !topicForm.candidateId && !editTopicId) { setError('Please select a candidate'); return; }
      setSubmitting(true);`;
if (code.includes(oldValidation)) {
    code = code.replace(oldValidation, newValidation);
}

// 4. Attachment Logic Patch
const oldAttach = `                  <Button variant="ghost" type="button" onClick={() => setShowTopicForm(false)}>Cancel</Button>`;
const newAttach = `                    {selectedTopicProg?.topicMode === 'free-text' && (
                      <div className="mt-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                          Attachment (YouTube Link / Image URL)
                        </label>
                        <input
                          type="text"
                          value={topicForm.attachment || ''}
                          onChange={e => setTopicForm(f => ({ ...f, attachment: e.target.value }))}
                          placeholder="Optional: https://youtube.com/..."
                          className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
                    )}
                  <Button variant="ghost" type="button" onClick={() => setShowTopicForm(false)}>Cancel</Button>`;
if (code.includes(oldAttach)) {
    code = code.replace(oldAttach, newAttach);
}

// We need to also add attachment field in payload!
const payloadRegex = /programmeId: topicForm\.programmeId,\s*teamId: selectedTeamId,\s*topic: topicForm\.topic/g;
code = code.replace(payloadRegex, "programmeId: topicForm.programmeId,\n          teamId: selectedTeamId,\n          candidateId: topicForm.candidateId || undefined,\n          topic: topicForm.topic,\n          attachment: topicForm.attachment");

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', code);
console.log('Patched TeamTopicRegistrationPage.jsx successfully');
