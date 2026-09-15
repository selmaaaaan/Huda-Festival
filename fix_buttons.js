const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

const groupButtonsNew = `<button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'text', groupAttachment: '' }))} className={\`px-2 py-1 text-xs font-medium rounded border \${(!topicForm.groupAttachmentType || topicForm.groupAttachmentType === 'text') ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Text Box</button>
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'youtube', groupAttachment: '' }))} className={\`px-2 py-1 text-xs font-medium rounded border \${topicForm.groupAttachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>YouTube Link</button>
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'image', groupAttachment: '' }))} className={\`px-2 py-1 text-xs font-medium rounded border \${topicForm.groupAttachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Image Option</button>`;

c = c.replace(
    /<button type="button" onClick=\{\(\) => setTopicForm\(f => \(\{ \.\.\.f, groupAttachmentType: 'youtube'[\s\S]*?>Image Upload<\/button>/,
    groupButtonsNew
);

const candButtonsNew = `<button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'text', attachment: '' } } }))} className={\`px-2 py-1 text-xs font-medium rounded border \${(!candData.attachmentType || candData.attachmentType === 'text') ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Text Box</button>
                                               <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'youtube', attachment: '' } } }))} className={\`px-2 py-1 text-xs font-medium rounded border \${candData.attachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>YouTube Link</button>
                                               <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'image', attachment: '' } } }))} className={\`px-2 py-1 text-xs font-medium rounded border \${candData.attachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}\`}>Image Option</button>`;

c = c.replace(
    /<button type="button" onClick=\{\(\) => setTopicForm\(f => \(\{ \.\.\.f, candidates: \{ \.\.\.f\.candidates, \[c\._id\]: \{ \.\.\.candData, attachmentType: 'youtube'[\s\S]*?>Image Upload<\/button>/,
    candButtonsNew
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');