const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

// 1. Add initial state for categoryItemLimits
code = code.replace(
    /categoryTopicRegistrationStatus: \{\n\s*'BIDĀYAH': true, 'ŪLĀ': true, 'THĀNIYAH': true, 'THĀNAWIYYAH': true, 'ĀLIYAH': true, 'KULLIYYAH': true\n\s*\}\n\s*\}\);/,
    `categoryTopicRegistrationStatus: {
        'BIDĀYAH': true, 'ŪLĀ': true, 'THĀNIYAH': true, 'THĀNAWIYYAH': true, 'ĀLIYAH': true, 'KULLIYYAH': true
      },
      categoryItemLimits: {
        'BIDĀYAH': { total: 9, stage: 4, nonStage: 5 },
        'E_ŪLĀ': { total: 9, stage: 4, nonStage: 5 },
        'THĀNIYAH': { total: 9, stage: 4, nonStage: 5 },
        'THĀNAWIYYAH': { total: 11, stage: 5, nonStage: 6 },
        'EĀLIYAH': { total: 9, stage: 4, nonStage: 5 }
      }
    });`
);

// 2. Add handleUpdateCategoryLimits
code = code.replace(
    /const handleToggleTopicCategory = async \(cat\) => \{/,
    `const [savingLimits, setSavingLimits] = useState(false);

  const handleUpdateCategoryLimits = async (cat, field, value) => {
    try {
      const currentLimits = settings.categoryItemLimits || {};
      const newLimits = { 
          ...currentLimits, 
          [cat]: { ...(currentLimits[cat] || { total: 9, stage: 4, nonStage: 5 }), [field]: parseInt(value, 10) || 0 } 
      };
      // Auto update total
      if (field === 'stage' || field === 'nonStage') {
          newLimits[cat].total = newLimits[cat].stage + newLimits[cat].nonStage;
      }
      
      setSettings(s => ({ ...s, categoryItemLimits: newLimits }));
      
      // Save to backend immediately or we can have a save button. Let's just have a save button for all limits.
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAllLimits = async () => {
    try {
      setSavingLimits(true);
      await api.patch('/settings', { categoryItemLimits: settings.categoryItemLimits });
    } catch (err) {
      setError('Failed to save category limits');
    } finally {
      setSavingLimits(false);
    }
  };

  const handleToggleTopicCategory = async (cat) => {`
);

// 3. Add UI Section for Limits
const limitsJSX = `
          {/* Category Limits */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-6">Category-Wise Item Limits (Individual)</h2>
            <div className="space-y-4">
              {['BIDĀYAH', 'E_ŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'EĀLIYAH'].map(cat => {
                const limits = settings.categoryItemLimits ? settings.categoryItemLimits[cat] : { total: 9, stage: 4, nonStage: 5 };
                return (
                  <div key={cat} className="flex flex-col md:flex-row items-center gap-4 bg-[var(--color-surface-elevated)] p-4 rounded-lg border border-[var(--color-border)]">
                    <span className="w-full md:w-1/4 text-sm font-medium text-[var(--color-text-heading)]">{cat.replace('E_', '')}</span>
                    <div className="w-full md:w-3/4 flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Stage Items</label>
                            <input 
                                type="number" 
                                value={limits?.stage || 0} 
                                onChange={(e) => handleUpdateCategoryLimits(cat, 'stage', e.target.value)}
                                className="w-full px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text-heading)]"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Non-Stage Items</label>
                            <input 
                                type="number" 
                                value={limits?.nonStage || 0} 
                                onChange={(e) => handleUpdateCategoryLimits(cat, 'nonStage', e.target.value)}
                                className="w-full px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text-heading)]"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Total Limit</label>
                            <input 
                                type="number" 
                                value={limits?.total || 0} 
                                disabled
                                className="w-full px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm opacity-50 cursor-not-allowed text-[var(--color-text-heading)]"
                            />
                        </div>
                    </div>
                  </div>
                )
              })}
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveAllLimits} loading={savingLimits} variant="primary">
                  Save Limits
                </Button>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}`;

code = code.replace(
    /\{\/\* Maintenance Mode \*\//,
    limitsJSX
);

fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', code);
console.log('Added categoryItemLimits to SettingsPage');
