const fs = require('fs');

// 1. SettingsPage.jsx update
let settingsContent = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

// Remove import DataImportSection
settingsContent = settingsContent.replace(/import DataImportSection from '\.\.\/components\/DataImportSection';\r?\n/, '');

// Remove <DataImportSection />
settingsContent = settingsContent.replace(/\s*<DataImportSection \/>\r?\n/, '\n');

// Remove handleAddVenue and handleDeleteVenue and venueForm
const handleAddVenueRegex = /const \[venueForm, setVenueForm\].*?const handleDeleteVenue.*?\}\s*;\s*\r?\n/s;
settingsContent = settingsContent.replace(handleAddVenueRegex, '');

// Remove the Venues Section HTML block
const venuesHtmlRegex = /\{\/\* Venues Section \*\/\}.*?col-span-1 lg:col-span-2">.*?<\/div>\s*<\/div>\s*<\/div>\r?\n/s;
settingsContent = settingsContent.replace(venuesHtmlRegex, '');

fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', settingsContent);


// 2. SchedulePage.jsx update
let scheduleContent = fs.readFileSync('admin-hudafestival-main/src/pages/SchedulePage.jsx', 'utf8');

const venueHandlers = `
  const [venueForm, setVenueForm] = useState('');
  
  const handleAddVenue = async () => {
    if(!venueForm.trim()) return;
    try {
        const newVenues = [...(venuesList || []), venueForm.trim()];
        await api.patch('/settings', { venues: newVenues });
        setVenuesList(newVenues);
        setVenueForm('');
    } catch(err) {
        setError('Failed to add venue');
    }
  };

  const handleDeleteVenue = async (venueToDelete) => {
    if(!window.confirm(\`Delete venue "\${venueToDelete}"?\`)) return;
    try {
        const newVenues = (venuesList || []).filter(v => v !== venueToDelete);
        await api.patch('/settings', { venues: newVenues });
        setVenuesList(newVenues);
    } catch(err) {
        setError('Failed to delete venue');
    }
  };
`;

const venueUi = `
      {/* Venues Management Section */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-elevated)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">Venues</h2>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={venueForm} 
              onChange={e => setVenueForm(e.target.value)}
              placeholder="New Venue Name"
              className="px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddVenue(); }}
            />
            <Button onClick={handleAddVenue} variant="primary" className="py-1 px-3 text-sm">
              Add
            </Button>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(!venuesList || venuesList.length === 0) ? (
            <div className="text-sm text-[var(--color-text-muted)] text-center py-4 col-span-full">No venues found.</div>
          ) : (
            venuesList.map(v => (
              <div key={v} className="flex items-center justify-between p-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                <div className="font-medium text-[var(--color-text-heading)]">{v}</div>
                <button onClick={() => handleDeleteVenue(v)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
`;

// Insert handlers before useEffect
scheduleContent = scheduleContent.replace('useEffect(() => {', venueHandlers + '\n  useEffect(() => {');

// Insert UI before the last closing div
const lastDivIndex = scheduleContent.lastIndexOf('</div>');
scheduleContent = scheduleContent.substring(0, lastDivIndex) + venueUi + scheduleContent.substring(lastDivIndex);

fs.writeFileSync('admin-hudafestival-main/src/pages/SchedulePage.jsx', scheduleContent);
console.log('Done');
