const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

code = code.replace(
    /const hasCands = myRegistrations\.some\(r => \(r\.programme\._id \|\| r\.programme\) === topicForm\.programmeId && r\.candidates\?\.length > 0\);\s*if \(hasCands && !topicForm\.candidateId\) \{ setError\('Please select a candidate'\); return; \}/,
    `const hasCands = myRegistrations.some(r => (r.programme._id || r.programme) === topicForm.programmeId && r.candidates?.length > 0);
      const isGroup = selectedTopicProg?.format === 'Group';
      if (hasCands && !isGroup && !topicForm.candidateId) { setError('Please select a candidate'); return; }`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', code);
console.log('Patched hasCands logic');
