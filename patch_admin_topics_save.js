const fs = require('fs');
const filePath = 'admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

const handleTopicSubmitCode = `const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!topicForm.programmeId) { setError('Please select a programme'); return; }
    
    const isGroup = selectedTopicProg?.format === 'Group';

    setSubmitting(true);
    try {
      if (isGroup) {
         if (!topicForm.groupTopic) { setError('Please enter a topic'); return; }
         const existing = myTopics.find(t => (t.programme?._id || t.programme) === topicForm.programmeId);
         if (existing) {
             const { data } = await api.patch('/topic-registrations/' + existing._id, { topic: topicForm.groupTopic, attachment: topicForm.groupAttachment });
             setMyTopics(prev => prev.map(t => t._id === existing._id ? data : t));
         } else {
             const { data } = await api.post('/topic-registrations', {
                 programmeId: topicForm.programmeId, teamId, topic: topicForm.groupTopic, attachment: topicForm.groupAttachment
             });
             setMyTopics(prev => [data, ...prev]);
         }
      } else {
         const promises = [];
         let updatedAny = false;
         const candIds = Object.keys(topicForm.candidates);
         for (const candId of candIds) {
            const tData = topicForm.candidates[candId];
            if (!tData || !tData.topic) continue;
            updatedAny = true;
            const existing = myTopics.find(t => (t.programme?._id || t.programme) === topicForm.programmeId && t.candidate?._id === candId);
            if (existing) {
               if (existing.topic !== tData.topic || existing.attachment !== tData.attachment) {
                   promises.push(api.patch('/topic-registrations/' + existing._id, { topic: tData.topic, attachment: tData.attachment }).then(r => r.data));
               }
            } else {
               promises.push(api.post('/topic-registrations', { programmeId: topicForm.programmeId, teamId, candidateId: candId, topic: tData.topic, attachment: tData.attachment }).then(r => r.data));
            }
         }
         if (!updatedAny && candIds.length > 0) { setError('Please select at least one topic'); return; }
         
         const results = await Promise.all(promises);
         if (results.length > 0) {
             const newTopicIds = results.map(r => r._id);
             setMyTopics(prev => [...results, ...prev.filter(p => !newTopicIds.includes(p._id))]);
         }
      }
      
      setSuccess(true);
      setTimeout(() => {
        setShowTopicForm(false);
        setEditTopicId(null);
        setTopicForm({ programmeId: '', candidates: {}, groupTopic: '', groupAttachment: '' });
        setTopicCategory('');
        setSuccess(false);
      }, 1500);
    } catch (e) { setError(e.response?.data?.message || 'Failed to submit topic(s)'); }
    finally { setSubmitting(false); }
  };`;

content = content.replace(
    /const handleTopicSubmit = async \(e\) => \{[\s\S]*?finally \{ setSubmitting\(false\); \}\n    \};/,
    handleTopicSubmitCode
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Admin Submit Patched');