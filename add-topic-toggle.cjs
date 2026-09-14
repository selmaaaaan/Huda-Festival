const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

const target = `<button onClick={() => handleOpenTeamModal(team)} className="p-1.5 text-[var(--color-text-muted)] hover:text-blue-500 rounded-md hover:bg-blue-500/10">`;

const replacement = `<div className="flex flex-col items-center mr-4">
                        <span className="text-[10px] text-[var(--color-text-muted)] mb-1">Topics</span>
                        <button 
                          onClick={() => handleToggleTeamTopic(team)}
                          className={\`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none \${team.isTopicRegistrationOpen !== false ? 'bg-green-500' : 'bg-red-500'}\`}
                        >
                          <span className={\`inline-block h-2 w-2 transform rounded-full bg-white transition-transform \${team.isTopicRegistrationOpen !== false ? 'translate-x-4' : 'translate-x-1'}\`} />
                        </button>
                      </div>
                      <button onClick={() => handleOpenTeamModal(team)} className="p-1.5 text-[var(--color-text-muted)] hover:text-blue-500 rounded-md hover:bg-blue-500/10">`;

txt = txt.replace(target, replacement);
fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', txt);
