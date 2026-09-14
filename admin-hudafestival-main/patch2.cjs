const fs = require('fs');
let txt = fs.readFileSync('src/pages/SettingsPage.jsx', 'utf8');

// 1. Update fetchData
txt = txt.replace(
`          maintenanceMessage: settingsRes.data.maintenanceMessage ?? '',`,
`          maintenanceMessage: settingsRes.data.maintenanceMessage ?? '',
          categoryRegistrationStatus: settingsRes.data.categoryRegistrationStatus || {
              'BIDĀYAH': true, 'ʾŪLĀ': true, 'THĀNIYAH': true, 'THĀNAWIYYAH': true, 'ʿĀLIYAH': true, 'KULLIYYAH': true
          },`
);

// 2. Add toggle handler
const toggleCategoryStr = `
  const handleToggleCategory = async (cat) => {
      const current = settings.categoryRegistrationStatus ? settings.categoryRegistrationStatus[cat] : true;
      const newStatus = !current;
      const newSettings = { ...settings };
      if (!newSettings.categoryRegistrationStatus) newSettings.categoryRegistrationStatus = {};
      newSettings.categoryRegistrationStatus[cat] = newStatus;
      
      try {
          await api.put('/settings', { categoryRegistrationStatus: newSettings.categoryRegistrationStatus });
          setSettings(newSettings);
      } catch (e) {
          console.error(e);
          alert('Failed to update category setting');
      }
  };
`;

txt = txt.replace('const handleToggleTopicRegistration = async () => {', toggleCategoryStr + '\n  const handleToggleTopicRegistration = async () => {');

// 3. Add UI
const uiStr = `        </div>

        {/* Category Toggles */}
        {settings.isRegistrationOpen && (
          <div className="mb-6 mt-6 pt-6 border-t border-[var(--color-border)]">
             <p className="text-[var(--color-text-heading)] font-medium mb-4">Category-Wise Registration Status</p>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'].map(cat => {
                   const isOpen = settings.categoryRegistrationStatus ? settings.categoryRegistrationStatus[cat] !== false : true;
                   return (
                     <div key={cat} className="flex items-center justify-between bg-[var(--color-surface-elevated)] p-3 rounded-lg border border-[var(--color-border)]">
                       <span className="text-sm font-medium text-[var(--color-text-heading)]">{cat}</span>
                       <button 
                         onClick={() => handleToggleCategory(cat)}
                         className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none \${isOpen ? 'bg-green-500' : 'bg-red-500'}\`}
                       >
                         <span className={\`inline-block h-3 w-3 transform rounded-full bg-white transition-transform \${isOpen ? 'translate-x-5' : 'translate-x-1'}\`} />
                       </button>
                     </div>
                   )
                })}
             </div>
          </div>
        )}

        <div className="flex items-center justify-between">`;

txt = txt.replace(`        </div>\n\n        <div className="flex items-center justify-between">`, uiStr);

fs.writeFileSync('src/pages/SettingsPage.jsx', txt);
