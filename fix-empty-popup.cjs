const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

// Add showWarning state
code = code.replace(
    /const \[error, setError\] = useState\(''\);/,
    `const [error, setError] = useState('');\n  const [showWarning, setShowWarning] = useState(false);`
);

// Update handleLoadRegistrations to set showWarning to true when registrations is empty
const loadRegistrationsLogic = `const handleLoadRegistrations = async () => {
    if (!selectedProgramme) return;
    setLoading(true);
    setError('');
    setShuffledList([]);
    try {
      // Fetch only approved registrations
      const res = await api.get(\`/registrations?programme=\${selectedProgramme._id}&status=approved&limit=1000\`);
      if (res.data && (res.data.registrations?.length > 0 || res.data.data?.length > 0)) {
        setRegistrations(res.data.registrations || res.data.data || []);
      } else {
        setRegistrations([]);
        setShowWarning(true);
      }
    } catch (err) {
      setError('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };`;

code = code.replace(
    /const handleLoadRegistrations = async \(\) => \{[\s\S]*?finally \{\n\s*setLoading\(false\);\n\s*\}\n\s*\};/,
    loadRegistrationsLogic
);

// Add the modal JSX just before the final </div> tag of the page
const modalJSX = `
      {/* Warning Popup */}
      {showWarning && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Registration Incomplete</h3>
              <p className="text-sm text-slate-500 mb-6">
                Registration is not complete yet for this programme. No candidates found.
              </p>
              <Button onClick={() => setShowWarning(false)} variant="primary" className="w-full bg-slate-800 hover:bg-slate-700">
                Okay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};`;

code = code.replace(
    /    <\/div>\n  \);\n\};\n\nexport default JurySlipsPage;/,
    modalJSX + '\n\nexport default JurySlipsPage;'
);

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', code);
console.log('Added custom warning popup for empty registrations');
