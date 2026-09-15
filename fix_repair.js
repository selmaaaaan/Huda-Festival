const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

const s1 = `                                      <input
                                        type="text"
                                        value={candData.topic || ''}
                                        onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, topic: e.target.value } } }))}
                                        placeholder="Enter topic?"
                                        className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]"
                                      />`;

const idx = c.indexOf(s1);
const endIdx = c.indexOf('Already Submitted Topics (Other Teams)', idx);

const replace = `                                      <input
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
                                                     } catch(err) { alertAction('Upload failed'); }
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
                        `;

c = c.substring(0, idx) + replace + c.substring(endIdx);
fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
console.log("REPAIRED");