import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import { Clock } from 'lucide-react';

const PendingResultsPage = () => {
  const [pendingProgrammes, setPendingProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingData = async () => {
    try {
      setLoading(true);
      const [progRes, resultsRes] = await Promise.all([api.get('/programmes'), api.get('/results')]);
      const programmesWithPending = new Set(resultsRes.data.filter(r => r.status === 'pending').map(r => r.programme));
      setPendingProgrammes(progRes.data.filter(p => programmesWithPending.has(p._id)));
    } catch { setError('Failed to fetch pending results.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPendingData(); }, []);

  const handleApprove = async (id) => {
    if (window.confirm('Approve and publish these results?')) {
      try { await api.post(`/programmes/${id}/approve`); alert('Results approved!'); fetchPendingData(); }
      catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed.')); }
    }
  };

  const handleDeny = async (id) => {
    if (window.confirm('Deny and delete all pending results for this programme?')) {
      try { await api.delete(`/programmes/${id}/results`); alert('Pending results deleted.'); fetchPendingData(); }
      catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed.')); }
    }
  };

  if (loading) return <p className="p-8 text-[var(--color-text-body)]">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Pending Results</h1>
        <p className="text-sm text-[var(--color-text-body)] mt-1">Approve or deny results awaiting review.</p>
      </div>

      {pendingProgrammes.length > 0 ? (
        <div className="space-y-3">
          {pendingProgrammes.map(prog => (
            <div key={prog._id} className="p-5 bg-white rounded-xl border border-[var(--color-border)] flex justify-between items-center">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-heading)]">{prog.name}</h2>
                <span className="text-xs font-medium text-[var(--color-text-body)] bg-gray-100 px-2.5 py-1 rounded-full">{prog.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDeny(prog._id)}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition">Deny</button>
                <button onClick={() => handleApprove(prog._id)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition">Approve</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Clock} title="No pending results" description="All results have been reviewed." />
      )}
    </div>
  );
};

export default PendingResultsPage;