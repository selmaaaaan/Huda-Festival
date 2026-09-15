const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

// 1. Mojibakes
c = c.replace(/3 \?"/g, '3 -');
c = c.replace(/Select a topic\?/g, 'Select a topic...');
c = c.replace(/Enter group topic\?/g, 'Enter group topic...');
c = c.replace(/Enter topic\?/g, 'Enter topic text...');

// 2. Group Attachment - Add "Text Box" button and textarea
const groupButtonsOld = `<button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'youtube', groupAttachment: '' }))} className={\`px-2 py-1 text-xs font-medium rounded border \${topicForm.groupAttachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>YouTube Link</button>
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'image', groupAttachment: '' }))} className={\`px-2 py-1 text-xs font-medium rounded border \${topicForm.groupAttachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Image Upload</button>`;

const groupButtonsNew = `<button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'text', groupAttachment: '' }))} className={\`px-2 py-1 text-xs font-medium rounded border \${(!topicForm.groupAttachmentType || topicForm.groupAttachmentType === 'text') ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Text Box</button>
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'youtube', groupAttachment: '' }))} className={\`px-2 py-1 text-xs font-medium rounded border \${topicForm.groupAttachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>YouTube Link</button>
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'image', groupAttachment: '' }))} className={\`px-2 py-1 text-xs font-medium rounded border \${topicForm.groupAttachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Image Option</button>`;

c = c.replace(groupButtonsOld, groupButtonsNew);

const groupYoutubeInput = `{topicForm.groupAttachmentType === 'youtube' && (`;
const groupTextareaNew = `{(!topicForm.groupAttachmentType || topicForm.groupAttachmentType === 'text') && (
                                       <textarea
                                         value={topicForm.groupAttachment || ''}
                                         onChange={e => setTopicForm(f => ({ ...f, groupAttachment: e.target.value }))}
                                         placeholder="Enter attachment text (optional)…"
                                         rows="3"
                                         className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)] resize-none"
                                       />
                                     )}
                                     {topicForm.groupAttachmentType === 'youtube' && (`;

c = c.replace(groupYoutubeInput, groupTextareaNew);

// 3. Candidate Attachment - Add "Text Box" button and textarea
const candButtonsOld = `<button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'youtube', attachment: '' } } }))} className={\`px-2 py-1 text-xs font-medium rounded border \${candData.attachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>YouTube Link</button>
                                               <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'image', attachment: '' } } }))} className={\`px-2 py-1 text-xs font-medium rounded border \${candData.attachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Image Upload</button>`;

const candButtonsNew = `<button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'text', attachment: '' } } }))} className={\`px-2 py-1 text-xs font-medium rounded border \${(!candData.attachmentType || candData.attachmentType === 'text') ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Text Box</button>
                                               <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'youtube', attachment: '' } } }))} className={\`px-2 py-1 text-xs font-medium rounded border \${candData.attachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>YouTube Link</button>
                                               <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'image', attachment: '' } } }))} className={\`px-2 py-1 text-xs font-medium rounded border \${candData.attachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Image Option</button>`;

c = c.replace(candButtonsOld, candButtonsNew);

const candYoutubeInput = `{candData.attachmentType === 'youtube' && (`;
const candTextareaNew = `{(!candData.attachmentType || candData.attachmentType === 'text') && (
                                               <textarea
                                                 value={candData.attachment || ''}
                                                 onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachment: e.target.value } } }))}
                                                 placeholder="Enter attachment text (optional)…"
                                                 rows="3"
                                                 className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)] resize-none"
                                               />
                                             )}
                                             {candData.attachmentType === 'youtube' && (`;

c = c.replace(candYoutubeInput, candTextareaNew);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');