const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8');

const itemOld = `              <div 
                key={prog._id}
                onClick={() => selectProgramme(prog)}
                className={\`p-3 rounded-lg cursor-pointer border transition-colors \${
                  selectedProgramme?._id === prog._id 
                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' 
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                }\`}
              >
                <div className="font-medium text-sm text-[var(--color-text-heading)]">{prog.name}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1 flex justify-between">
                  <span>{prog.category}</span>
                  <span className="font-semibold uppercase">{prog.topicMode || 'none'}</span>
                </div>
              </div>`;

const itemNew = `              <div 
                key={prog._id}
                onClick={() => selectProgramme(prog)}
                className={\`p-3 rounded-lg cursor-pointer border transition-colors group \${
                  selectedProgramme?._id === prog._id 
                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' 
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                }\`}
              >
                <div className="flex justify-between items-start">
                    <div className="font-medium text-sm text-[var(--color-text-heading)]">{prog.name} <span className="opacity-50 text-xs ml-1">({prog.code})</span></div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Remove this programme from topic management?')) {
                                api.patch(\`/programmes/\${prog._id}/topic-settings\`, { topicMode: 'none', topicList: [] })
                                   .then(() => {
                                       fetchProgrammes();
                                       if (selectedProgramme?._id === prog._id) setSelectedProgramme(null);
                                   })
                                   .catch(err => alert(err.response?.data?.message || 'Failed'));
                            }
                        }}
                        className="text-[var(--color-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from Topic Management"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1 flex justify-between">
                  <span>{prog.category}</span>
                  <span className="font-semibold uppercase">{prog.topicMode || 'none'}</span>
                </div>
              </div>`;

code = code.replace(itemOld, itemNew);

fs.writeFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', code);
console.log('Patched TopicManagementPage list item');
