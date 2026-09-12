import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trophy, Download, Calendar, MapPin, Users, CheckCircle, Save, XCircle, AlertTriangle, Edit2 } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';

const CATEGORIES = ['All', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'];
const STAGES = ['All Stages', 'Stage', 'Non-Stage'];

export default function ResultsPage() {
    // Left panel filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStage, setSelectedStage] = useState('All Stages');

    // Data state
    const [programmes, setProgrammes] = useState([]);
    const [bylawRules, setBylawRules] = useState(null);
    const [loading, setLoading] = useState(true);

    // Right panel state
    const [selectedProg, setSelectedProg] = useState(null);
    const [activeTab, setActiveTab] = useState('Results Entry');
    const [progLoading, setProgLoading] = useState(false);

    // Programme specific data
    const [participants, setParticipants] = useState([]);
    const [codeLetters, setCodeLetters] = useState([]); 
    const [resultsMap, setResultsMap] = useState({});
    const [teamsCount, setTeamsCount] = useState(0);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const loadInitial = async () => {
            try {
                const [progRes, rulesRes] = await Promise.all([
                    api.get('/programmes'),
                    api.get('/settings/bylaw-rules')
                ]);
                setProgrammes(progRes.data);
                setBylawRules(rulesRes.data);
            } catch (err) {
                console.error("Error loading data", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitial();
    }, []);

    const loadProgrammeData = async (prog) => {
        if (hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Discard?')) return;
        }
        setProgLoading(true);
        setSelectedProg(prog);
        setHasUnsavedChanges(false);
        setActiveTab('Results Entry');

        try {
            const [resultsRes, regsRes, codesRes] = await Promise.all([
                api.get(`/programmes/${prog._id}/results`),
                api.get(`/registrations?programme=${prog._id}&status=approved`),
                api.get(`/programmes/${prog._id}/code-letters`).catch(() => ({ data: [] }))
            ]);

            // Map approved registrations to flat participants list
            let uniqueTeams = new Set();
            let allCandidates = [];
            const regs = regsRes.data.registrations || regsRes.data || [];
            regs.forEach(reg => {
                uniqueTeams.add(reg.team?._id || reg.team);
                if (reg.candidates) {
                    reg.candidates.forEach(c => {
                        allCandidates.push({ ...c, team: reg.team });
                    });
                }
            });
            setParticipants(allCandidates);
            setTeamsCount(uniqueTeams.size);
            setCodeLetters(codesRes.data);

            // Populate resultsMap
            const initMap = {};
            resultsRes.data.forEach(res => {
                initMap[res.candidate] = {
                    rank: res.rank || '',
                    grade: res.grade || '',
                    remarks: res.remarks || '',
                    status: res.status || 'pending'
                };
            });
            setResultsMap(initMap);
        } catch (err) {
            console.error(err);
        } finally {
            setProgLoading(false);
        }
    };

    const filteredProgrammes = useMemo(() => {
        return programmes.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
            const matchStage = selectedStage === 'All Stages' || p.type === selectedStage;
            return matchSearch && matchCat && matchStage;
        });
    }, [programmes, searchQuery, selectedCategory, selectedStage]);

    // Live Total Points Calculation
    const calculatePoints = (prog, rank, grade) => {
        if (!bylawRules) return 0;
        const tier = prog.pointsTier || 'Individual';
        
        let pRank = 0;
        let pGrade = 0;

        if (rank && bylawRules.POSITION_POINTS[tier] && bylawRules.POSITION_POINTS[tier][rank]) {
            pRank = bylawRules.POSITION_POINTS[tier][rank];
        }
        if (grade && bylawRules.GRADE_POINTS[tier] && bylawRules.GRADE_POINTS[tier][grade]) {
            pGrade = bylawRules.GRADE_POINTS[tier][grade];
        }

        return pRank + pGrade;
    };

    const handleResultChange = (candidateId, field, value) => {
        setResultsMap(prev => ({
            ...prev,
            [candidateId]: {
                ...(prev[candidateId] || { rank: '', grade: '', remarks: '', status: 'draft' }),
                [field]: value,
                status: prev[candidateId]?.status === 'published' ? 'published' : 'draft'
            }
        }));
        setHasUnsavedChanges(true);
    };

    const clearRow = (candidateId) => {
        setResultsMap(prev => {
            const newMap = { ...prev };
            delete newMap[candidateId];
            return newMap;
        });
        setHasUnsavedChanges(true);
    };

    const resetAll = () => {
        if (confirm('Clear all unsaved entries for this programme?')) {
            loadProgrammeData(selectedProg);
        }
    };

    const handleSaveDraft = async () => {
        // Collect dirty rows
        const resultsToSave = participants.map(c => {
            const res = resultsMap[c._id];
            if (!res) return null;
            if (!res.rank && !res.grade && !res.remarks) return null; // empty
            return {
                candidateId: c._id,
                rank: res.rank || null,
                grade: res.grade || null,
                remarks: res.remarks || ''
            };
        }).filter(Boolean);

        if (resultsToSave.length === 0) {
            alert("No results to save.");
            return;
        }

        try {
            await api.post(`/programmes/${selectedProg._id}/results/bulk`, { results: resultsToSave });
            alert("Draft saved successfully!");
            loadProgrammeData(selectedProg); // refresh
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save results');
        }
    };

    const handlePublish = async () => {
        if (!confirm('Are you sure you want to PUBLISH these results? This will lock edits and update team scores.')) return;
        
        // Auto-save first just in case
        await handleSaveDraft();

        try {
            await api.post(`/programmes/${selectedProg._id}/approve`);
            alert("Results published successfully!");
            // Update programme status locally
            setProgrammes(prev => prev.map(p => p._id === selectedProg._id ? { ...p, resultPublished: true } : p));
            loadProgrammeData(selectedProg);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to publish results');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    const totalPointsAwarded = participants.reduce((sum, c) => {
        const r = resultsMap[c._id];
        if (!r) return sum;
        return sum + calculatePoints(selectedProg, r.rank, r.grade);
    }, 0);

    const isPublished = programmes.find(p => p._id === selectedProg?._id)?.resultPublished;

    return (
        <div className="p-8 h-full flex flex-col space-y-6 w-full bg-[var(--color-background)]">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Results</h1>
            </div>

            <div className="flex gap-6 h-[calc(100vh-140px)]">
                {/* ─── LEFT PANEL: PROGRAMMES ────────────────────────────── */}
                <div className="w-[380px] shrink-0 flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-[var(--color-border)] space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-semibold text-[var(--color-text-heading)]">Programmes</h2>
                        </div>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                            <input 
                                type="text"
                                placeholder="Search programmes..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[var(--color-text-heading)]"
                            />
                        </div>
                        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1 whitespace-nowrap rounded-full text-xs font-medium transition-colors border ${selectedCategory === cat ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
                                >
                                    {cat === 'All' ? 'ALL' : cat}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {STAGES.map(stage => (
                                <button
                                    key={stage}
                                    onClick={() => setSelectedStage(stage)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${selectedStage === stage ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
                                >
                                    {stage}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredProgrammes.length === 0 && <div className="text-center text-sm text-[var(--color-text-muted)] mt-6">No matches found.</div>}
                        {filteredProgrammes.map(prog => (
                            <div 
                                key={prog._id}
                                onClick={() => loadProgrammeData(prog)}
                                className={`p-3 rounded-xl cursor-pointer border transition-colors ${selectedProg?._id === prog._id ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30' : 'bg-[var(--color-surface)] border-transparent hover:border-[var(--color-border)]'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-semibold text-sm text-[var(--color-text-heading)] flex items-center gap-2">
                                        <Trophy size={14} className="text-[var(--color-primary)]" />
                                        {prog.name}
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prog.resultPublished ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                                        {prog.resultPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <div className="text-[11px] text-[var(--color-text-muted)] flex justify-between items-center pl-5">
                                    <span>{prog.category} • {prog.type}</span>
                                    <span className="font-medium text-xs">{prog.participantCount || 0} Participants</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── RIGHT PANEL: WORKSPACE ────────────────────────────── */}
                <div className="flex-1 flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
                    {selectedProg ? progLoading ? (
                        <div className="flex-1 flex items-center justify-center">Loading programme details...</div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                                            <Trophy size={24} className="text-[var(--color-primary)]" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-wider mb-1 uppercase">Programme Details</div>
                                            <h2 className="text-2xl font-bold text-[var(--color-text-heading)]">{selectedProg.name}</h2>
                                            <div className="text-sm text-[var(--color-text-muted)] mt-1">Category: {selectedProg.category} <span className="mx-2">|</span> Type: {selectedProg.type}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-sm font-medium">
                                            <div className={`w-2 h-2 rounded-full ${isPublished ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            <span className={isPublished ? 'text-green-600' : 'text-gray-500'}>{isPublished ? 'Published' : 'Draft'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-5 gap-4">
                                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3 shadow-sm">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600"><Users size={20} /></div>
                                        <div>
                                            <div className="text-xl font-bold text-[var(--color-text-heading)] leading-none mb-1">{participants.length}</div>
                                            <div className="text-[11px] text-[var(--color-text-muted)] font-medium">Total Participants</div>
                                        </div>
                                    </div>
                                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3 shadow-sm">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600"><Users size={20} /></div>
                                        <div>
                                            <div className="text-xl font-bold text-[var(--color-text-heading)] leading-none mb-1">{teamsCount}</div>
                                            <div className="text-[11px] text-[var(--color-text-muted)] font-medium">Teams</div>
                                        </div>
                                    </div>
                                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3 shadow-sm">
                                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600"><Trophy size={20} /></div>
                                        <div>
                                            <div className="text-xl font-bold text-[var(--color-text-heading)] leading-none mb-1">{totalPointsAwarded}</div>
                                            <div className="text-[11px] text-[var(--color-text-muted)] font-medium">Total Points</div>
                                        </div>
                                    </div>
                                    {selectedProg.schedule?.date && (
                                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3 shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600"><Calendar size={20} /></div>
                                            <div>
                                                <div className="text-sm font-bold text-[var(--color-text-heading)] leading-none mb-1">{new Date(selectedProg.schedule.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">Event Date</div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedProg.schedule?.venue && (
                                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3 shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600"><MapPin size={20} /></div>
                                            <div>
                                                <div className="text-sm font-bold text-[var(--color-text-heading)] leading-none mb-1">{selectedProg.schedule.venue}</div>
                                                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">Venue</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tabs & Content */}
                            <div className="flex-1 flex flex-col min-h-0 bg-[var(--color-surface)]">
                                <div className="px-6 border-b border-[var(--color-border)] flex justify-between items-center pt-4 bg-[var(--color-surface-elevated)]">
                                    <div className="flex gap-6">
                                        {['Results Entry', 'Participants', 'Statistics', 'Export'].map(tab => (
                                            <button 
                                                key={tab} 
                                                onClick={() => setActiveTab(tab)}
                                                className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'}`}
                                            >
                                                {tab === 'Results Entry' && <Trophy size={16} />}
                                                {tab === 'Participants' && <Users size={16} />}
                                                {tab === 'Statistics' && <Calendar size={16} />}
                                                {tab === 'Export' && <Download size={16} />}
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                    {activeTab === 'Results Entry' && (
                                        <div className="flex items-center gap-3 pb-2">
                                            <Button variant="ghost" className="text-xs font-semibold" onClick={resetAll} disabled={isPublished}><XCircle size={14} className="mr-1.5" /> Reset All</Button>
                                            <Button variant="outline" className="text-xs font-semibold" onClick={handleSaveDraft} disabled={isPublished}><Save size={14} className="mr-1.5" /> Save Draft</Button>
                                            <Button variant="primary" className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 border-none shadow-md shadow-indigo-600/20" onClick={handlePublish} disabled={isPublished}>
                                                <CheckCircle size={14} className="mr-1.5" /> Publish Results
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 overflow-y-auto">
                                    {activeTab === 'Results Entry' && (
                                        codeLetters.length === 0 && participants.length > 0 ? (
                                            <div className="p-16 text-center flex flex-col items-center justify-center h-full">
                                                <div className="w-20 h-20 bg-yellow-500/10 text-yellow-600 rounded-full flex items-center justify-center mb-6">
                                                    <AlertTriangle size={40} />
                                                </div>
                                                <h3 className="text-xl font-bold text-[var(--color-text-heading)]">No Code Letters Assigned</h3>
                                                <p className="text-[var(--color-text-muted)] mt-2 max-w-md">Code letters must be assigned to participants before entering results to maintain blind judging protocols. Please assign them via the Volunteer portal.</p>
                                            </div>
                                        ) : (
                                            <table className="w-full text-left text-sm border-collapse">
                                                <thead className="bg-[var(--color-surface-elevated)] sticky top-0 z-10 shadow-sm border-b border-[var(--color-border)]">
                                                    <tr>
                                                        <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase">#</th>
                                                        <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase">Code</th>
                                                        <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase">Participant / Team</th>
                                                        <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase">Position (1/2/3)</th>
                                                        <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase">Grade</th>
                                                        <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase text-center">Total Points</th>
                                                        <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase">Remarks <span className="text-gray-400 font-normal normal-case ml-1 tracking-normal">(optional)</span></th>
                                                        <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--color-border)]">
                                                    {participants.map((cand, idx) => {
                                                        const res = resultsMap[cand._id] || { rank: '', grade: '', remarks: '' };
                                                        const codeObj = codeLetters.find(cl => cl.candidate?._id === cand._id);
                                                        const codeLetter = codeObj ? codeObj.letter : '—';
                                                        const pts = calculatePoints(selectedProg, res.rank, res.grade);
                                                        
                                                        return (
                                                            <tr key={cand._id} className="hover:bg-[var(--color-surface-elevated)]/30 transition-colors">
                                                                <td className="px-6 py-5 font-bold text-[var(--color-text-heading)]">{idx + 1}</td>
                                                                <td className="px-6 py-5">
                                                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold flex items-center justify-center text-lg shadow-sm">
                                                                        {codeLetter}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    <div className="font-bold text-[var(--color-text-heading)] text-sm mb-1">{cand.name}</div>
                                                                    <div className="text-xs text-[var(--color-text-muted)] font-medium">{cand.team?.name || 'Unknown Team'} • {selectedProg.category}</div>
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    <div className="flex gap-4">
                                                                        {['1', '2', '3'].map(rank => (
                                                                            <label key={rank} className={`flex items-center gap-2 cursor-pointer transition-opacity ${isPublished ? 'opacity-50' : 'hover:opacity-80'}`}>
                                                                                <input type="radio" name={`rank-${cand._id}`} value={rank} checked={res.rank == rank} onChange={() => handleResultChange(cand._id, 'rank', rank)} disabled={isPublished} className="w-4 h-4 accent-[var(--color-primary)]" />
                                                                                <span className="text-sm font-medium text-[var(--color-text-muted)]">{rank === '1' ? 'First' : rank === '2' ? 'Second' : 'Third'}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    <div className="flex gap-5">
                                                                        {['A', 'B', 'C'].map(grade => (
                                                                            <label key={grade} className={`flex items-center gap-2 cursor-pointer transition-opacity ${isPublished ? 'opacity-50' : 'hover:opacity-80'}`}>
                                                                                <input type="radio" name={`grade-${cand._id}`} value={grade} checked={res.grade === grade} onChange={() => handleResultChange(cand._id, 'grade', grade)} disabled={isPublished} className="w-4 h-4 accent-[var(--color-primary)]" />
                                                                                <span className="text-sm font-bold text-[var(--color-text-heading)]">{grade}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-5 text-center">
                                                                    <div className="font-bold text-lg text-[var(--color-text-heading)]">{pts}</div>
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    <input 
                                                                        type="text" 
                                                                        value={res.remarks} 
                                                                        onChange={(e) => handleResultChange(cand._id, 'remarks', e.target.value)} 
                                                                        disabled={isPublished}
                                                                        placeholder="Enter remarks (optional)..." 
                                                                        className="w-full px-4 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-50 transition-shadow"
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-5 text-right">
                                                                    <button onClick={() => clearRow(cand._id)} disabled={isPublished} className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg disabled:opacity-50 transition-colors">
                                                                        <XCircle size={18} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )
                                    )}

                                    {activeTab === 'Participants' && (
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {participants.map((c, i) => (
                                                    <div key={c._id} className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="text-xs font-bold text-[var(--color-text-muted)] tracking-wider">#{i + 1}</div>
                                                            <div className="w-8 h-8 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold flex items-center justify-center text-sm">
                                                                {codeLetters.find(cl => cl.candidate?._id === c._id)?.letter || '-'}
                                                            </div>
                                                        </div>
                                                        <div className="font-bold text-[var(--color-text-heading)] text-base mb-1">{c.name}</div>
                                                        <div className="text-xs font-medium text-[var(--color-text-muted)]">{c.team?.name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Statistics' && (
                                        <div className="p-6">
                                            <div className="flex gap-8">
                                                <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] w-72 shadow-sm">
                                                    <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-6">Grade Distribution</h4>
                                                    <div className="space-y-4">
                                                        {['A', 'B', 'C'].map(g => {
                                                            const count = participants.filter(c => resultsMap[c._id]?.grade === g).length;
                                                            return (
                                                                <div key={g} className="flex justify-between items-center pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                                                                    <span className="font-bold text-[var(--color-text-heading)]">Grade {g}</span>
                                                                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold">{count}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] w-72 shadow-sm">
                                                    <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-6">Positions</h4>
                                                    <div className="space-y-4">
                                                        {['1', '2', '3'].map(r => {
                                                            const count = participants.filter(c => resultsMap[c._id]?.rank == r).length;
                                                            return (
                                                                <div key={r} className="flex justify-between items-center pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                                                                    <span className="font-bold text-[var(--color-text-heading)]">{r === '1' ? 'First' : r === '2' ? 'Second' : 'Third'}</span>
                                                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold">{count}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Export' && (
                                        <div className="p-6 flex flex-col items-center justify-center text-center mt-12">
                                            <div className="w-20 h-20 bg-green-500/10 text-green-600 rounded-3xl flex items-center justify-center mb-6">
                                                <Download size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold text-[var(--color-text-heading)]">Export Results Data</h3>
                                            <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-sm mb-8 leading-relaxed">Download a spreadsheet containing all participants, assigned codes, positions, grades, and awarded points for this programme.</p>
                                            <Button variant="primary" onClick={() => {
                                                const headers = ['#', 'Code', 'Participant', 'Team', 'Category', 'Position', 'Grade', 'Total Points', 'Remarks'];
                                                const rows = participants.map((c, i) => {
                                                    const res = resultsMap[c._id] || {};
                                                    const codeObj = codeLetters.find(cl => cl.candidate?._id === c._id);
                                                    const code = codeObj ? codeObj.letter : '—';
                                                    const pts = calculatePoints(selectedProg, res.rank, res.grade);
                                                    return [
                                                        i + 1,
                                                        code,
                                                        `"${c.name}"`,
                                                        `"${c.team?.name || ''}"`,
                                                        selectedProg.category,
                                                        res.rank || '',
                                                        res.grade || '',
                                                        pts,
                                                        `"${res.remarks || ''}"`
                                                    ].join(',');
                                                });
                                                const csv = [headers.join(','), ...rows].join('\n');
                                                const blob = new Blob([csv], { type: 'text/csv' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${selectedProg.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv`;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                URL.revokeObjectURL(url);
                                            }} className="px-8 py-3 text-sm font-semibold shadow-md shadow-[var(--color-primary)]/20"><Download size={18} className="mr-2" /> Download Spreadsheet (.csv)</Button>
                                        </div>
                                    )}
                                </div>
                                
                                {activeTab === 'Results Entry' && codeLetters.length > 0 && participants.length > 0 && (
                                    <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface-elevated)] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                                        <Button variant="ghost" onClick={resetAll} disabled={isPublished} className="font-semibold text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]">
                                            <XCircle size={16} className="mr-1.5" /> Clear All Unsaved
                                        </Button>
                                        <div className="flex gap-4">
                                            <Button variant="outline" onClick={handleSaveDraft} disabled={isPublished} className="font-semibold text-xs px-5">
                                                <Save size={16} className="mr-1.5" /> Save Draft
                                            </Button>
                                            <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 border-none shadow-md shadow-indigo-600/20 font-semibold text-xs px-6" onClick={handlePublish} disabled={isPublished}>
                                                <CheckCircle size={16} className="mr-1.5" /> Publish Results
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)] text-center">
                            <div className="w-24 h-24 bg-[var(--color-surface-elevated)] rounded-full flex items-center justify-center mb-6">
                                <Trophy size={48} className="opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-text-heading)] mb-2">Select a Programme</h3>
                            <p className="text-sm max-w-sm mx-auto leading-relaxed">Choose a programme from the left panel to manage its results, view participants, and generate export reports.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
