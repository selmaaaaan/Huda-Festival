const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/CandidatesPage.jsx', 'utf8');

c = c.replace(
    `</Modal>\n    </div>`,
    `</Modal>
      <ConfirmDialog 
        open={!!confirmDeleteId} 
        title="Delete Candidate" 
        message="Are you sure you want to delete this candidate? This action cannot be undone." 
        confirmLabel="Delete" 
        variant="danger"
        onConfirm={executeDelete} 
        onCancel={() => setConfirmDeleteId(null)} 
      />
    </div>`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/CandidatesPage.jsx', c, 'utf8');
console.log('Fixed CandidatesPage modal placement');