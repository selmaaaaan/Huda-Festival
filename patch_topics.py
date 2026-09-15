import re

file_path = "admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace topicForm state
content = re.sub(
    r"const \[topicForm, setTopicForm\] = useState\(\{ programmeId: '', candidateId: '', topic: '', attachment: '' \}\);",
    r"const [topicForm, setTopicForm] = useState({ programmeId: '', candidates: {}, groupTopic: '', groupAttachment: '' });",
    content
)

# Replace handleTopicSubmit
handle_topic_submit_code = """const handleTopicSubmit = async (e) => {
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
  };"""

content = re.sub(
    r"const handleTopicSubmit = async \(e\) => \{.*?\s*finally \{ setSubmitting\(false\); \}\n    \};",
    handle_topic_submit_code,
    content,
    flags=re.DOTALL
)

# Replace openTopicForm reset
content = re.sub(
    r"setTopicForm\(\{ programmeId: '', candidateId: '', topic: '', attachment: '' \}\);",
    r"setTopicForm({ programmeId: '', candidates: {}, groupTopic: '', groupAttachment: '' });",
    content
)

# Replace category reset
content = re.sub(
    r"setTopicForm\(f => \(\{ \.\.\.f, programmeId: '', topic: '', candidateId: '', attachment: '' \}\)\);",
    r"setTopicForm(f => ({ ...f, programmeId: '', candidates: {}, groupTopic: '', groupAttachment: '' }));",
    content
)

# Replace programme select reset
content = re.sub(
    r"setTopicForm\(f => \(\{ \.\.\.f, programmeId: val, topic: '', candidateId: '', attachment: '' \}\)\);",
    r"setTopicForm(f => ({ ...f, programmeId: val, candidates: {}, groupTopic: '', groupAttachment: '' }));",
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("TeamLeaderDashboard.jsx logic patched")