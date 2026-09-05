import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Search, Save, XCircle, Trash2, Check, RefreshCw } from 'lucide-react';

const rankPointsMap = {
    'Stage': { 1: 5, 2: 3, 3: 1 }, 'Non-Stage': { 1: 5, 2: 3, 3: 1 },
    'Starred': { 1: 7, 2: 5, 3: 3 }, 'Group': { 1: 7, 2: 5, 3: 3 },
    'General': { 1: 10, 2: 7, 3: 5 }, 'Special': { 1: 15, 2: 10, 3: 7 },
};

const ResultsPage = () => {
    const [programmes, setProgrammes] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [settings, setSettings] = useState(null);
    const [selectedProgramme, setSelectedProgramme] = useState(null);
    const [resultsData, setResultsData] = useState({});
    const [initialResultsData, setInitialResultsData] = useState({});
    
    const [programmeSearch, setProgrammeSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [candidateSearch, setCandidateSearch] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const categories = ['ALL', 'BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA'];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [progRes, candRes, setRes] = await Promise.all([
                    api.get('/programmes'),
                    api.get('/candidates'),
                    api.get('/settings')
                ]);
                setProgrammes(progRes.data);
                setCandidates(candRes.data);
                setSettings(setRes.data[0]); // Assuming settings is an array with one element
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
            api.get(`/programmes/${selectedProgramme._id}/results`).then(res => {
                const existingResults = res.data.reduce((acc, result) => {
                    // Only map if pending, if approved it's published. 
                    // Actually, let's load everything so we can see existing results.
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
    }, [selectedProgramme]);

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(resultsData) !== JSON.stringify(initialResultsData);
    }, [resultsData, initialResultsData]);

    const handleResultChange = (candidateId, field, value) => {
        setResultsData(prev => ({
            ...prev,
            [candidateId]: {
                ...prev[candidateId],
                [field]: value
            }
        }));
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
            await api.post(`/programmes/${selectedProgramme._id}/results/bulk`, { results: payload });
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
            // Reload results to reflect approved status
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
        return matchesSearch && matchesCategory;
    });

    const relevantCandidates = useMemo(() => {
        if (!selectedProgramme) return [];
        // Typically candidates are filtered by programme category
        return candidates.filter(c => c.category === selectedProgramme.category);
    }, [selectedProgramme, candidates]);

    const filteredCandidates = relevantCandidates.filter(c => {
        return c.name.toLowerCase().includes(candidateSearch.toLowerCase()) || c.admissionNo?.toLowerCase().includes(candidateSearch.toLowerCase());
    });

    const calculatePointsPreview = (rank, grade) => {
        if (!selectedProgramme) return 0;
        const ptsRank = rank ? (rankPointsMap[selectedProgramme.type]?.[rank] || 0) : 0;
        let ptsGrade = 0;
        if (settings?.gradePoints && grade) {
            ptsGrade = settings.gradePoints[grade] || 0;
        }
        return ptsRank + ptsGrade;
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Left Panel: Programmes */}
            <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Programmes</h2>
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search programmes..." 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={programmeSearch}
                                onChange={e => setProgrammeSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    onClick={() => setCategoryFilter(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredProgrammes.map(prog => (
                        <div 
                            key={prog._id}
                            className={`p-4 border-b cursor-pointer transition ${selectedProgramme?._id === prog._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                            onClick={() => {
                                if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Discard them?')) return;
                                setSelectedProgramme(prog);
                                setCandidateSearch('');
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{prog.name}</h3>
                                    <p className="text-xs text-gray-500">{prog.category} • {prog.type}</p>
                                </div>
                                {prog.isResultPublished && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium flex items-center gap-1">
                                        <Check size={12} /> Published
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredProgrammes.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No programmes found.</div>
                    )}
                </div>
            </div>

            {/* Right Panel: Candidates & Results */}
            <div className="w-2/3 flex flex-col bg-white">
                {selectedProgramme ? (
                    <>
                        {/* Action Bar */}
                        <div className="p-4 border-b border-gray-200 bg-white flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedProgramme.name} Results</h2>
                                    <p className="text-sm text-gray-500">Category: {selectedProgramme.category} | Type: {selectedProgramme.type}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={handleReset}
                                        disabled={!hasUnsavedChanges || saving || publishing}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                                    >
                                        <RefreshCw size={16} /> Reset
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        disabled={!hasUnsavedChanges || saving || publishing || selectedProgramme.isResultPublished}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                                    >
                                        <Save size={16} /> {saving ? 'Saving...' : 'Save Results'}
                                    </button>
                                    <button 
                                        onClick={handlePublish}
                                        disabled={publishing || hasUnsavedChanges || selectedProgramme.isResultPublished}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
                                    >
                                        <Check size={16} /> {publishing ? 'Publishing...' : (selectedProgramme.isResultPublished ? 'Published' : 'Publish Results')}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search candidates..." 
                                        className="w-full pl-9 pr-4 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={candidateSearch}
                                        onChange={e => setCandidateSearch(e.target.value)}
                                    />
                                </div>
                                {hasUnsavedChanges && (
                                    <div className="text-sm text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded flex items-center gap-2">
                                        <AlertCircle size={14} /> Unsaved changes
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notifications */}
                        {error && <div className="bg-red-50 text-red-600 px-4 py-2 text-sm border-b border-red-100">{error}</div>}
                        {successMessage && <div className="bg-green-50 text-green-600 px-4 py-2 text-sm border-b border-green-100">{successMessage}</div>}

                        {/* Table */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Candidate</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Position (1/2/3)</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Grade</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total Points</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCandidates.map(candidate => {
                                        const result = resultsData[candidate._id] || {};
                                        const pts = calculatePointsPreview(result.rank, result.grade);
                                        const isPublished = selectedProgramme.isResultPublished && result.status === 'approved';
                                        
                                        return (
                                            <tr key={candidate._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-gray-800">{candidate.name}</div>
                                                    <div className="text-xs text-gray-500">{candidate.admissionNo} • {candidate.team?.name || 'No Team'}</div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex justify-center gap-3">
                                                        {[1, 2, 3].map(pos => (
                                                            <label key={pos} className="flex items-center gap-1 cursor-pointer">
                                                                <input 
                                                                    type="radio" 
                                                                    name={`rank-${candidate._id}`} 
                                                                    value={pos} 
                                                                    checked={Number(result.rank) === pos}
                                                                    onChange={() => handleResultChange(candidate._id, 'rank', pos)}
                                                                    disabled={isPublished}
                                                                    className="text-blue-600"
                                                                /> {pos}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex justify-center gap-3">
                                                        {['A', 'B', 'C'].map(grade => (
                                                            <label key={grade} className="flex items-center gap-1 cursor-pointer">
                                                                <input 
                                                                    type="radio" 
                                                                    name={`grade-${candidate._id}`} 
                                                                    value={grade} 
                                                                    checked={result.grade === grade}
                                                                    onChange={() => handleResultChange(candidate._id, 'grade', grade)}
                                                                    disabled={isPublished}
                                                                    className="text-blue-600"
                                                                /> {grade}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center font-semibold text-gray-700">
                                                    {pts > 0 ? pts : '-'}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button 
                                                        onClick={() => clearRow(candidate._id)}
                                                        disabled={isPublished}
                                                        className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                                                        title="Clear Result"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredCandidates.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-gray-500">
                                                No candidates match your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Search size={24} className="text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-600">Select a programme</p>
                        <p className="text-sm">Choose a programme from the left panel to enter results</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsPage;