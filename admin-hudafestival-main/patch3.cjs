const fs = require('fs');
let txt = fs.readFileSync('src/pages/RegistrationReviewPage.jsx', 'utf8');

// 1. Add state and handlers
const handlers = `  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectAll = (e, currentFiltered) => {
    if (e.target.checked) {
      setSelectedIds(currentFiltered.map(r => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkApprove = async () => {
    if (!window.confirm(\`Are you sure you want to approve \${selectedIds.length} registrations?\`)) return;
    try {
      await Promise.allSettled(selectedIds.map(id => api.patch(\`/registrations/\${id}/approve\`)));
      setRegistrations(prev => prev.map(r => selectedIds.includes(r._id) ? { ...r, status: 'approved' } : r));
      setSelectedIds([]);
    } catch(e) {
      alert('Error in bulk approval');
    }
  };

  const handleBulkReject = async () => {
    const reason = window.prompt(\`Enter rejection reason for \${selectedIds.length} registrations:\`);
    if (!reason) return;
    try {
      await Promise.allSettled(selectedIds.map(id => api.patch(\`/registrations/\${id}/reject\`, { rejectionReason: reason })));
      setRegistrations(prev => prev.map(r => selectedIds.includes(r._id) ? { ...r, status: 'rejected', rejectionReason: reason } : r));
      setSelectedIds([]);
    } catch(e) {
      alert('Error in bulk rejection');
    }
  };
`;

txt = txt.replace('const loadData = async () => {', handlers + '\n  const loadData = async () => {');

// 2. Add Bulk Actions UI above table
const bulkUi = `          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="bg-[var(--color-surface-elevated)] p-4 rounded-xl border border-[var(--color-border)] flex items-center gap-4">
              <span className="text-sm font-semibold text-[var(--color-text-heading)]">{selectedIds.length} selected</span>
              <Button onClick={handleBulkApprove} variant="primary" className="bg-green-600 hover:bg-green-700 text-white">Approve Selected</Button>
              <Button onClick={handleBulkReject} variant="danger">Reject Selected</Button>
              <button onClick={() => setSelectedIds([])} className="text-sm text-[var(--color-text-muted)] hover:underline ml-auto">Clear Selection</button>
            </div>
          )}

          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">`;

txt = txt.replace('          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">', bulkUi);

// 3. Add Table Header Checkbox
txt = txt.replace(
    `<th className="px-6 py-4">Programme</th>`,
    `<th className="px-6 py-4 w-12"><input type="checkbox" onChange={(e) => handleSelectAll(e, filteredRegistrations)} checked={filteredRegistrations.length > 0 && selectedIds.length === filteredRegistrations.length} className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" /></th>\n                      <th className="px-6 py-4">Programme</th>`
);

// 4. Add Table Row Checkbox
txt = txt.replace(
    `className="hover:bg-[var(--color-surface)] transition-colors">`,
    `className="hover:bg-[var(--color-surface)] transition-colors">\n                        <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(reg._id)} onChange={() => handleSelectOne(reg._id)} className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" /></td>`
);

fs.writeFileSync('src/pages/RegistrationReviewPage.jsx', txt);
