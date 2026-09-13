const fs = require('fs');
let content = fs.readFileSync('src/pages/TeamRegistrationListPage.jsx', 'utf8');

// Add useEffect for beforeunload
if (!content.includes('beforeunload')) {
    const importMatch = content.match(/import React.*?\{.*?useEffect.*?\}.*?;/);
    
    const useEffectString = \
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (Object.keys(pendingChanges).length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [pendingChanges]);
\;

    content = content.replace(/useEffect\(\(\) => \{[\s\S]*?if \(isAdmin\) \{[\s\S]*?\}, \[isAdmin\]\);/, match => useEffectString + '\n    ' + match);
}

// Add UI warning
if (!content.includes('Unsaved Changes')) {
    content = content.replace(/\{saveError && \([\s\S]*?\)\}/, match => match + \\n\n            {Object.keys(pendingChanges).length > 0 && (
                <div className="mb-6 p-4 bg-orange-50 text-orange-800 border border-orange-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} className="text-orange-500" />
                        <div>
                            <h3 className="font-bold">Unsaved Changes!</h3>
                            <p className="text-sm opacity-90">You have {Object.keys(pendingChanges).length} pending change(s). Please click "Save Changes" or your changes will be lost.</p>
                        </div>
                    </div>
                    <Button variant="primary" onClick={handleSave} loading={saving}>
                        Save Now
                    </Button>
                </div>
            )}\);
}

fs.writeFileSync('src/pages/TeamRegistrationListPage.jsx', content);
