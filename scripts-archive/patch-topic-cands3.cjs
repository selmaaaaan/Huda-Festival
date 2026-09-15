const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

const targetStr = `              {/* ▬▬ Step 3: Topic entry ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ */}
              {topicForm.programmeId && (() => {
                  const reg = myRegistrations.find(r => (r.programme._id || r.programme) === topicForm.programmeId);
                  const registeredCands = reg?.candidates || [];
                    console.log('topicForm.programmeId:', topicForm.programmeId);
                    console.log('Found reg:', reg);
                    console.log('registeredProgrammeIds:', myRegistrations.map(r => r.programme._id || r.programme));
                  return (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      {registeredCands.length > 0 && (
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

const replacementStr = `              {/* ▬▬ Step 3: Topic entry ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ */}
              {topicForm.programmeId && (() => {
                  // Find ALL registrations for this programme to gather all registered candidates
                  const regs = myRegistrations.filter(r => (r.programme._id || r.programme) === topicForm.programmeId);
                  const registeredCands = regs.flatMap(r => r.candidates || []);
                  
                  // Deduplicate in case of group registrations sharing candidates
                  const uniqueCandsMap = new Map();
                  registeredCands.forEach(c => {
                      if (c && c._id) uniqueCandsMap.set(c._id, c);
                  });
                  const uniqueCands = Array.from(uniqueCandsMap.values());

                  // Find if the selected programme is a group programme
                  const isGroup = selectedTopicProg?.format === 'Group';
                  
                  return (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      {uniqueCands.length > 0 && !isGroup && (
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
                                const alreadySubmitted = otherTopics[topicForm.programmeId]?.some(t => t.candidate?._id === c._id && t.team?._id === teamId);
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
                          {uniqueCands.length > 0 && !isGroup ? '4' : '3'} — Enter Topic
                        </label>`;

// I will just use index based replacement to ensure it succeeds regardless of exact spaces if needed, but lets try exact first.
let newCode = code.replace(targetStr, replacementStr);
if (newCode === code) {
    console.log("Failed to replace using exact string. Trying regex fallback...");
    const regex = /\{\/\* ▬▬ Step 3: Topic entry ▬▬.*?\{topicForm\.programmeId && \(\(\) => \{.*?\{registeredCands\.length > 0 \? '4' : '3'\} — Enter Topic\s*<\/label>/s;
    newCode = code.replace(regex, replacementStr);
    if (newCode === code) {
        console.error("STILL FAILED TO REPLACE!");
    } else {
        console.log("Replaced with regex successfully.");
    }
} else {
    console.log("Replaced exact string successfully.");
}

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', newCode);
