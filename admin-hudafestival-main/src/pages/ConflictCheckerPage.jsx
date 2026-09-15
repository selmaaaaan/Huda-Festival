import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Users } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';

export default function ConflictCheckerPage() {
    const [programmes, setProgrammes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [prog1, setProg1] = useState('');
    const [prog2, setProg2] = useState('');
    const [search, setSearch] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        api.get('/programmes')
            .then(res => {
                setProgrammes(res.data);
                const cats = [...new Set(res.data.map(p => p.category))].filter(Boolean).sort();
                setCategories(cats);
                if (cats.length > 0) setSelectedCategory(cats[0]);
            })
            .catch(err => console.error('Failed to load programmes', err));
    }, []);

    const handleCheck = async () => {
        if (!prog1 || !prog2) return alert("Please select two programmes.");
        if (prog1 === prog2) return alert("Please select different programmes.");
        
        setLoading(true);
        try {
            const [res1, res2] = await Promise.all([
                api.get(`/registrations?programme=${prog1}&limit=1000`),
                api.get(`/registrations?programme=${prog2}&limit=1000`)
            ]);

            const regs1 = res1.data.registrations || res1.data.data || [];
            const regs2 = res2.data.registrations || res2.data.data || [];

            // Extract unique candidates for each programme
            const mapCandidates = (regs) => {
                const map = new Map();
                regs.forEach(r => {
                    if (r.candidates) {
                        r.candidates.forEach(c => {
                            if (c && c._id) map.set(c._id, { ...c, team: r.team?.name || 'Unknown Team' });
                        });
                    }
                });
                return map;
            };

            const candMap1 = mapCandidates(regs1);
            const candMap2 = mapCandidates(regs2);

            const allCandIds = new Set([...candMap1.keys(), ...candMap2.keys()]);
            const combined = [];

            allCandIds.forEach(id => {
                const inProg1 = candMap1.has(id);
                const inProg2 = candMap2.has(id);
                const data = inProg1 ? candMap1.get(id) : candMap2.get(id);
                combined.push({
                    candidate: data,
                    inProg1,
                    inProg2,
                    conflict: inProg1 && inProg2
                });
            });

            // Sort so conflicts are at the top
            combined.sort((a, b) => {
                if (a.conflict && !b.conflict) return -1;
                if (!a.conflict && b.conflict) return 1;
                return a.candidate.name.localeCompare(b.candidate.name);
            });

            setResults({
                p1Name: programmes.find(p => p._id === prog1)?.name,
                p2Name: programmes.find(p => p._id === prog2)?.name,
                candidates: combined,
                conflictCount: combined.filter(c => c.conflict).length
            });
        } catch (err) {
            console.error(err);
            alert("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    const filteredList = results?.candidates.filter(item => {
        if (!search) return true;
        const q = search.toLowerCase();
        return item.candidate.name.toLowerCase().includes(q) || 
               item.candidate.admissionNo?.toLowerCase().includes(q) ||
               item.candidate.team.toLowerCase().includes(q);
    });

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Conflict Checker</h1>
                    <p className="text-[var(--color-text-muted)] text-sm">Find candidates who are registered in two conflicting programmes.</p>
                </div>
            </div>

                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
                <div className="mb-6 border-b border-[var(--color-border)] pb-6">
                    <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Select Category</label>
                    <select
                        value={selectedCategory}
                        onChange={e => {
                            setSelectedCategory(e.target.value);
                            setProg1('');
                            setProg2('');
                        }}
                        className="w-full md:w-1/3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-body)] outline-none focus:border-[var(--color-primary)]"
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Programme 1</label>
                        <select
                            value={prog1}
                            onChange={e => setProg1(e.target.value)}
                            className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-body)] outline-none focus:border-[var(--color-primary)]"
                        >
                            <option value="">-- Select First Programme --</option>
                            {programmes.filter(p => p.category === selectedCategory).map(p => (
                                <option key={p._id} value={p._id}>[{p.code}] {p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Programme 2</label>
                        <select
                            value={prog2}
                            onChange={e => setProg2(e.target.value)}
                            className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-body)] outline-none focus:border-[var(--color-primary)]"
                        >
                            <option value="">-- Select Second Programme --</option>
                            {programmes.filter(p => p.category === selectedCategory).map(p => (
                                <option key={p._id} value={p._id}>[{p.code}] {p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleCheck} loading={loading} disabled={!prog1 || !prog2} variant="primary" className="px-8">
                        Check Conflicts
                    </Button>
                </div>
            </div>

            {results && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--color-surface-elevated)]">
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${results.conflictCount > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {results.conflictCount} Conflicts Found
                            </div>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
                            <input
                                type="text"
                                placeholder="Search student or AD No..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-primary)] text-[var(--color-text-body)]"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] font-medium">
                                <tr>
                                    <th className="px-6 py-3 border-b border-[var(--color-border)]">Candidate</th>
                                    <th className="px-6 py-3 border-b border-[var(--color-border)]">Team</th>
                                    <th className="px-6 py-3 border-b border-[var(--color-border)] text-center">{results.p1Name}</th>
                                    <th className="px-6 py-3 border-b border-[var(--color-border)] text-center">{results.p2Name}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {filteredList.map(item => {
                                    const c = item.candidate;
                                    return (
                                        <tr key={c._id} className={item.conflict ? 'bg-rose-500/5' : ''}>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[var(--color-text-heading)]">{c.name}</div>
                                                <div className="text-xs text-[var(--color-text-muted)]">AD NO: {c.admissionNo}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-md bg-[var(--color-surface-elevated)] text-[var(--color-text-body)] font-medium text-xs">
                                                    {c.team}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.inProg1 ? (
                                                    <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                                                        ✓
                                                    </span>
                                                ) : <span className="text-[var(--color-border)]">-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.inProg2 ? (
                                                    <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                                                        ✓
                                                    </span>
                                                ) : <span className="text-[var(--color-border)]">-</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredList.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                                            No candidates found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}