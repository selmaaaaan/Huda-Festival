const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

const CATEGORIES = ['BIDĀYAH', 'ŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ĀLIYAH', 'KULLIYYAH'];

// 1. Add state to default Settings
code = code.replace(
    /categoryRegistrationStatus: \{[\s\S]*?\}\n\s*\}\);/,
    `categoryRegistrationStatus: {
        'BIDĀYAH': true, 'ŪLĀ': true, 'THĀNIYAH': true, 'THĀNAWIYYAH': true, 'ĀLIYAH': true, 'KULLIYYAH': true
      },
      categoryTopicRegistrationStatus: {
        'BIDĀYAH': true, 'ŪLĀ': true, 'THĀNIYAH': true, 'THĀNAWIYYAH': true, 'ĀLIYAH': true, 'KULLIYYAH': true
      }
    });`
);

// 2. Add handleToggleTopicCategory
code = code.replace(
    /const handleToggleCategory = async \(cat\) => \{/,
    `const handleToggleTopicCategory = async (cat) => {
    try {
      const currentStatus = settings.categoryTopicRegistrationStatus || {};
      const newStatus = { ...currentStatus, [cat]: !(currentStatus[cat] !== false) };
      await api.patch('/settings', { categoryTopicRegistrationStatus: newStatus });
      setSettings(s => ({ ...s, categoryTopicRegistrationStatus: newStatus }));
    } catch (err) {
      console.error(err);
      setError('Failed to update category topic registration status');
    }
  };

  const handleToggleCategory = async (cat) => {`
);

// 3. Add UI Block for Topic Categories
const topicCategoryJSX = `
            {/* Topic Category Toggles */}
            {settings.topicRegistrationEnabled && (
              <div className="mb-6 pt-6 border-t border-[var(--color-border)]">
                <p className="text-[var(--color-text-heading)] font-medium mb-4">Category-Wise Topic Registration Status</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['BIDĀYAH', 'ŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ĀLIYAH', 'KULLIYYAH'].map(cat => {
                    const isOpen = settings.categoryTopicRegistrationStatus ? settings.categoryTopicRegistrationStatus[cat] !== false : true;
                    return (
                      <div key={cat} className="flex items-center justify-between bg-[var(--color-surface-elevated)] p-3 rounded-lg border border-[var(--color-border)]">
                        <span className="text-sm font-medium text-[var(--color-text-heading)]">{cat}</span>
                        <button 
                            onClick={() => handleToggleTopicCategory(cat)}
                            style={{ backgroundColor: isOpen ? '#10b981' : '#ef4444', width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer', border: 'none' }}
                          >
                            <span 
                                style={{ display: 'inline-block', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isOpen ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} 
                            />
                          </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Maintenance Mode */}`;

code = code.replace(
    /<\/div>\n\s*\{\/\* Maintenance Mode \*\//,
    topicCategoryJSX
);

fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', code);
console.log('Added category-wise topic toggles to SettingsPage');
