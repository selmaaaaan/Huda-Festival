const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

// 1. Fix handleTopicSubmit
const startSubmit = c.indexOf('const handleTopicSubmit = async (e) => {');
const endSubmit = c.indexOf('  const openNewRegistration = () => {');
if (startSubmit !== -1 && endSubmit !== -1) {
    const replaceSubmit = `const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!topicForm.programmeId) { setError('Please select a programme'); return; }
    
    const isGroup = selectedTopicProg?.format === 'Group';
    
    // Validation
    if (isGroup) {
        if (!topicForm.groupTopic) { setError('Please fill all fields'); return; }
    } else {
        const regs = myRegistrations.filter(r => (r.programme?._id || r.programme) === topicForm.programmeId && r.status !== 'rejected');
        const registeredCands = regs.flatMap(r => r.candidates || []);
        const uniqueCandsMap = new Map();
        registeredCands.forEach(cand => {
            if (cand && cand._id) uniqueCandsMap.set(cand._id, cand);
        });
        const uniqueCands = Array.from(uniqueCandsMap.values());
        
        if (uniqueCands.length === 0) { setError('No candidates available'); return; }
        
        let allFilled = true;
        uniqueCands.forEach(cand => {
            const candData = topicForm.candidates[cand._id];
            if (!candData || !candData.topic) allFilled = false;
        });
        if (!allFilled) { setError('Please fill all fields'); return; }
    }

    setSubmitting(true);
    try {
        if (isGroup) {
            const existingForProg = myTopics.filter(topic => (topic.programme?._id || topic.programme) === topicForm.programmeId);
            const groupEt = existingForProg.length > 0 ? existingForProg[0] : null;
            
            if (groupEt) {
                const { data } = await api.patch('/topic-registrations/' + groupEt._id, { topic: topicForm.groupTopic, attachment: topicForm.groupAttachment });
                setMyTopics(prev => prev.map(t => t._id === groupEt._id ? data : t));
            } else {
                const { data } = await api.post('/topic-registrations', {
                    programmeId: topicForm.programmeId, 
                    teamId,
                    topic: topicForm.groupTopic,
                    attachment: topicForm.groupAttachment,
                });
                setMyTopics(prev => [data, ...prev]);
            }
        } else {
            const existingForProg = myTopics.filter(topic => (topic.programme?._id || topic.programme) === topicForm.programmeId);
            
            const promises = Object.keys(topicForm.candidates).map(async (candId) => {
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
            const updates = responses.filter(Boolean);
            
            setMyTopics(prev => {
                let next = [...prev];
                updates.forEach(res => {
                    if (res.action === 'update') {
                        next = next.map(t => t._id === res.data._id ? res.data : t);
                    } else if (res.action === 'create') {
                        next = [res.data, ...next];
                    }
                });
                return next;
            });
        }
        
      setSuccess(true);
      setTimeout(() => {
        setShowTopicForm(false);
        setEditTopicId(null);
        setTopicForm({ programmeId: '', candidates: {}, groupTopic: '' });
        setTopicCategory('');
        setSuccess(false);
      }, 1500);
    } catch (e) { setError(e.response?.data?.message || 'Failed to submit topic'); }
    finally { setSubmitting(false); }
  };\n\n`;
    c = c.substring(0, startSubmit) + replaceSubmit + c.substring(endSubmit);
    console.log("REPLACED handleTopicSubmit");
}

// 2. Remove bottom global attachment box
// To be extremely safe, we will find the exact index near "Submit Topic" button
const submitBtnIdx = c.indexOf('<Button variant="primary" type="submit" loading={submitting}>Submit Topic</Button>');
if (submitBtnIdx !== -1) {
    // Look backwards for the start of the Attachment div
    const searchString = "{selectedTopicProg?.topicMode === 'free-text' && (";
    const attachmentStart = c.lastIndexOf(searchString, submitBtnIdx);
    
    // Look forwards from attachmentStart for the closing brace before the buttons
    if (attachmentStart !== -1) {
        // Find the div wrapper that is closed right before the Cancel button
        // Let's just find the first "<Button variant="ghost"" after attachmentStart
        const cancelBtnIdx = c.indexOf('<Button variant="ghost"', attachmentStart);
        if (cancelBtnIdx !== -1) {
            c = c.substring(0, attachmentStart) + c.substring(cancelBtnIdx);
            console.log("REMOVED BOTTOM ATTACHMENT BOX");
        } else {
            console.log("Cancel button not found after attachment block");
        }
    } else {
        console.log("Attachment block not found near submit button");
    }
} else {
    console.log("Submit button not found");
}

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');