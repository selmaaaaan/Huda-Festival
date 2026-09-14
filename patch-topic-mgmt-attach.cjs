const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8');

code = code.replace(
    /<span className="text-sm font-medium text-\[var\(--color-primary\)\]">\{topic\.topic\}<\/span>/,
    `<div className="flex flex-col">
        <span className="text-sm font-medium text-[var(--color-primary)]">{topic.topic}</span>
        {topic.attachment && (
            <a href={topic.attachment} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 truncate max-w-xs">
                {topic.attachment}
            </a>
        )}
    </div>`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', code);
console.log('Patched TopicManagementPage for attachment view');
