import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Search, Save, XCircle, Check, RefreshCw, AlertCircle } from 'lucide-react';
import ProgrammeSelector from '../components/ProgrammeSelector';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import StatusBadge from '../components/StatusBadge';

const ResultsPage = () => {
    const [programmes, setProgrammes] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [bylawRules, setBylawRules] = useState(null);
    const [selectedProgramme, setSelectedProgramme] = useState(null);
    const [resultsData, setResultsData] = useState({});
    const [initialResultsData, setInitialResultsData] = useState({});
    
    const [programmeSearch, setProgrammeSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [stageFilter, setStageFilter] = useState('ALL');
    const [candidateSearch, setCandidateSearch] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState('');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [programmeSearchResults, setProgrammeSearchResults] = useState([]);
    const [modalSearchText, setModalSearchText] = useState('');
    const [batchId, setBatchId] = useState(Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5));
const [searchCode, setSearchCode] = useState('');
    const [registeredCandidates, setRegisteredCandidates] = useState([]);

    const [successMessage, setSuccessMessage] = useState('');

    const categories = ['ALL', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [progRes, candRes, rulesRes] = await Promise.all([
                    api.get('/programmes'),
                    api.get('/candidates'),
                    api.get('/settings/bylaw-rules')
                ]);
                setProgrammes(progRes.data);
                setCandidates(candRes.data);
                setBylawRules(rulesRes.data);
            } catch (err) {
                setError('Failed to fetch initial data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedProgramme) {
            setLoading(true);
            
            Promise.all([
                api.get(`/programmes/${selectedProgramme._id}/results`),
                api.get(`/registrations?programme=${selectedProgramme._id}&status=approved`)
            ]).then(([resultsRes, regsRes]) => {
                // Populate existing results
                const existingResults = resultsRes.data.reduce((acc, result) => {
                    acc[result.candidate] = { _id: result._id, rank: result.rank, grade: result.grade, status: result.status };
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
    }, [selectedProgramme, candidates]);

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(resultsData) !== JSON.stringify(initialResultsData);
    }, [resultsData, initialResultsData]);

    const [editingRows, setEditingRows] = useState(new Set());

    const handleResultChange = (candidateId, field, value) => {
        setResultsData(prev => ({
            ...prev,
            [candidateId]: {
                ...prev[candidateId],
                [field]: value
            }
        }));
    };

    const handleUpdateRow = async (candidateId) => {
        const data = resultsData[candidateId];
        if (!data || !data._id) return;
        try {
            await api.patch(`/programmes/${selectedProgramme._id}/results/${data._id}`, {
                rank: data.rank ? Number(data.rank) : null,
                grade: data.grade || null
            });
            setSuccessMessage('Result updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            
            setEditingRows(prev => {
                const next = new Set(prev);
                next.delete(candidateId);
                return next;
            });
            // Update initial data to reflect the save
            setInitialResultsData(prev => ({
                ...prev,
                [candidateId]: { ...data }
            }));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update result');
        }
    };

    const clearRow = (candidateId) => {
        setResultsData(prev => {
            const next = { ...prev };
            delete next[candidateId];
            return next;
        });
    };

    const handleReset = () => {
        setResultsData(JSON.parse(JSON.stringify(initialResultsData)));
    };

    const handleSave = async () => {
        if (!selectedProgramme) return;
        setSaving(true);
        const payload = Object.entries(resultsData).map(([candidateId, data]) => ({
            candidateId,
            rank: data.rank ? Number(data.rank) : null,
            grade: data.grade || null
        }));
        try {
            await api.post(`/programmes/${selectedProgramme._id}/results/bulk`, { results: payload, batchId });
            setSuccessMessage('Results saved successfully!');
            setInitialResultsData(JSON.parse(JSON.stringify(resultsData)));
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to save results.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!selectedProgramme) return;
        if (hasUnsavedChanges) {
            alert('Please save your changes before publishing.');
            return;
        }
        if (!window.confirm('Are you sure you want to publish these results? This will update candidate and team points permanently.')) {
            return;
        }
        setPublishing(true);
        try {
            await api.post(`/programmes/${selectedProgramme._id}/approve`);
            setSuccessMessage('Results published successfully!');
            setSelectedProgramme(prev => ({ ...prev, isResultPublished: true }));
            const res = await api.get(`/programmes/${selectedProgramme._id}/results`);
            const existingResults = res.data.reduce((acc, result) => {
                acc[result.candidate] = { rank: result.rank, grade: result.grade, status: result.status };
                return acc;
            }, {});
            setResultsData(existingResults);
            setInitialResultsData(JSON.parse(JSON.stringify(existingResults)));
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to publish results.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setPublishing(false);
        }
    };

    const filteredProgrammes = programmes.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(programmeSearch.toLowerCase()) || p.code?.toLowerCase().includes(programmeSearch.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
        const matchesStage = stageFilter === 'ALL' || p.stageType === stageFilter;
        return matchesSearch && matchesCategory && matchesStage;
    });

    const relevantCandidates = registeredCandidates;

    const filteredCandidates = relevantCandidates.filter(c => {
        return c.name.toLowerCase().includes(candidateSearch.toLowerCase()) || c.admissionNo?.toLowerCase().includes(candidateSearch.toLowerCase());
    });

    const calculatePointsPreview = (rank, grade) => {
        if (!selectedProgramme || !bylawRules) return 0;
        
        let tier = 'individual';
        if (selectedProgramme.category === 'KULLIYYAH') tier = 'kulliyyah';
        else if (selectedProgramme.isStarred) tier = 'starred';
        else if (selectedProgramme.format === 'Group') tier = 'group';

        let gradeTier = (selectedProgramme.isStarred || selectedProgramme.format === 'Group' || selectedProgramme.category === 'KULLIYYAH') ? 'starred' : 'standard';

        const ptsRank = rank ? (bylawRules.POSITION_POINTS[tier]?.[rank] || 0) : 0;
        const ptsGrade = grade ? (bylawRules.GRADE_POINTS[gradeTier]?.[grade] || 0) : 0;
        return ptsRank + ptsGrade;
    };

    return (
        <div className="flex h-full bg-[var(--color-bg)] overflow-hidden">
            {/* Left Panel: Programmes */}
            <div className="w-1/3 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
                <div className="p-4 border-b border-[var(--color-border)]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-[var(--color-text-heading)]">Programmes</h2>
                        <Button size="sm" onClick={() => {
                            setModalSearchText('');
                            setProgrammeSearchResults([]);
                            setIsSearchModalOpen(true);
                            
                        }}>+ Add Result</Button>
                    </div>
                    <div className="flex flex-col gap-3">
                        <SearchInput value={programmeSearch} onChange={setProgrammeSearch} placeholder="Search programmes..." />
                        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'}`}
                                    onClick={() => setCategoryFilter(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar mt-2">
                            {['ALL', 'Stage', 'Non-Stage'].map(stage => (
                                <button
                                    key={stage}
                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${stageFilter === stage ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'}`}
                                    onClick={() => setStageFilter(stage)}
                                >
                                    {stage === 'ALL' ? 'All Stages' : stage}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredProgrammes.map(prog => (
                        <div 
                            key={prog._id}
                            className={`p-4 border-b border-[var(--color-border)] cursor-pointer transition ${selectedProgramme?._id === prog._id ? 'bg-[var(--color-primary)]/10 border-l-2 border-l-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-elevated)] border-l-2 border-l-transparent'}`}
                            onClick={() => {
                                if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Discard them?')) return;
                                setSelectedProgramme(prog);
                                setCandidateSearch('');
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-[var(--color-text-heading)] text-sm">{prog.name}</h3>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{prog.category} • {prog.type}</p>
                                </div>
                                {prog.isResultPublished && (
                                    <StatusBadge status="published" />
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredProgrammes.length === 0 && (
                        <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">No programmes found.</div>
                    )}
                </div>
            </div>

            {/* Right Panel: Candidates & Results */}
            <div className="w-2/3 flex flex-col bg-[var(--color-bg)]">
                {selectedProgramme ? (
                    <>
                        {/* Action Bar */}
                        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--color-text-heading)]">{selectedProgramme.name} Results</h2>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Category: {selectedProgramme.category} | Type: {selectedProgramme.type}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button 
                                        onClick={handleReset}
                                        disabled={!hasUnsavedChanges || saving || publishing}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        <RefreshCw size={14} /> Reset
                                    </Button>
                                    <Button 
                                        onClick={handleSave}
                                        disabled={!hasUnsavedChanges || saving || publishing || selectedProgramme.isResultPublished}
                                        variant="primary"
                                        size="sm"
                                        loading={saving}
                                    >
                                        <Save size={14} /> Save Results
                                    </Button>
                                    <Button 
                                        onClick={handlePublish}
                                        disabled={publishing || hasUnsavedChanges || selectedProgramme.isResultPublished}
                                        className={selectedProgramme.isResultPublished ? 'bg-green-600/20 text-green-500 border-green-600/30' : 'bg-green-600 hover:bg-green-700 text-white border-transparent'}
                                        size="sm"
                                        loading={publishing}
                                    >
                                        <Check size={14} /> {selectedProgramme.isResultPublished ? 'Published' : 'Publish Results'}
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-2">
                                <div className="w-64">
                                    <SearchInput value={candidateSearch} onChange={setCandidateSearch} placeholder="Search candidates..." />
                                </div>
                                {hasUnsavedChanges && (
                                    <div className="text-xs text-amber-500 font-medium bg-amber-900/20 px-2 py-1 rounded border border-amber-800/40 flex items-center gap-1.5">
                                        <AlertCircle size={14} /> Unsaved changes
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notifications */}
                        {error && <div className="bg-red-900/20 text-red-400 px-4 py-2 text-sm border-b border-red-800/40">{error}</div>}
                        {successMessage && <div className="bg-green-900/20 text-green-400 px-4 py-2 text-sm border-b border-green-800/40">{successMessage}</div>}

                        {/* Table */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)]">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Candidate</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Position (1/2/3)</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Grade</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Total Points</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCandidates.map(candidate => {
                                        const result = resultsData[candidate._id] || {};
                                        const pts = calculatePointsPreview(result.rank, result.grade);
                                        const isPublished = selectedProgramme.isResultPublished && result.status === 'approved';
                                        
                                        const isExisting = !!result._id;
                                        const isEditing = editingRows.has(candidate._id) || !isExisting;

                                        return (
                                            <tr key={candidate._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-[var(--color-text-heading)]">{candidate.name}</div>
                                                    <div className="text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center gap-1.5">
                                                        <span>{candidate.admissionNo} •</span>
                                                        {candidate.team && (
                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: candidate.team.color || '#ccc' }} title={candidate.team.name}></span>
                                                        )}
                                                        <span>{candidate.team?.name || 'No Team'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {!isEditing ? (
                                                        <span className="text-[var(--color-text-heading)] font-semibold">{result.rank || '-'}</span>
                                                    ) : (
                                                        <div className="flex justify-center gap-3">
                                                            {[1, 2, 3].map(pos => (
                                                                <label key={pos} className="flex items-center gap-1.5 cursor-pointer text-[var(--color-text-body)]">
                                                                    <input 
                                                                        type="radio" 
                                                                        name={`rank-${candidate._id}`} 
                                                                        value={pos} 
                                                                        checked={Number(result.rank) === pos}
                                                                        onChange={() => handleResultChange(candidate._id, 'rank', pos)}
                                                                        disabled={isPublished}
                                                                        className="text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-border)]"
                                                                    /> <span className="text-xs font-medium">{pos}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {!isEditing ? (
                                                        <span className="text-[var(--color-text-heading)] font-semibold">{result.grade || '-'}</span>
                                                    ) : (
                                                        <div className="flex justify-center gap-3">
                                                            {['A', 'B', 'C'].map(grade => (
                                                                <label key={grade} className="flex items-center gap-1.5 cursor-pointer text-[var(--color-text-body)]">
                                                                    <input 
                                                                        type="radio" 
                                                                        name={`grade-${candidate._id}`} 
                                                                        value={grade} 
                                                                        checked={result.grade === grade}
                                                                        onChange={() => handleResultChange(candidate._id, 'grade', grade)}
                                                                        disabled={isPublished}
                                                                        className="text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-border)]"
                                                                    /> <span className="text-xs font-medium">{grade}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center font-semibold text-[var(--color-text-heading)]">
                                                    {pts > 0 ? pts : '-'}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex justify-center items-center gap-2">
                                                        {!isEditing && (
                                                            <Button 
                                                                size="sm" 
                                                                variant="secondary" 
                                                                onClick={() => {
                                                                    if (isPublished) {
                                                                        alert('This result is published — unpublish its batch first.');
                                                                    } else {
                                                                        setEditingRows(prev => new Set(prev).add(candidate._id));
                                                                    }
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                        )}
                                                        {isEditing && isExisting && (
                                                            <Button 
                                                                size="sm" 
                                                                variant="primary" 
                                                                onClick={() => handleUpdateRow(candidate._id)}
                                                            >
                                                                Update
                                                            </Button>
                                                        )}
                                                        <button 
                                                            onClick={() => clearRow(candidate._id)}
                                                            disabled={isPublished}
                                                            className="text-[var(--color-text-muted)] hover:text-red-400 disabled:opacity-50 transition-colors"
                                                            title="Clear Form"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredCandidates.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                                                No candidates match your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                        <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center">
                            <Search size={24} className="text-[var(--color-text-muted)]" />
                        </div>
                        <p className="text-base font-medium text-[var(--color-text-heading)]">Select a programme</p>
                        <p className="text-sm mt-1">Choose a programme from the left panel to enter results</p>
                    </div>
                )}
            </div>

            
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
                        <div className="p-6">
                            <ProgrammeSelector 
                                programmes={programmes}
                                value={selectedProgramme?._id || ''}
                                onChange={(id) => {
                                    const p = programmes.find(pr => pr._id === id);
                                    if (p) {
                                        setSelectedProgramme(p);
                                        setIsSearchModalOpen(false);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ResultsPage;
