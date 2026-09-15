const fs = require('fs');
const filePath = 'admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace topicForm state
content = content.replace(
    "const [topicForm, setTopicForm] = useState({ programmeId: '', candidateId: '', topic: '' });",
    "const [topicForm, setTopicForm] = useState({ programmeId: '', candidates: {}, groupTopic: '' });"
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
             const { data } = await api.patch('/topic-registrations/' + existing._id, { topic: topicForm.groupTopic });
             setMyTopics(prev => prev.map(t => t._id === existing._id ? data : t));
         } else {
             const { data } = await api.post('/topic-registrations', {
                 programmeId: topicForm.programmeId, teamId, topic: topicForm.groupTopic
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
               if (existing.topic !== tData.topic) {
                   promises.push(api.patch('/topic-registrations/' + existing._id, { topic: tData.topic }).then(r => r.data));
               }
            } else {
               promises.push(api.post('/topic-registrations', { programmeId: topicForm.programmeId, teamId, candidateId: candId, topic: tData.topic }).then(r => r.data));
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
        setTopicForm({ programmeId: '', candidates: {}, groupTopic: '' });
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

// Replace openNewRegistration
content = content.replace(
    /setTopicForm\(\{ programmeId: '', candidateId: '', topic: '' \}\);/g,
    "setTopicForm({ programmeId: '', candidates: {}, groupTopic: '' });"
);
content = content.replace(
    /setTopicForm\(f => \(\{ \.\.\.f, programmeId: '', topic: '', candidateId: '' \}\)\);/g,
    "setTopicForm(f => ({ ...f, programmeId: '', candidates: {}, groupTopic: '' }));"
);

// Replace openEditTopic
content = content.replace(
    /setTopicForm\(\{ programmeId: t\.programme\?._id, candidateId: t\.candidate\?._id, topic: t\.topic \}\);/,
    `{
      const existingForProg = myTopics.filter(topic => (topic.programme?._id || topic.programme) === t.programme?._id);
      const candsMap = {};
      myRegistrations.filter(r => (r.programme?._id || r.programme) === t.programme?._id && r.status !== 'rejected').flatMap(r => r.candidates || []).forEach(c => {
         const et = existingForProg.find(topic => topic.candidate?._id === c._id);
         if (et) candsMap[c._id] = { topic: et.topic };
         else candsMap[c._id] = { topic: '' };
      });
      const groupEt = existingForProg[0];
      setTopicForm({ programmeId: t.programme?._id, candidates: candsMap, groupTopic: groupEt?.topic || '' });
    }`
);

// Replace onSelect reset and load existing topics
content = content.replace(
    /setTopicForm\(f => \(\{ \.\.\.f, programmeId: val, topic: '', candidateId: '' \}\)\);/g,
    `{
        const existingForProg = myTopics.filter(t => (t.programme?._id || t.programme) === val);
        const candsMap = {};
        myRegistrations.filter(r => (r.programme?._id || r.programme) === val && r.status !== 'rejected').flatMap(r => r.candidates || []).forEach(c => {
           const et = existingForProg.find(t => t.candidate?._id === c._id);
           if (et) candsMap[c._id] = { topic: et.topic };
           else candsMap[c._id] = { topic: '' };
        });
        const groupEt = existingForProg[0];
        setTopicForm(f => ({ ...f, programmeId: val, candidates: candsMap, groupTopic: groupEt?.topic || '' }));
    }`
);

// UI Replacement
const replacementUI = `              {topicForm.programmeId && (() => {
                  const regs = myRegistrations.filter(r => (r.programme._id || r.programme) === topicForm.programmeId && r.status !== 'rejected');
                  const registeredCands = regs.flatMap(r => r.candidates || []);
                  
                  const uniqueCandsMap = new Map();
                  registeredCands.forEach(c => {
                      if (c && c._id) uniqueCandsMap.set(c._id, c);
                  });
                  const uniqueCands = Array.from(uniqueCandsMap.values());

                  const isGroup = selectedTopicProg?.format === 'Group';
                  const otherTeamTopics = otherTopics[topicForm.programmeId] || [];
                  const globallyTakenTopics = selectedTopicProg?.topicMode === 'fixed-list-global' ? otherTeamTopics.map(t => t.topic) : [];
                  
                  return (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      {isGroup ? (
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                             3 ?" Enter Group Topic
                           </label>
                           {selectedTopicProg?.topicMode === 'fixed-list' || selectedTopicProg?.topicMode === 'fixed-list-global' ? (
                              <select
                                value={topicForm.groupTopic || ''}
                                onChange={e => setTopicForm(f => ({ ...f, groupTopic: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                              >
                                <option value="">Select a topic?</option>
                                {selectedTopicProg?.topicList?.map(t => (
                                  <option key={t} value={t} disabled={globallyTakenTopics.includes(t) && topicForm.groupTopic !== t}>{t}</option>
                                ))}
                              </select>
                           ) : (
                              <input
                                type="text"
                                value={topicForm.groupTopic || ''}
                                onChange={e => setTopicForm(f => ({ ...f, groupTopic: e.target.value }))}
                                placeholder="Enter group topic?"
                                className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                              />
                           )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                            3 ?" Assign Topics to Candidates
                          </label>
                          {uniqueCands.length === 0 && <p className="text-sm text-red-500">No candidates registered for this programme yet.</p>}
                          {uniqueCands.map(c => {
                             const candData = topicForm.candidates[c._id] || { topic: '' };
                             // Topics taken by OTHER candidates in THIS team (for fixed-list Team Exclusive)
                             const otherCandTopics = Object.keys(topicForm.candidates).filter(id => id !== c._id).map(id => topicForm.candidates[id]?.topic).filter(Boolean);
                             
                             return (
                               <div key={c._id} className="p-3 border rounded-lg bg-[var(--color-surface-elevated)] space-y-2">
                                  <div className="font-semibold text-sm">{c.name} <span className="text-xs opacity-60">({c.admissionNo})</span></div>
                                  {selectedTopicProg?.topicMode === 'fixed-list' || selectedTopicProg?.topicMode === 'fixed-list-global' ? (
                                    <select
                                      value={candData.topic || ''}
                                      onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, topic: e.target.value } } }))}
                                      className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]"
                                    >
                                      <option value="">Select a topic?</option>
                                      {selectedTopicProg?.topicList?.map(t => {
                                         let isDisabled = false;
                                         if (selectedTopicProg.topicMode === 'fixed-list-global') {
                                             if (globallyTakenTopics.includes(t) && candData.topic !== t) isDisabled = true;
                                         }
                                         if (selectedTopicProg.topicMode === 'fixed-list') {
                                             if (otherCandTopics.includes(t)) isDisabled = true; // Taken by teammate!
                                         }
                                         return <option key={t} value={t} disabled={isDisabled}>{t}</option>;
                                      })}
                                    </select>
                                  ) : (
                                    <input
                                      type="text"
                                      value={candData.topic || ''}
                                      onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, topic: e.target.value } } }))}
                                      placeholder="Enter topic?"
                                      className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]"
                                    />
                                  )}
                               </div>
                             );
                          })}
                        </div>
                      )}

                  {/* Already-submitted topics by other teams */}
                  {otherTopics[topicForm.programmeId]?.length > 0 && (
                    <div className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-elevated)] mt-4">
                      <h4 className="text-xs font-bold mb-2 uppercase tracking-wider text-[var(--color-text-muted)]">
                        Already Submitted Topics (Other Teams)
                      </h4>
                      <ul className="space-y-1">
                        {otherTopics[topicForm.programmeId].map(t => (
                          <li key={t._id} className="text-sm flex gap-2">
                            <span className="opacity-50 shrink-0">{t.team?.name}:</span>
                            <span className={t.status === 'approved' ? 'text-green-500 font-medium' : ''}>
                              {t.topic}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
                );
              })()}`;

content = content.replace(
    /\{topicForm\.programmeId && \(\(\) => \{[\s\S]*?\}\)\(\)\}/,
    replacementUI
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Admin UI Patched successfully');