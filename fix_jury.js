const fs = require('fs');

let content = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf-8');

content = content.replace(
  '<h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Participant List</h1>\n        </div>',
  '<h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Participant List</h1>\n          <Button onClick={handleExportAll} variant="secondary" loading={loading}>\n            <FileText size={16} className="mr-2" /> Export All to Sheets\n          </Button>\n        </div>'
);

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', content, 'utf-8');
console.log('Fixed JurySlipsPage');