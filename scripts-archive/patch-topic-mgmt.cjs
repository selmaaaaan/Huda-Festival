const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8');

// 1. Fix CATEGORIES
code = code.replace(
    /const CATEGORIES = \['All', 'BIDAYAH', '\?ULA', 'THANIYAH', 'THANAWIYYAH', '\?ALIYAH', 'KULLIYYAH'\];/,
    `const CATEGORIES = ['All', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'];`
);

// 2. Fix filteredProgrammes
code = code.replace(
    /const filteredProgrammes = programmes\.filter\(p => selectedCategory === 'All' \|\| p\.category === selectedCategory\);/,
    `const filteredProgrammes = programmes.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchTopic = (p.topicMode && p.topicMode !== 'none') || (selectedProgramme && selectedProgramme._id === p._id);
    return matchCat && matchTopic;
  });`
);

// 3. Add "+ Add Programme" dropdown in the header
const oldHeader = `<h2 className="text-sm font-semibold mb-3">Programmes</h2>`;
const newHeader = `<div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Programmes</h2>
              <select 
                onChange={(e) => {
                  const p = programmes.find(x => x._id === e.target.value);
                  if (p) selectProgramme(p);
                  e.target.value = "";
                }}
                className="text-xs px-2 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded outline-none w-32 text-[var(--color-text-heading)] focus:border-[var(--color-primary)] truncate"
                defaultValue=""
              >
                <option value="" disabled>+ Add Programme</option>
                {programmes
                  .filter(p => !p.topicMode || p.topicMode === 'none')
                  .sort((a,b) => (a.category + a.name).localeCompare(b.category + b.name))
                  .map(p => (
                    <option key={p._id} value={p._id}>{p.category} - {p.name}</option>
                  ))
                }
              </select>
            </div>`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', code);
console.log('Patched TopicManagementPage');
