const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8');

if (!c.includes('editTopicAttachment')) {
    // 1. Add state
    c = c.replace(/const \[editTopicText, setEditTopicText\] = useState\(''\);/, 
        `const [editTopicText, setEditTopicText] = useState('');
  const [editTopicAttachment, setEditTopicAttachment] = useState('');`);

    // 2. Modify startEditTopic
    c = c.replace(/const startEditTopic = \(topicObj\) => \{[\s\S]*?\};/, 
        `const startEditTopic = (topicObj) => {
    setEditingTopicId(topicObj._id);
    setEditTopicText(topicObj.topic);
    setEditTopicAttachment(topicObj.attachment || '');
  };`);

    // 3. Modify saveTopicText
    c = c.replace(/await api\.patch\(\`\/topic-registrations\/\$\{id\}\`, \{ topic: editTopicText \}\);/,
        `await api.patch(\`/topic-registrations/\${id}\`, { topic: editTopicText, attachment: editTopicAttachment });`);

    // 4. Modify the UI
    const uiRegex = /<input\s+type="text"\s+className="flex-1 px-3 py-1.5 text-sm bg-\[var\(--color-surface\)\] border border-\[var\(--color-border\)\] rounded focus:outline-none focus:border-\[var\(--color-primary\)\]"\s+value=\{editTopicText\}\s+onChange=\{e => setEditTopicText\(e.target.value\)\}\s+autoFocus\s+\/>/;
    
    const uiNew = `<div className="flex flex-col gap-2 flex-1">
                                  <input 
                                    type="text" 
                                    className="px-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)]" 
                                    value={editTopicText} 
                                    onChange={e => setEditTopicText(e.target.value)} 
                                    placeholder="Topic Text"
                                    autoFocus 
                                  />
                                  <input 
                                    type="text" 
                                    className="px-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)]" 
                                    value={editTopicAttachment} 
                                    onChange={e => setEditTopicAttachment(e.target.value)} 
                                    placeholder="Attachment URL"
                                  />
                                </div>`;
                                
    c = c.replace(uiRegex, uiNew);

    fs.writeFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', c, 'utf8');
    console.log("Patched Admin Edit Topic");
} else {
    console.log("Already patched");
}