const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

const search = `  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!topicForm.programmeId || !topicForm.topic) { setError('Please fill all fields'); return; }
      const hasCands = myRegistrations.some(r => (r.programme?._id || r.programme) === topicForm.programmeId && r.candidates?.length > 0);
      const isGroup = selectedTopicProg?.format === 'Group';
      if (hasCands && !isGroup && !topicForm.candidateId && !editTopicId) { setError('Please select a candidate'); return; }
      setSubmitting(true);
    try {
      if (editTopicId) {
        const { data } = await api.patch('/topic-registrations/' + editTopicId, { topic: topicForm.topic, attachment: topicForm.attachment });
        setMyTopics(prev => prev.map(t => t._id === editTopicId ? data : t));
      } else {
        const { data } = await api.post('/topic-registrations', {
          programmeId: topicForm.programmeId, teamId,
          candidateId: topicForm.candidateId || undefined,
          topic: topicForm.topic,
            attachment: topicForm.attachment,
        });
        setMyTopics(prev => [data, ...prev]);
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
  };`;

const replace = `  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!topicForm.programmeId) { setError('Please select a programme'); return; }
    
    const isGroup = selectedTopicProg?.format === 'Group';
    
    // Validation
    if (isGroup) {
        if (!topicForm.groupTopic) { setError('Please fill all fields'); return; }
    } else {
        const hasCands = Object.keys(topicForm.candidates).length > 0;
        if (!hasCands) { setError('No candidates available'); return; }
        
        let allFilled = true;
        Object.values(topicForm.candidates).forEach(c => {
            if (!c.topic) allFilled = false;
        });
        if (!allFilled) { setError('Please fill all fields'); return; }
    }

    setSubmitting(true);
    try {
        const results = [];
        if (isGroup) {
            // Find existing group topic registration if any
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
            // Individual submissions
            const existingForProg = myTopics.filter(topic => (topic.programme?._id || topic.programme) === topicForm.programmeId);
            
            const promises = Object.keys(topicForm.candidates).map(async (candId) => {
                const candData = topicForm.candidates[candId];
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
  };`;

c = c.replace(search, replace);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
console.log("Fixed handleTopicSubmit");