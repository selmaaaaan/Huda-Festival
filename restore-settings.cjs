const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

const regex = /\{THEME_COLORS\.map\(theme => \(\n\s*<button[\s\S]*?\{isOpen \? 'translate-x-5' : 'translate-x-1'\}'\}`} \/>\n\s*<\/button>\n\s*<\/div>\n\s*\)\n\s*\}\)\}\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/;

// Oh wait, my previous regex matched up to `boxShadow: '0 1px 3px rgba(0,0,0,0.3)'\n                                }} \n                            />\n                          </button>`!

// Let's replace from `{THEME_COLORS.map(theme => (` to the end of the broken part
const searchRegex = /\{THEME_COLORS\.map\(theme => \(\n\s*<button [\s\S]*?boxShadow: '0 1px 3px rgba\(0,0,0,0\.3\)'\n\s*\}\} \n\s*\/>\n\s*<\/button>/;

const replacement = `{THEME_COLORS.map(theme => (
                <button 
                  key={theme.bg}
                  onClick={() => applyTheme(theme)}
                  className={\`w-10 h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center \${currentTheme?.bg === theme.bg ? 'ring-4 ring-offset-2 ring-blue-500' : ''}\`}
                  style={{ backgroundColor: theme.bg }}
                />
              ))}
            </div>
          </div>

          {/* Registration Status */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-6">Registration Status</h2>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[var(--color-text-heading)] font-medium">Allow New Registrations</p>
                <p className="text-sm text-[var(--color-text-muted)]">When disabled, team leaders will see a "Closed" message and cannot register new candidates.</p>
              </div>
              <button 
                onClick={() => setShowConfirmToggleReg(true)}
                className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 \${settings.isRegistrationOpen ? 'bg-green-500' : 'bg-red-500'}\`}
              >
                <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${settings.isRegistrationOpen ? 'translate-x-6' : 'translate-x-1'}\`} />
              </button>
            </div>

            {/* Category Toggles */}
            {settings.isRegistrationOpen && (
              <div className="mb-6 pt-6 border-t border-[var(--color-border)]">
                <p className="text-[var(--color-text-heading)] font-medium mb-4">Category-Wise Registration Status</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['BIDĀYAH', 'ŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ĀLIYAH', 'KULLIYYAH'].map(cat => {
                    const isOpen = settings.categoryRegistrationStatus ? settings.categoryRegistrationStatus[cat] !== false : true;
                    return (
                      <div key={cat} className="flex items-center justify-between bg-[var(--color-surface-elevated)] p-3 rounded-lg border border-[var(--color-border)]">
                        <span className="text-sm font-medium text-[var(--color-text-heading)]">{cat}</span>
                        <button 
                            onClick={() => handleToggleCategory(cat)}
                            style={{ backgroundColor: isOpen ? '#10b981' : '#ef4444', width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer', border: 'none' }}
                          >
                            <span 
                                style={{ 
                                    display: 'inline-block', 
                                    width: '18px', 
                                    height: '18px', 
                                    backgroundColor: 'white', 
                                    borderRadius: '50%', 
                                    position: 'absolute', 
                                    top: '3px', 
                                    left: isOpen ? '23px' : '3px',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                }} 
                            />
                          </button>`;

code = code.replace(searchRegex, replacement);
fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', code);
console.log('Fixed the broken settings page layout and toggle logic');
