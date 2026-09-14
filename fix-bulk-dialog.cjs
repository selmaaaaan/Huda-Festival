const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/pages/RegistrationReviewPage.jsx', 'utf8');

// 1. Add state variable
txt = txt.replace(
  "const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });",
  "const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });\n  const [bulkDialog, setBulkDialog] = useState({ open: false, action: null, reason: '' });"
);

// 2. Modify handleBulkApprove and handleBulkReject
txt = txt.replace(
  "const handleBulkApprove = async () => {\n    if (!window.confirm(`Are you sure you want to approve ${selectedIds.length} registrations?`)) return;\n    try {",
  "const executeBulkApprove = async () => {\n    try {"
);

txt = txt.replace(
  "const handleBulkReject = async () => {\n    const reason = window.prompt(`Enter rejection reason for ${selectedIds.length} registrations:`);\n    if (!reason) return;\n    try {",
  "const executeBulkReject = async () => {\n    const reason = bulkDialog.reason;\n    try {"
);

txt = txt.replace(
  "alert('Error in bulk approval');\n    }\n  };",
  "alert('Error in bulk approval');\n    } finally {\n      setBulkDialog({ open: false, action: null, reason: '' });\n    }\n  };"
);

txt = txt.replace(
  "alert('Error in bulk rejection');\n    }\n  };",
  "alert('Error in bulk rejection');\n    } finally {\n      setBulkDialog({ open: false, action: null, reason: '' });\n    }\n  };"
);

// 3. Update onClick handlers
txt = txt.replace(
  '<Button onClick={handleBulkApprove} variant="primary" className="bg-green-600 hover:bg-green-700 text-white">Approve Selected</Button>',
  '<Button onClick={() => setBulkDialog({ open: true, action: \'approve\', reason: \'\' })} variant="primary" className="bg-green-600 hover:bg-green-700 text-white">Approve Selected</Button>'
);

txt = txt.replace(
  '<Button onClick={handleBulkReject} variant="danger">Reject Selected</Button>',
  '<Button onClick={() => setBulkDialog({ open: true, action: \'reject\', reason: \'\' })} variant="danger">Reject Selected</Button>'
);

// 4. Inject <ConfirmDialog> for bulk
const bulkDialogJSX = `      <ConfirmDialog
        open={bulkDialog.open}
        title={bulkDialog.action === 'approve' ? "Approve Registrations" : "Reject Registrations"}
        message={bulkDialog.action === 'approve' 
          ? \`Are you sure you want to approve \${selectedIds.length} registrations?\` 
          : \`You are about to reject \${selectedIds.length} registrations. Please provide a reason:\`}
        confirmLabel={bulkDialog.action === 'approve' ? "Approve" : "Reject"}
        variant={bulkDialog.action === 'approve' ? "primary" : "danger"}
        onConfirm={() => {
          if (bulkDialog.action === 'approve') {
            executeBulkApprove();
          } else {
            executeBulkReject();
          }
        }}
        onCancel={() => setBulkDialog({ open: false, action: null, reason: '' })}
      >
        {bulkDialog.action === 'reject' && (
          <input 
            type="text" 
            placeholder="Rejection reason..." 
            value={bulkDialog.reason}
            onChange={(e) => setBulkDialog(prev => ({ ...prev, reason: e.target.value }))}
            className="w-full px-3 py-2 mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-heading)] focus:outline-none focus:border-red-500"
          />
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteDialog.open}`;

txt = txt.replace(
  "      <ConfirmDialog\n        open={deleteDialog.open}",
  bulkDialogJSX
);

fs.writeFileSync('admin-hudafestival-main/src/pages/RegistrationReviewPage.jsx', txt);
