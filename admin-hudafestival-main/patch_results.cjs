const fs = require('fs');
const file = 'src/pages/ResultsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states
const newStates = `
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [programmeSearchResults, setProgrammeSearchResults] = useState([]);
    const [modalSearchText, setModalSearchText] = useState('');
    const [batchId, setBatchId] = useState(null);
    const [registeredCandidates, setRegisteredCandidates] = useState([]);
`;
content = content.replace("const [error, setError] = useState('');", "const [error, setError] = useState('');" + newStates);

// 2. Fetch registered candidates when selectedProgramme changes
const oldEffect = `    useEffect(() => {
        if (selectedProgramme) {
            setLoading(true);
            api.get(\`/programmes/\${selectedProgramme._id}/results\`).then(res => {
                const existingResults = res.data.reduce((acc, result) => {
                    acc[result.candidate] = { rank: result.rank, grade: result.grade, status: result.status };
                    return acc;
                }, {});
                setResultsData(existingResults);
                setInitialResultsData(JSON.parse(JSON.stringify(existingResults)));
            }).catch(() => {
                setError('Failed to load results for selected programme.');
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [selectedProgramme]);`;

const newEffect = `    useEffect(() => {
        if (selectedProgramme) {
            setLoading(true);
            
            Promise.all([
                api.get(\`/programmes/\${selectedProgramme._id}/results\`),
                api.get(\`/registrations?programme=\${selectedProgramme._id}&status=approved\`)
            ]).then(([resultsRes, regsRes]) => {
                // Populate existing results
                const existingResults = resultsRes.data.reduce((acc, result) => {
                    acc[result.candidate] = { rank: result.rank, grade: result.grade, status: result.status };
                    return acc;
                }, {});
                setResultsData(existingResults);
                setInitialResultsData(JSON.parse(JSON.stringify(existingResults)));
                
                // Extract approved candidates
                const regs = regsRes.data.registrations || regsRes.data || [];
                const cands = [];
                regs.forEach(r => {
                    if (r.candidates && r.candidates.length) {
                        r.candidates.forEach(c => {
                            const fullCandidate = candidates.find(cand => cand._id === (c._id || c));
                            if (fullCandidate) cands.push(fullCandidate);
                        });
                    }
                });
                setRegisteredCandidates(cands);
                
            }).catch(() => {
                setError('Failed to load results and registrations for selected programme.');
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setRegisteredCandidates([]);
        }
    }, [selectedProgramme, candidates]);`;

content = content.replace(oldEffect, newEffect);

// 3. Update relevantCandidates
const oldRelevant = `    const relevantCandidates = useMemo(() => {
        if (!selectedProgramme) return [];
        return candidates.filter(c => c.category === selectedProgramme.category);
    }, [selectedProgramme, candidates]);`;

const newRelevant = `    const relevantCandidates = registeredCandidates;`;
content = content.replace(oldRelevant, newRelevant);

// 4. Update handleSave to send batchId
content = content.replace(
    "await api.post(`/programmes/${selectedProgramme._id}/results/bulk`, { results: payload });",
    "await api.post(`/programmes/${selectedProgramme._id}/results/bulk`, { results: payload, batchId });"
);

// 5. Add + Add Result Button
const oldTitle = `<h2 className="text-lg font-bold mb-4 text-[var(--color-text-heading)]">Programmes</h2>`;
const newTitle = `<div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-[var(--color-text-heading)]">Programmes</h2>
                        <Button size="sm" onClick={() => {
                            setModalSearchText('');
                            setProgrammeSearchResults([]);
                            setIsSearchModalOpen(true);
                            setBatchId(Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5));
                        }}>+ Add Result</Button>
                    </div>`;
content = content.replace(oldTitle, newTitle);

// 6. Add search modal effect & UI
const modalUI = `
            {/* Search Modal */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-[var(--color-surface)] w-full max-w-lg rounded-xl shadow-xl flex flex-col overflow-hidden max-h-[80vh]">
                        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface-elevated)]">
                            <h3 className="font-bold text-[var(--color-text-heading)]">Search Programme</h3>
                            <button onClick={() => setIsSearchModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-4 border-b border-[var(--color-border)]">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search by name, code, or category..."
                                className="w-full px-4 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                                value={modalSearchText}
                                onChange={(e) => {
                                    setModalSearchText(e.target.value);
                                    if (e.target.value.length > 1) {
                                        api.get(\`/programmes?search=\${encodeURIComponent(e.target.value)}\`).then(res => setProgrammeSearchResults(res.data)).catch(console.error);
                                    } else {
                                        setProgrammeSearchResults([]);
                                    }
                                }}
                            />
                        </div>
                        <div className="overflow-y-auto p-2">
                            {programmeSearchResults.length === 0 ? (
                                <div className="p-4 text-center text-sm text-[var(--color-text-muted)]">Type to search...</div>
                            ) : (
                                programmeSearchResults.map(p => (
                                    <button
                                        key={p._id}
                                        onClick={() => {
                                            setSelectedProgramme(p);
                                            setIsSearchModalOpen(false);
                                        }}
                                        className="w-full text-left p-3 hover:bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] last:border-0 transition-colors"
                                    >
                                        <div className="font-medium text-[var(--color-text-heading)]">{p.name}</div>
                                        <div className="text-xs text-[var(--color-text-muted)]">{p.code} • {p.category}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
`;

content = content.replace("        </div>\n    );\n};\n\nexport default ResultsPage;", modalUI + "        </div>\n    );\n};\n\nexport default ResultsPage;");

fs.writeFileSync(file, content);
console.log("ResultsPage patched!");
