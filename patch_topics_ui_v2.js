const fs = require('fs');

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

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
                  const globallyTakenTopics = selectedTopicProg?.topicMode === 'exclusive' ? otherTeamTopics.map(t => t.topic) : [];
                  
                  return (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      {isGroup ? (
                        <div className="p-3 border rounded-lg bg-[var(--color-surface-elevated)] space-y-3">
                           <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                             3 ?" Enter Group Topic
                           </label>
                           {selectedTopicProg?.topicMode === 'fixed' || selectedTopicProg?.topicMode === 'exclusive' ? (
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
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={topicForm.groupTopic || ''}
                                  onChange={e => setTopicForm(f => ({ ...f, groupTopic: e.target.value }))}
                                  placeholder="Enter group topic?"
                                  className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                                />
                                
                                {selectedTopicProg?.topicMode === 'free-text' && (
                                   <div className="pt-2 border-t border-[var(--color-border)]">
                                     <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-2">Attachment</label>
                                     <div className="flex gap-2 mb-2">
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'youtube', groupAttachment: '' }))} className={\`px-2 py-1 text-xs font-medium rounded border \${topicForm.groupAttachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>YouTube Link</button>
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'image', groupAttachment: '' }))} className={\`px-2 py-1 text-xs font-medium rounded border \${topicForm.groupAttachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Image Upload</button>
                                     </div>
                                     {topicForm.groupAttachmentType === 'youtube' && (
                                       <input type="text" placeholder="https://youtube.com/..." value={topicForm.groupAttachment || ''} onChange={e => setTopicForm(f => ({ ...f, groupAttachment: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                                     )}
                                     {topicForm.groupAttachmentType === 'image' && (
                                       <div>
                                         {topicForm.groupAttachment ? (
                                            <div className="flex items-center gap-2 text-sm text-green-500 font-medium">Uploaded Successfully! <button type="button" onClick={() => setTopicForm(f => ({...f, groupAttachment: ''}))} className="text-red-500 underline ml-2">Remove</button></div>
                                         ) : (
                                            <input type="file" accept="image/*" onChange={async (e) => {
                                               if(!e.target.files[0]) return;
                                               const fd = new FormData(); fd.append('file', e.target.files[0]);
                                               try {
                                                  const res = await api.post('/topic-registrations/upload', fd);
                                                  setTopicForm(f => ({ ...f, groupAttachment: res.data.url }));
                                               } catch(err) { alert('Upload failed'); }
                                            }} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-dark)]" />
                                         )}
                                       </div>
                                     )}
                                   </div>
                                )}
                              </div>
                           )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                            3 ?" Assign Topics to Candidates
                          </label>
                          {uniqueCands.length === 0 && <p className="text-sm text-red-500">No candidates registered for this programme yet.</p>}
                          {uniqueCands.map(c => {
                             const candData = topicForm.candidates[c._id] || { topic: '', attachment: '' };
                             const otherCandTopics = Object.keys(topicForm.candidates).filter(id => id !== c._id).map(id => topicForm.candidates[id]?.topic).filter(Boolean);
                             
                             return (
                               <div key={c._id} className="p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-elevated)] space-y-3">
                                  <div className="font-semibold text-sm">{c.name} <span className="text-xs opacity-60">({c.admissionNo})</span></div>
                                  {selectedTopicProg?.topicMode === 'fixed' || selectedTopicProg?.topicMode === 'exclusive' ? (
                                    <select
                                      value={candData.topic || ''}
                                      onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, topic: e.target.value } } }))}
                                      className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]"
                                    >
                                      <option value="">Select a topic?</option>
                                      {selectedTopicProg?.topicList?.map(t => {
                                         let isDisabled = false;
                                         if (selectedTopicProg.topicMode === 'exclusive') {
                                             if (globallyTakenTopics.includes(t) && candData.topic !== t) isDisabled = true;
                                         }
                                         if (selectedTopicProg.topicMode === 'fixed') {
                                             if (otherCandTopics.includes(t)) isDisabled = true;
                                         }
                                         return <option key={t} value={t} disabled={isDisabled}>{t}</option>;
                                      })}
                                    </select>
                                  ) : (
                                    <div className="space-y-3">
                                      <input
                                        type="text"
                                        value={candData.topic || ''}
                                        onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, topic: e.target.value } } }))}
                                        placeholder="Enter topic?"
                                        className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]"
                                      />
                                      {selectedTopicProg?.topicMode === 'free-text' && (
                                         <div className="pt-2 border-t border-[var(--color-border)]">
                                           <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-2">Attachment</label>
                                           <div className="flex gap-2 mb-2">
                                             <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'youtube', attachment: '' } } }))} className={\`px-2 py-1 text-xs font-medium rounded border \${candData.attachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>YouTube Link</button>
                                             <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'image', attachment: '' } } }))} className={\`px-2 py-1 text-xs font-medium rounded border \${candData.attachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Image Upload</button>
                                           </div>
                                           {candData.attachmentType === 'youtube' && (
                                             <input type="text" placeholder="https://youtube.com/..." value={candData.attachment || ''} onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachment: e.target.value } } }))} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                                           )}
                                           {candData.attachmentType === 'image' && (
                                             <div>
                                               {candData.attachment ? (
                                                  <div className="flex items-center gap-2 text-sm text-green-500 font-medium">Uploaded Successfully! <button type="button" onClick={() => setTopicForm(f => ({...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachment: '' } } }))} className="text-red-500 underline ml-2">Remove</button></div>
                                               ) : (
                                                  <input type="file" accept="image/*" onChange={async (e) => {
                                                     if(!e.target.files[0]) return;
                                                     const fd = new FormData(); fd.append('file', e.target.files[0]);
                                                     try {
                                                        const res = await api.post('/topic-registrations/upload', fd);
                                                        setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachment: res.data.url } } }));
                                                     } catch(err) { alert('Upload failed'); }
                                                  }} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-dark)]" />
                                               )}
                                             </div>
                                           )}
                                         </div>
                                      )}
                                    </div>
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
                              {t.topic} {t.attachment && <a href={t.attachment} target="_blank" className="text-blue-500 text-xs ml-1 underline">View</a>}
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
    
    // Also inject attachmentType inference in openNew/openEdit if possible, but actually it defaults to undefined which means neither tab is selected until they click.
    // Let's modify the reset mapping to infer attachmentType from existing attachment
    const resetRegex = /candsMap\[c\._id\] = \{ topic: et\.topic \};/g;
    content = content.replace(resetRegex, "candsMap[c._id] = { topic: et.topic, attachment: et.attachment || '', attachmentType: et.attachment ? (et.attachment.includes('youtu') ? 'youtube' : 'image') : '' };");
    
    const resetRegex2 = /candsMap\[c\._id\] = \{ topic: '' \};/g;
    content = content.replace(resetRegex2, "candsMap[c._id] = { topic: '', attachment: '', attachmentType: '' };");
    
    const resetGroup = /groupTopic: groupEt\?\.topic \|\| '' \}\)\);/;
    content = content.replace(resetGroup, "groupTopic: groupEt?.topic || '', groupAttachment: groupEt?.attachment || '', groupAttachmentType: groupEt?.attachment ? (groupEt.attachment.includes('youtu') ? 'youtube' : 'image') : '' }));");

    const resetGroupAdmin = /groupTopic: groupEt\?\.topic \|\| '' \}\);/;
    content = content.replace(resetGroupAdmin, "groupTopic: groupEt?.topic || '', groupAttachment: groupEt?.attachment || '', groupAttachmentType: groupEt?.attachment ? (groupEt.attachment.includes('youtu') ? 'youtube' : 'image') : '' });");

    fs.writeFileSync(filePath, content, 'utf-8');
}

patchFile('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx');
patchFile('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx');
console.log('UI Patched successfully');