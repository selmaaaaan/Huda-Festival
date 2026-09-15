const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8').replace(/\r\n/g, '\n');

// 1. Fix handleTopicSubmit Validation
c = c.replace(
    /if \(isGroup\) \{\s+if \(!topicForm\.groupTopic\) \{ setError\('Please fill all fields'\); return; \}\s+\}/,
    `if (isGroup) {
        if (!topicForm.groupTopic && !topicForm.groupAttachment) { setError('Please fill all fields'); return; }
        if (!topicForm.groupTopic && topicForm.groupAttachment) topicForm.groupTopic = 'Attachment Provided';
    }`
);

c = c.replace(
    /if \(!candData \|\| !candData\.topic\) allFilled = false;/,
    `if (!candData || (!candData.topic && !candData.attachment)) allFilled = false;
            if (candData && !candData.topic && candData.attachment) candData.topic = 'Attachment Provided';`
);

// 2. Fix Group Topic UI
const groupStartStr = `                              <div className="space-y-3">\n                                <input\n                                  type="text"\n                                  value={topicForm.groupTopic || ''}`;
const groupEndStr = `                                     )}\n                                   </div>\n                                )}\n                              </div>`;

const groupStart = c.indexOf(groupStartStr);
const groupEnd = c.indexOf(groupEndStr, groupStart);

if (groupStart > -1 && groupEnd > -1) {
    const groupUINew = `                              <div className="space-y-3">
                                {selectedTopicProg?.topicMode === 'free-text' ? (
                                   <div className="pt-2">
                                     <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-2">Topic Submission Type</label>
                                     <div className="flex gap-2 mb-3">
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'text', groupAttachment: '' }))} className={\`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors \${(!topicForm.groupAttachmentType || topicForm.groupAttachmentType === 'text') ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'}\`}>Text Box</button>
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'youtube', groupTopic: '', groupAttachment: '' }))} className={\`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors \${topicForm.groupAttachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'}\`}>YouTube Link</button>
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'image', groupTopic: '', groupAttachment: '' }))} className={\`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors \${topicForm.groupAttachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'}\`}>Image Option</button>
                                     </div>
                                     
                                     {(!topicForm.groupAttachmentType || topicForm.groupAttachmentType === 'text') && (
                                       <input
                                         type="text"
                                         value={topicForm.groupTopic || ''}
                                         onChange={e => setTopicForm(f => ({ ...f, groupTopic: e.target.value }))}
                                         placeholder="Enter topic text…"
                                         className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                                       />
                                     )}
                                     
                                     {topicForm.groupAttachmentType === 'youtube' && (
                                       <input type="text" placeholder="Paste YouTube link here..." value={topicForm.groupAttachment || ''} onChange={e => setTopicForm(f => ({ ...f, groupAttachment: e.target.value }))} className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                                     )}
                                     
                                     {topicForm.groupAttachmentType === 'image' && (
                                       <div className="flex flex-col gap-2">
                                         <input type="text" placeholder="Paste Image URL here..." value={topicForm.groupAttachment || ''} onChange={e => setTopicForm(f => ({ ...f, groupAttachment: e.target.value }))} className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                                         <div className="flex items-center gap-2">
                                           <span className="text-xs text-[var(--color-text-muted)] font-medium">OR Upload:</span>
                                         </div>
                                         {topicForm.groupAttachment && topicForm.groupAttachment.startsWith('http') ? (
                                            <div className="flex items-center gap-2 text-sm text-green-500 font-medium">Image Set! <button type="button" onClick={() => setTopicForm(f => ({...f, groupAttachment: ''}))} className="text-red-500 underline ml-2">Remove</button></div>
                                         ) : (
                                            <input type="file" accept="image/*" onChange={async (e) => {
                                               if(!e.target.files[0]) return;
                                               const fd = new FormData(); fd.append('file', e.target.files[0]);
                                               try {
                                                  const res = await api.post('/topic-registrations/upload', fd);
                                                  setTopicForm(f => ({ ...f, groupAttachment: res.data.url }));
                                               } catch(err) { alertAction('Upload failed'); }
                                            }} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-dark)]" />
                                         )}
                                       </div>
                                     )}
                                   </div>
                                ) : (
                                  <input
                                    type="text"
                                    value={topicForm.groupTopic || ''}
                                    onChange={e => setTopicForm(f => ({ ...f, groupTopic: e.target.value }))}
                                    placeholder="Enter group topic…"
                                    className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                                  />
                                )}
                              </div>`;
    
    c = c.substring(0, groupStart) + groupUINew + c.substring(groupEnd + groupEndStr.length);
}

// 3. Fix Candidate Topic UI
const candStartStr = `                                    <div className="space-y-3">\n                                      <input\n                                        type="text"\n                                        value={candData.topic || ''}`;
const candEndStr = `                                           )}\n                                         </div>\n                                      )}\n                                    </div>`;

const candStart = c.indexOf(candStartStr);
const candEnd = c.indexOf(candEndStr, candStart);

if (candStart > -1 && candEnd > -1) {
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
                                      )}
                                    </div>`;
                                    
    c = c.substring(0, candStart) + candUINew + c.substring(candEnd + candEndStr.length);
}

c = c.replace(/{t\.status !== 'approved' && \(/g, "{isTopicRegistrationEnabled !== false && t.status !== 'approved' && (");
c = c.replace(/{true && \(\s*<button onClick=\{\(\) => handleDeleteTopic\(t\._id\)\}/g, "{isTopicRegistrationEnabled !== false && t.status !== 'approved' && (\n                              <button onClick={() => handleDeleteTopic(t._id)}");


fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
console.log("Properly patched TeamTopicRegistrationPage.jsx with exact lengths!");