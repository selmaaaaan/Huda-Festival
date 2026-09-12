import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';

const PointAdjustmentPage = () => {
    const [adjustments, setAdjustments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        appliesTo: 'team',
        teamId: '',
        candidateId: '',
        type: 'add',
        points: '',
        reason: '',
        remarks: ''
    });

    const [selectedCategory, setSelectedCategory] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const results = await Promise.allSettled([
                api.get('/point-adjustments'),
                api.get('/teams'),
                api.get('/candidates')
            ]);
            
            if (results[0].status === 'fulfilled') setAdjustments(results[0].value.data);
            if (results[1].status === 'fulfilled') setTeams(results[1].value.data);
            if (results[2].status === 'fulfilled') setCandidates(results[2].value.data);

        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/point-adjustments', formData);
            setIsModalOpen(false);
            setFormData({ appliesTo: 'team', teamId: '', candidateId: '', type: 'add', points: '', reason: '', remarks: '' });
            fetchData();
        } catch (err) {
            alert('Failed to save adjustment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this adjustment? This will revert the points.')) return;
        try {
            await api.delete(`/point-adjustments/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete adjustment');
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Point Adjustments</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} /> Add Adjustment
                </Button>
            </div>

            {error && <div className="text-red-400 bg-red-900/20 px-4 py-3 rounded-lg mb-4 text-sm border border-red-800/40">{error}</div>}

            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">Loading...</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)]">
                            <tr>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Type</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Adjusted By</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Applies To</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Target</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Points</th>
                                <th className="text-left p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Reason</th>
                                <th className="text-right p-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {adjustments.map(adj => (
                                <tr key={adj._id} className="hover:bg-[var(--color-surface-elevated)] transition-colors">
                                    <td className="p-4">
                                        {adj.type === 'add' ? (
                                            <span className="flex items-center gap-1.5 text-green-500 font-medium"><ArrowUpCircle size={14} /> Add</span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-red-500 font-medium"><ArrowDownCircle size={14} /> Deduct</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-xs text-[var(--color-text-muted)]">
                                        {adj.adjustedBy?.userName || '—'}
                                    </td>
                                    <td className="p-4 capitalize text-[var(--color-text-body)]">{adj.appliesTo}</td>
                                    <td className="p-4 text-[var(--color-text-heading)]">
                                        {adj.appliesTo === 'team' ? adj.team?.name : `${adj.candidate?.name} (${adj.candidate?.admissionNo})`}
                                    </td>
                                    <td className="p-4 font-semibold text-[var(--color-text-heading)]">{adj.points}</td>
                                    <td className="p-4 text-xs text-[var(--color-text-body)] max-w-[200px] truncate">{adj.reason}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete(adj._id)} className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {adjustments.length === 0 && (
                                <tr><td colSpan="7" className="p-8 text-center text-sm text-[var(--color-text-muted)]">No point adjustments found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Point Adjustment">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Applies To</label>
                        <select name="appliesTo" value={formData.appliesTo} onChange={(e) => {
                            const val = e.target.value;
                            setSelectedCategory('');
                            setFormData(f => ({ ...f, appliesTo: val, teamId: '', candidateId: '' }));
                        }} className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
                            <option value="team">Team</option>
                            <option value="candidate">Candidate</option>
                        </select>
                    </div>
                    
                    {formData.appliesTo === 'team' ? (
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Select Team</label>
                            <select name="teamId" value={formData.teamId} onChange={handleChange} required className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
                                <option value="">-- Select Team --</option>
                                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">This adjustment applies directly to the team's total points.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">1. Select Team</label>
                                <select name="teamId" value={formData.teamId} onChange={(e) => { handleChange(e); setSelectedCategory(''); setFormData(f => ({...f, candidateId: ''})); }} required className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
                                    <option value="">-- Select Team --</option>
                                    {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            
                            {formData.teamId && (
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">2. Select Category</label>
                                    <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setFormData(f => ({...f, candidateId: ''})); }} className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
                                        <option value="">-- Select Category --</option>
                                        {[...new Set(candidates.filter(c => c.team?._id === formData.teamId || c.team === formData.teamId).map(c => c.category))].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {selectedCategory && (
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">3. Select Candidate</label>
                                    <select name="candidateId" value={formData.candidateId} onChange={handleChange} required className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
                                        <option value="">-- Select Candidate --</option>
                                        {candidates.filter(c => (c.team?._id === formData.teamId || c.team === formData.teamId) && c.category === selectedCategory).map(c => (
                                            <option key={c._id} value={c._id}>{c.name} ({c.admissionNo})</option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">This adjustment applies to the candidate AND cascades to their team's total points.</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
                                <option value="add">Add Points (+)</option>
                                <option value="deduct">Deduct Points (-)</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Points</label>
                            <input type="number" name="points" value={formData.points} onChange={handleChange} required min="1" className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Reason</label>
                        <input type="text" name="reason" value={formData.reason} onChange={handleChange} required className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]" placeholder="e.g. Penalty for late entry" />
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-4 pt-2 border-t border-[var(--color-border)]">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" loading={submitting}>Save Adjustment</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PointAdjustmentPage;
