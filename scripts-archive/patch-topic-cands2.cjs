const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

const regexCands = /const reg = myRegistrations\.find.*?return \(/s;

const newCands = `// Find ALL registrations for this programme to gather all registered candidates
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

                    return (`;

code = code.replace(regexCands, newCands);

const regexDropdown = /\{registeredCands\.length > 0 && \([\s\S]*?\{registeredCands\.length > 0 \? '4' : '3'\} — Enter Topic/s;

// Wait, the dropdown in the file uses standard dashes maybe? Or the actual file uses `3 — Enter Topic` or `3 - Enter Topic`?
// Let's just replace the blocks directly with standard string manipulation to be safe.
