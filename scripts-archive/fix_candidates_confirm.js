const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/CandidatesPage.jsx', 'utf8');

if (!c.includes("import ConfirmDialog")) {
    c = c.replace(
        `import Button from '../components/Button';`,
        `import Button from '../components/Button';\nimport ConfirmDialog from '../components/ConfirmDialog';`
    );
}

c = c.replace(
    `const [error, setError] = useState('');`,
    `const [error, setError] = useState('');\n  const [confirmDeleteId, setConfirmDeleteId] = useState(null);`
);

c = c.replace(
    `  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try { await api.delete(\`/candidates/\${id}\`); api.get('/candidates').then(res => setCandidates(res.data)); } catch (err) { setError(err.response?.data?.message || 'Failed to delete candidate.'); }
    }
  };`,
    `  const handleDelete = async (id) => {
    setConfirmDeleteId(id);
  };
  
  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    try { 
        await api.delete(\`/candidates/\${confirmDeleteId}\`); 
        api.get('/candidates').then(res => setCandidates(res.data)); 
    } catch (err) { 
        setError(err.response?.data?.message || 'Failed to delete candidate.'); 
    }
    setConfirmDeleteId(null);
  };`
);

c = c.replace(
    `</Layout>`,
    `  <ConfirmDialog 
        open={!!confirmDeleteId} 
        title="Delete Candidate" 
        message="Are you sure you want to delete this candidate?" 
        confirmLabel="Delete" 
        variant="danger"
        onConfirm={executeDelete} 
        onCancel={() => setConfirmDeleteId(null)} 
      />
    </Layout>`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/CandidatesPage.jsx', c, 'utf8');
console.log('Fixed CandidatesPage');