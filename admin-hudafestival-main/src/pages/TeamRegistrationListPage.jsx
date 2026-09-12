import React, { useState, useEffect, useMemo } from 'react';
import { Search, Table2, CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';


const CATEGORIES = ['BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'];
const STAGES = ['All Stages', 'Stage', 'Non-Stage'];

export default function TeamRegistrationListPage() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.role === 'admin';

    // Filters
    const [selectedTeam, setSelectedTeam] = useState(isAdmin ? '' : userInfo.team);
    const [selectedCategory, setSelectedCategory] = useState('BIDĀYAH');
    const [selectedStage, setSelectedStage] = useState('All Stages');
    const [searchQuery, setSearchQuery] = useState('');
    const [showOnlyPending, setShowOnlyPending] = useState(false);

    // Data state
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Grid Data
    const [candidates, setCandidates] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [cellError, setCellError] = useState({ cellId: null, message: '' });
    const [pendingChanges, setPendingChanges] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (isAdmin) {
            api.get('/teams').then(res => setTeams(res.data)).catch(console.error);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!selectedTeam || !selectedCategory) return;
        setPendingChanges({});
        fetchGrid();
    }, [selectedTeam, selectedCategory, selectedStage]);

    const fetchGrid = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/teams/${selectedTeam}/registration-grid`, {
                params: { category: selectedCategory, stageType: selectedStage }
            });
            setCandidates(res.data.candidates || []);
            setProgrammes(res.data.programmes || []);
            setRegistrations(res.data.registrations || []);
        } catch (err) {
            console.error('Failed to fetch grid', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (cand, prog) => {
        const cellId = `${cand._id}-${prog._id}`;
        if (prog.format === 'Group' || prog.type === 'Group') {
            setCellError({ cellId, message: 'Use main Registration Desk for groups' });
            setTimeout(() => setCellError({ cellId: null, message: '' }), 3000);
            return;
        }

        const isCurrentlySaved = registrations.some(r => r.programme?._id === prog._id && r.candidates?.includes(cand._id));
        const isCurrentlyDraft = cellId in pendingChanges;
        const willBeAdded = !isCurrentlySaved && !isCurrentlyDraft;

        if (willBeAdded) {
            // Check Quota before allowing the tick
            const savedCount = registrations.filter(r => r.programme?._id === prog._id).reduce((acc, r) => acc + (r.candidates?.length || 0), 0);
            const draftAddCount = Object.keys(pendingChanges).filter(k => k.endsWith(`-${prog._id}`) && pendingChanges[k] === true).length;
            const draftRemoveCount = Object.keys(pendingChanges).filter(k => k.endsWith(`-${prog._id}`) && pendingChanges[k] === false).length;
            
            const currentCount = savedCount + draftAddCount - draftRemoveCount;
            if (currentCount >= (prog.maxParticipants || 1)) {
                setCellError({ cellId, message: `Quota full (${prog.maxParticipants || 1} max)` });
                setTimeout(() => setCellError({ cellId: null, message: '' }), 3000);
                return;
            }
        }

        setPendingChanges(prev => {
            const next = { ...prev };
            if (cellId in next) {
                // Revert draft
                delete next[cellId];
            } else {
                // Add draft
                next[cellId] = !isCurrentlySaved;
            }
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        try {
            const adds = [];
            const removes = [];

            Object.entries(pendingChanges).forEach(([cellId, isAdding]) => {
                const [candId, progId] = cellId.split('-');
                if (isAdding) {
                    adds.push({ programmeId: progId, teamId: selectedTeam, candidateIds: [candId] });
                } else {
                    const reg = registrations.find(r => r.programme?._id === progId && r.candidates?.includes(candId));
                    if (reg) removes.push(reg._id);
                }
            });

            const removePromises = removes.map(regId => api.delete(`/registrations/${regId}`));
            const addPromises = adds.map(add => api.post('/registrations', add));
            
            await Promise.all([...removePromises, ...addPromises]);
            
            setPendingChanges({});
            await fetchGrid();
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to save some changes.');
            setTimeout(() => setSaveError(''), 5000);
            fetchGrid();
        } finally {
            setSaving(false);
        }
    };

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPending = showOnlyPending ? !c.bylawStatus?.isCompliant : true;
            return matchesSearch && matchesPending;
        });
    }, [candidates, searchQuery, showOnlyPending]);

    const stats = useMemo(() => {
        const total = candidates.length;
        const compliant = candidates.filter(c => c.bylawStatus?.isCompliant).length;
        const pending = total - compliant;
        return { total, compliant, pending };
    }, [candidates]);

    return (
        <div className="p-8 h-full flex flex-col w-full bg-[var(--color-background)]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Registration List</h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Spreadsheet view of team programme compliance and assignments.</p>
                </div>
                {Object.keys(pendingChanges).length > 0 && (
                    <Button variant="primary" onClick={handleSave} loading={saving}>
                        Save Changes ({Object.keys(pendingChanges).length})
                    </Button>
                )}
            </div>

            {saveError && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <span className="font-medium">{saveError}</span>
                </div>
            )}

            {/* Top Bar: Stats & Filters */}
            <div className="flex justify-between items-end gap-6 mb-6">
                <div className="flex gap-4">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 w-40">
                        <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1">Total Students</div>
                        <div className="text-2xl font-bold text-[var(--color-text-heading)]">{stats.total}</div>
                    </div>
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 w-40">
                        <div className="text-[11px] font-bold text-green-600 uppercase mb-1">Compliant</div>
                        <div className="text-2xl font-bold text-[var(--color-text-heading)]">{stats.compliant}</div>
                    </div>
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 w-40">
                        <div className="text-[11px] font-bold text-orange-500 uppercase mb-1">Pending</div>
                        <div className="text-2xl font-bold text-[var(--color-text-heading)]">{stats.pending}</div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    {isAdmin && (
                        <select 
                            value={selectedTeam} 
                            onChange={e => setSelectedTeam(e.target.value)}
                            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm"
                        >
                            <option value="">-- Select Team --</option>
                            {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                    )}
                    <div className="flex gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${selectedCategory === cat ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            {STAGES.map(stage => (
                                <button
                                    key={stage}
                                    onClick={() => setSelectedStage(stage)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${selectedStage === stage ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]'}`}
                                >
                                    {stage}
                                </button>
                            ))}
                        </div>
                        <div className="h-6 w-px bg-[var(--color-border)]"></div>
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input type="checkbox" checked={showOnlyPending} onChange={e => setShowOnlyPending(e.target.checked)} className="accent-[var(--color-primary)]" />
                            Show Pending Only
                        </label>
                        <div className="relative ml-2">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                            <input 
                                type="text"
                                placeholder="Search student..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm w-48 focus:outline-none focus:border-[var(--color-primary)]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
                {!selectedTeam ? (
                    <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)]">Select a team to view grid</div>
                ) : loading ? (
                    <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)]">Loading grid...</div>
                ) : (
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm border-collapse min-w-max">
                            <thead className="bg-[var(--color-surface-elevated)] sticky top-0 z-30 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 border-b border-r border-[var(--color-border)] font-bold text-xs text-[var(--color-text-muted)] uppercase bg-[var(--color-surface-elevated)] sticky left-0 z-40 w-12">#</th>
                                    <th className="px-4 py-3 border-b border-r border-[var(--color-border)] font-bold text-xs text-[var(--color-text-muted)] uppercase bg-[var(--color-surface-elevated)] sticky left-12 z-40 w-24">Ad No</th>
                                    <th className="px-4 py-3 border-b border-r border-[var(--color-border)] font-bold text-xs text-[var(--color-text-muted)] uppercase bg-[var(--color-surface-elevated)] sticky left-36 z-40 w-48">Student Name</th>
                                    <th className="px-4 py-3 border-b border-r border-[var(--color-border)] font-bold text-xs text-[var(--color-text-muted)] uppercase bg-[var(--color-surface-elevated)] sticky left-[21rem] z-40 w-32">Bylaw Status</th>
                                    
                                    {programmes.map(prog => (
                                        <th key={prog._id} className="px-3 py-3 border-b border-r border-[var(--color-border)] text-center min-w-[120px] max-w-[150px]">
                                            <div className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded inline-block mb-1">{prog.code || '—'}</div>
                                            <div className="text-xs font-semibold text-[var(--color-text-heading)] truncate" title={prog.name}>{prog.name}</div>
                                            <div className="text-[10px] text-[var(--color-text-muted)] mt-1">{prog.type}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {filteredCandidates.map((cand, idx) => {
                                    const isCompliant = cand.bylawStatus?.isCompliant;
                                    
                                    return (
                                        <tr key={cand._id} className="hover:bg-[var(--color-surface-elevated)]/30 transition-colors">
                                            <td className="px-4 py-3 border-r border-[var(--color-border)] font-medium text-[var(--color-text-heading)] bg-[var(--color-surface)] sticky left-0 z-20">{idx + 1}</td>
                                            <td className="px-4 py-3 border-r border-[var(--color-border)] font-medium text-[var(--color-text-muted)] bg-[var(--color-surface)] sticky left-12 z-20">{cand.admissionNo}</td>
                                            <td className="px-4 py-3 border-r border-[var(--color-border)] bg-[var(--color-surface)] sticky left-36 z-20">
                                                <div className="font-semibold text-[var(--color-text-heading)] truncate">{cand.name}</div>
                                                <div className="text-[10px] text-[var(--color-text-muted)]">{cand.classLevel || '-'}</div>
                                            </td>
                                            <td className="px-4 py-3 border-r border-[var(--color-border)] bg-[var(--color-surface)] sticky left-[21rem] z-20">
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${isCompliant ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                                    {isCompliant ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                                                    {isCompliant ? 'Compliant' : 'Pending'}
                                                </div>
                                                <div className="text-[9px] text-[var(--color-text-muted)] mt-1 ml-1 text-nowrap">
                                                    S: {cand.bylawStatus?.stageCount} | N: {cand.bylawStatus?.nonStageCount}
                                                </div>
                                            </td>
                                            
                                            {programmes.map(prog => {
                                                const isSaved = registrations.some(r => r.programme?._id === prog._id && r.candidates?.includes(cand._id));
                                                const cellId = `${cand._id}-${prog._id}`;
                                                const hasError = cellError.cellId === cellId;
                                                const hasDraft = cellId in pendingChanges;
                                                const draftState = pendingChanges[cellId];
                                                const isChecked = hasDraft ? draftState : isSaved;

                                                let cellClasses = 'w-full h-full min-h-[50px] flex items-center justify-center transition-colors ';
                                                
                                                if (hasDraft && draftState === true) {
                                                    // Draft Add -> Red
                                                    cellClasses += 'bg-red-50 text-red-500 hover:bg-red-100';
                                                } else if (hasDraft && draftState === false) {
                                                    // Draft Remove -> Shows empty
                                                    cellClasses += 'bg-red-50/30 text-transparent hover:bg-red-50/50';
                                                } else if (isSaved) {
                                                    // Saved -> Green
                                                    cellClasses += 'bg-green-50 text-green-600 hover:bg-green-100';
                                                } else {
                                                    // Empty
                                                    cellClasses += 'text-transparent hover:bg-[var(--color-surface-elevated)]';
                                                }

                                                return (
                                                    <td key={prog._id} className="border-r border-[var(--color-border)] p-0 relative">
                                                        <button 
                                                            onClick={() => handleCellClick(cand, prog)}
                                                            className={cellClasses}
                                                        >
                                                            {isChecked && <CheckCircle size={18} />}
                                                        </button>
                                                        {hasError && (
                                                            <div className="absolute inset-0 bg-red-500/90 text-white text-[10px] font-medium flex items-center justify-center p-1 text-center z-10 leading-tight">
                                                                {cellError.message}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-[var(--color-surface-elevated)] sticky bottom-0 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 border-r border-[var(--color-border)] font-bold text-right text-[var(--color-text-heading)] bg-[var(--color-surface-elevated)] sticky left-0 z-40">
                                        QUOTA SUMMARY
                                    </td>
                                    {programmes.map(prog => {
                                        const { registeredCount, maxAllowed, status } = prog.quotaInfo || {};
                                        const isFull = status === 'FULL';
                                        
                                        return (
                                            <td key={prog._id} className="px-2 py-3 border-r border-t border-[var(--color-border)] text-center">
                                                <div className="text-xs font-bold text-[var(--color-text-heading)] mb-1">
                                                    {registeredCount} / {maxAllowed === Infinity ? '∞' : maxAllowed}
                                                </div>
                                                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block ${isFull ? 'bg-rose-500/10 text-rose-600' : 'bg-green-500/10 text-green-600'}`}>
                                                    {isFull ? 'FULL' : 'OPEN'}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}