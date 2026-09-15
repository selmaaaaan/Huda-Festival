const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

// 1. Add validation for duplicate topics within the form
const validationOld = `if (!allFilled) { setError('Please fill all fields'); return; }
    }`;
const validationNew = `if (!allFilled) { setError('Please fill all fields'); return; }
        
        if (selectedTopicProg?.topicMode === 'exclusive') {
            const topicValues = uniqueCands.map(cand => topicForm.candidates[cand._id]?.topic?.trim().toLowerCase()).filter(Boolean);
            const uniqueTopics = new Set(topicValues);
            if (topicValues.length !== uniqueTopics.size) {
                setError('You cannot assign the same exclusive topic to multiple candidates.');
                return;
            }
        }
    }`;
c = c.replace(validationOld, validationNew);

// 2. Change Promise.all to sequential execution to fix race condition
const promiseOld = `const promises = Object.keys(topicForm.candidates).map(async (candId) => {
                const candData = topicForm.candidates[candId];
                if (!candData || !candData.topic) return null;
                
                const et = existingForProg.find(topic => topic.candidate?._id === candId);
                if (et) {
                    if (et.topic !== candData.topic || et.attachment !== candData.attachment) {
                        const { data } = await api.patch('/topic-registrations/' + et._id, { topic: candData.topic, attachment: candData.attachment });
                        return { action: 'update', data };
                    }
                    return null;
                } else {
                    const { data } = await api.post('/topic-registrations', {
                        programmeId: topicForm.programmeId, 
                        teamId,
                        candidateId: candId,
                        topic: candData.topic,
                        attachment: candData.attachment,
                    });
                    return { action: 'create', data };
                }
            });
            
            const responses = await Promise.all(promises);
            const updates = responses.filter(Boolean);`;

const promiseNew = `const updates = [];
            for (const candId of Object.keys(topicForm.candidates)) {
                const candData = topicForm.candidates[candId];
                if (!candData || !candData.topic) continue;
                
                const et = existingForProg.find(topic => topic.candidate?._id === candId);
                if (et) {
                    if (et.topic !== candData.topic || et.attachment !== candData.attachment) {
                        const { data } = await api.patch('/topic-registrations/' + et._id, { topic: candData.topic, attachment: candData.attachment });
                        updates.push({ action: 'update', data });
                    }
                } else {
                    const { data } = await api.post('/topic-registrations', {
                        programmeId: topicForm.programmeId, 
                        teamId,
                        candidateId: candId,
                        topic: candData.topic,
                        attachment: candData.attachment,
                    });
                    updates.push({ action: 'create', data });
                }
            }`;

c = c.replace(promiseOld, promiseNew);
fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');