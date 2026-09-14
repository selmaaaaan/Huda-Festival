const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

// 1. patch-stats
const oldStats = `const stats = [
    { label: 'Total Registrations', value: myRegistrations.length },
    { label: 'Pending Approval', value: myRegistrations.filter(r => r.status === 'pending').length },
    { label: 'Approved', value: myRegistrations.filter(r => r.status === 'approved').length },
  ];`;
const newStats = `const stats = [
    { label: 'Total Candidates', value: candidates.length },
    { label: 'Registered Events', value: myRegistrations.length },
    { label: 'Approved Events', value: myRegistrations.filter(r => r.status === 'approved').length },
  ];`;
if(code.includes(oldStats)) {
    code = code.replace(oldStats, newStats);
    console.log("Stats patched!");
}

// 2. patch-tld-dash (attachment field)
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
if(code.includes(oldAttach)) {
    code = code.replace(oldAttach, newAttach);
    console.log("Attachment patched!");
}

// 3. patch-hascands (submit validation)
const oldVal = `if (!topicForm.programmeId || !topicForm.topic) { setError('Please fill all fields'); return; }
        const hasCands = myRegistrations.some(r => (r.programme._id || r.programme) === topicForm.programmeId && 
r.candidates?.length > 0);
        const isGroup = selectedTopicProg?.format === 'Group';
        if (hasCands && !isGroup && !topicForm.candidateId) { setError('Please select a candidate'); return; }`;

const newVal = `if (!topicForm.programmeId || !topicForm.topic) { setError('Please fill all fields'); return; }
      const hasCands = myRegistrations.some(r => (r.programme._id || r.programme) === topicForm.programmeId && r.candidates?.length > 0);
      const isGroup = selectedTopicProg?.format === 'Group';
      if (hasCands && !isGroup && !topicForm.candidateId) { setError('Please select a candidate'); return; }`;

// actually oldVal == newVal almost exactly. I already manually patched it in the first run or it was untouched. Let's just do a regex replace to be sure.
const regexHascands = /if \(!topicForm\.programmeId \|\| !topicForm\.topic\) \{ setError\('Please fill all fields'\); return; \}\s*const hasCands = myRegistrations\.some.*?return; \}/s;
if (regexHascands.test(code)) {
    code = code.replace(regexHascands, `if (!topicForm.programmeId || !topicForm.topic) { setError('Please fill all fields'); return; }
      const hasCands = myRegistrations.some(r => (r.programme._id || r.programme) === topicForm.programmeId && r.candidates?.length > 0);
      const isGroup = selectedTopicProg?.format === 'Group';
      if (hasCands && !isGroup && !topicForm.candidateId) { setError('Please select a candidate'); return; }`);
    console.log("Validation patched!");
}

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', code);
