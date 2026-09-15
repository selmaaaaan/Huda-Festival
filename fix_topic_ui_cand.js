const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

const candStart = c.lastIndexOf('<div className="space-y-3">');
const candEnd = c.indexOf('</div>\n                                  )}', candStart);

const candUINew = `                                    <div className="space-y-3">
                                      {selectedTopicProg?.topicMode === 'free-text' ? (
                                         <div className="pt-2">
                                           <div className="flex gap-2 mb-3">
                                             <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'text', attachment: '' } } }))} className={\`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors \${(!candData.attachmentType || candData.attachmentType === 'text') ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'}\`}>Text Box</button>
                                             <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'youtube', topic: '', attachment: '' } } }))} className={\`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors \${candData.attachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'}\`}>YouTube Link</button>
                                             <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'image', topic: '', attachment: '' } } }))} className={\`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors \${candData.attachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'}\`}>Image Option</button>
                                           </div>
                                           
                                           {(!candData.attachmentType || candData.attachmentType === 'text') && (
                                             <input
                                               type="text"
                                               value={candData.topic || ''}
                                               onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, topic: e.target.value } } }))}
                                               placeholder="Enter topic text…"
                                               className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]"
                                             />
                                           )}
                                           
                                           {candData.attachmentType === 'youtube' && (
                                             <input type="text" placeholder="Paste YouTube link here..." value={candData.attachment || ''} onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachment: e.target.value } } }))} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                                           )}
                                           
                                           {candData.attachmentType === 'image' && (
                                             <div className="flex flex-col gap-2">
                                               <input type="text" placeholder="Paste Image URL here..." value={candData.attachment || ''} onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachment: e.target.value } } }))} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                                               <div className="flex items-center gap-2">
                                                 <span className="text-xs text-[var(--color-text-muted)] font-medium">OR Upload:</span>
                                               </div>
                                               {candData.attachment && candData.attachment.startsWith('http') ? (
                                                  <div className="flex items-center gap-2 text-sm text-green-500 font-medium">Image Set! <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachment: '' } } }))} className="text-red-500 underline ml-2">Remove</button></div>
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
                                      ) : (
                                        <input
                                          type="text"
                                          value={candData.topic || ''}
                                          onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, topic: e.target.value } } }))}
                                          placeholder="Enter topic…"
                                          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]"
                                        />
                                      )}`;

c = c.substring(0, candStart) + candUINew + c.substring(candEnd);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
console.log("Replaced Candidate Topic UI!");