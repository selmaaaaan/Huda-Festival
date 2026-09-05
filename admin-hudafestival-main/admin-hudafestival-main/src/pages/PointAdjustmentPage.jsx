import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

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

    const fetchData = async () => {
        try {
            setLoading(true);
            const [adjRes, teamRes, candRes] = await Promise.all([
                api.get('/point-adjustments'),
                api.get('/teams'),
                api.get('/candidates')
            ]);
            setAdjustments(adjRes.data);
            setTeams(teamRes.data);
            setCandidates(candRes.data);
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
                <h1 className="text-2xl font-bold">Point Adjustments</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} /> Add Adjustment
                </button>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 font-semibold text-gray-600">Type</th>
                                <th className="text-left p-4 font-semibold text-gray-600">Applies To</th>
                                <th className="text-left p-4 font-semibold text-gray-600">Target</th>
                                <th className="text-left p-4 font-semibold text-gray-600">Points</th>
                                <th className="text-left p-4 font-semibold text-gray-600">Reason</th>
                                <th className="text-right p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {adjustments.map(adj => (
                                <tr key={adj._id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        {adj.type === 'add' ? (
                                            <span className="flex items-center gap-1 text-green-600"><ArrowUpCircle size={16} /> Add</span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-600"><ArrowDownCircle size={16} /> Deduct</span>
                                        )}
                                    </td>
                                    <td className="p-4 capitalize">{adj.appliesTo}</td>
                                    <td className="p-4">
                                        {adj.appliesTo === 'team' ? adj.team?.name : `${adj.candidate?.name} (${adj.candidate?.admissionNo})`}
                                    </td>
                                    <td className="p-4 font-semibold">{adj.points}</td>
                                    <td className="p-4 text-sm text-gray-600">{adj.reason}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete(adj._id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {adjustments.length === 0 && (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No point adjustments found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">New Point Adjustment</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Applies To</label>
                                <select name="appliesTo" value={formData.appliesTo} onChange={handleChange} className="w-full border rounded p-2">
                                    <option value="team">Team</option>
                                    <option value="candidate">Candidate</option>
                                </select>
                            </div>
                            
                            {formData.appliesTo === 'team' ? (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Team</label>
                                    <select name="teamId" value={formData.teamId} onChange={handleChange} required className="w-full border rounded p-2">
                                        <option value="">-- Select Team --</option>
                                        {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Candidate</label>
                                    <select name="candidateId" value={formData.candidateId} onChange={handleChange} required className="w-full border rounded p-2">
                                        <option value="">-- Select Candidate --</option>
                                        {candidates.map(c => <option key={c._id} value={c._id}>{c.name} ({c.admissionNo})</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className="w-full border rounded p-2">
                                        <option value="add">Add Points (+)</option>
                                        <option value="deduct">Deduct Points (-)</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Points</label>
                                    <input type="number" name="points" value={formData.points} onChange={handleChange} required min="1" className="w-full border rounded p-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Reason</label>
                                <input type="text" name="reason" value={formData.reason} onChange={handleChange} required className="w-full border rounded p-2" placeholder="e.g. Penalty for late entry" />
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">
                                    {submitting ? 'Saving...' : 'Save Adjustment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PointAdjustmentPage;
