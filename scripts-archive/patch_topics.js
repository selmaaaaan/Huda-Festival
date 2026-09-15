const fs = require('fs');

const filePath = 'admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace topicForm state
content = content.replace(
    "const [topicForm, setTopicForm] = useState({ programmeId: '', candidateId: '', topic: '', attachment: '' });",
    "const [topicForm, setTopicForm] = useState({ programmeId: '', candidates: {}, groupTopic: '', groupAttachment: '' });"
);

// Replace handleTopicSubmit
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

// Replace resets
content = content.replace(
    /setTopicForm\(\{ programmeId: '', candidateId: '', topic: '', attachment: '' \}\);/g,
    "setTopicForm({ programmeId: '', candidates: {}, groupTopic: '', groupAttachment: '' });"
);

content = content.replace(
    /setTopicForm\(f => \(\{ \.\.\.f, programmeId: '', topic: '', candidateId: '', attachment: '' \}\)\);/g,
    "setTopicForm(f => ({ ...f, programmeId: '', candidates: {}, groupTopic: '', groupAttachment: '' }));"
);

// Replace onSelect reset and load existing topics!
content = content.replace(
    /setTopicForm\(f => \(\{ \.\.\.f, programmeId: val, topic: '', candidateId: '', attachment: '' \}\)\);/g,
    `{
        const existingForProg = myTopics.filter(t => (t.programme?._id || t.programme) === val);
        const candsMap = {};
        myRegistrations.filter(r => (r.programme?._id || r.programme) === val && r.status !== 'rejected').flatMap(r => r.candidates || []).forEach(c => {
           const et = existingForProg.find(t => t.candidate?._id === c._id);
           if (et) candsMap[c._id] = { topic: et.topic, attachment: et.attachment || '' };
           else candsMap[c._id] = { topic: '', attachment: '' };
        });
        const groupEt = existingForProg[0];
        setTopicForm(f => ({ ...f, programmeId: val, candidates: candsMap, groupTopic: groupEt?.topic || '', groupAttachment: groupEt?.attachment || '' }));
    }`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('JS part 1 done');