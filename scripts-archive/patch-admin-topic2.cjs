const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

// 1. Program Filter Patch
const progFilterRegex = /const topicProgrammesInCategory = useMemo\\(\\(\\) =>\\s*topicCategory\\s*\\?\\s*eligibleTopicProgrammes\\.filter\\(p => p\\.category === topicCategory \\|\\| p\\.category === 'KULLIYYAH'\\)\\s*:\\s*\\[\\],\\s*\\[eligibleTopicProgrammes, topicCategory\\]\\);/s;
const newProgFilter = `const topicProgrammesInCategory = useMemo(() => {
    if (!topicCategory) return [];
    const registeredProgrammeIds = teamRegistrations.filter(r => r.status !== 'rejected').map(r => r.programme._id || r.programme);
    return eligibleTopicProgrammes.filter(p => 
      (p.category === topicCategory || p.category === 'KULLIYYAH') && registeredProgrammeIds.includes(p._id)
    );
  }, [eligibleTopicProgrammes, topicCategory, teamRegistrations]);`;

code = code.replace(/const topicProgrammesInCategory = useMemo\(\(\) =>[\s\S]*?\[eligibleTopicProgrammes, topicCategory\]\);/, newProgFilter);

// 2. Candidate Dropdown Patch
const oldStep3 = `{/* ── Step 3: Topic entry ───────────────────────────────────────── */}
              {topicForm.programmeId && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                      3 — Enter Topic
                    </label>`;
// Wait, the file might use a different dash character for "3 — Enter Topic".
// Let's use a regex!
const step3Regex = /\{\/\*.*?Step 3: Topic entry.*?\{\s*topicForm\.programmeId && \(\s*<motion\.div initial=\{\{ opacity: 0, y: 8 \}\} animate=\{\{ opacity: 1, y: 0 \}\} className="space-y-4">\s*<div>\s*<label className="block text-xs font-bold uppercase tracking-wider text-\[var\(--color-text-muted\)\] mb-2">\s*3.*?Enter Topic\s*<\/label>/s;

const newStep3 = `{/* ── Step 3: Topic entry ───────────────────────────────────────── */}
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

code = code.replace(step3Regex, newStep3);

// Close the IIFE at the end of the step 3 block
const closeRegex = /Already Submitted Topics.*?<\/ul>\s*<\/div>\s*\)\}\s*<\/motion\.div>\s*\)/s;
const newClose = `Already Submitted Topics
                      </h4>
                      <ul className="space-y-1">
                        {otherTopics[topicForm.programmeId].map(t => (
                          <li key={t._id} className="text-sm flex gap-2">
                            <span className="opacity-50 shrink-0">{t.team?.name}:</span>
                            <span className={t.status === 'approved' ? 'text-green-500 font-medium' : ''}>
                              {t.topic}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
                );
              })()}`;

code = code.replace(/Already Submitted Topics[\s\S]*?<\/ul>\s*<\/div>\s*\)\}\s*<\/motion\.div>\s*\)/, newClose);

// 3. Validation Logic Patch
const valRegex = /if \(!topicForm\.programmeId \|\| !topicForm\.topic\) \{ setError\('Please fill all fields'\); return; \}\s*setSubmitting\(true\);/s;
const newVal = `if (!topicForm.programmeId || !topicForm.topic) { setError('Please fill all fields'); return; }
      const hasCands = teamRegistrations.some(r => (r.programme._id || r.programme) === topicForm.programmeId && r.candidates?.length > 0);
      const isGroup = selectedTopicProg?.format === 'Group';
      if (hasCands && !isGroup && !topicForm.candidateId && !editTopicId) { setError('Please select a candidate'); return; }
      setSubmitting(true);`;
code = code.replace(valRegex, newVal);

// 4. Attachment Logic Patch
const oldAttach = /<Button variant="ghost" type="button" onClick=\{\(\) => setShowTopicForm\(false\)\}>Cancel<\/Button>/;
const newAttach = `{selectedTopicProg?.topicMode === 'free-text' && (
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
code = code.replace(oldAttach, newAttach);

// 5. Add attachment and candidateId in payload
const payloadRegex = /programmeId: topicForm\.programmeId,\s*teamId: selectedTeamId,\s*topic: topicForm\.topic/g;
code = code.replace(payloadRegex, "programmeId: topicForm.programmeId,\n          teamId: selectedTeamId,\n          candidateId: topicForm.candidateId || undefined,\n          topic: topicForm.topic,\n          attachment: topicForm.attachment");

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', code);
console.log('Patched TeamTopicRegistrationPage.jsx cleanly');
