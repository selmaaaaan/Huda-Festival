const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

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