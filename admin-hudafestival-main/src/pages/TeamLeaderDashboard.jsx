import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { ClipboardList, Users, Plus } from 'lucide-react';

export default function TeamLeaderDashboard() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const teamId = userInfo.team?._id || userInfo.team;
  const [programmes, setProgrammes] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ programmeId: '', candidateIds: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [progRes, candRes, regRes] = await Promise.all([
          api.get('/programmes'),
          api.get(`/candidates?team=${teamId}`),
          api.get('/registrations'),
        ]);
        setProgrammes(progRes.data);
        setCandidates(candRes.data);
        const regs = regRes.data?.registrations || regRes.data || [];
        setMyRegistrations(regs);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [teamId]);

  const selectedProg = programmes.find(p => p._id === form.programmeId);
  const requiredCandidates = selectedProg?.format === 'Group' ? (selectedProg?.groupSize || 1) : 1;

  const handleCandidateToggle = (id) => {
    setForm(f => {
      const ids = f.candidateIds.includes(id)
        ? f.candidateIds.filter(c => c !== id)
        : [...f.candidateIds, id];
      return { ...f, candidateIds: ids };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.programmeId) { setError('Select a programme'); return; }
    if (form.candidateIds.length !== requiredCandidates) {
      setError(`Select exactly ${requiredCandidates} candidate(s) for this programme`);
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/registrations', {
        programmeId: form.programmeId,
        teamId,
        candidateIds: form.candidateIds,
      });
      setMyRegistrations(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ programmeId: '', candidateIds: [] });
    } catch(e) {
      setError(e.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-[var(--color-text-muted)]">Loading portal...</div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">Team Registration Portal</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Team: {userInfo.team?.name || teamId}</p>
        </div>
        <Button onClick={() => setShowForm(true)} variant="primary">
          <Plus size={14} /> New Registration
        </Button>
      </div>

      {/* My Registrations */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center gap-2">
          <ClipboardList size={14} className="text-[var(--color-text-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--color-text-heading)]">My Submissions</h2>
        </div>
        {myRegistrations.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">No registrations submitted yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-elevated)]">
              <tr>
                {['Programme','Candidates','Submitted','Status','Reason'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase border-b border-[var(--color-border)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myRegistrations.map(reg => (
                <tr key={reg._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                  <td className="px-4 py-3 font-medium">{reg.programme?.name || '—'}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-1"><Users size={12} /> {reg.candidates?.length || 0}</div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{new Date(reg.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={reg.status} /></td>
                  <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{reg.rejectionReason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Registration Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Registration">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Programme</label>
            <select value={form.programmeId} onChange={e => setForm(f => ({ ...f, programmeId: e.target.value, candidateIds: [] }))}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
              <option value="">Select a programme...</option>
              {programmes.map(p => <option key={p._id} value={p._id}>{p.name} ({p.category})</option>)}
            </select>
          </div>

          {selectedProg && (
            <div className="p-3 bg-[var(--color-surface-elevated)] rounded-lg text-xs text-[var(--color-text-muted)] space-y-1">
              <div>Format: <span className="text-[var(--color-text-heading)]">{selectedProg.format}</span></div>
              <div>Required candidates: <span className="text-[var(--color-text-heading)]">{requiredCandidates}</span></div>
              <div>Max entries per team: <span className="text-[var(--color-text-heading)]">{selectedProg.maxParticipants}</span></div>
            </div>
          )}

          {form.programmeId && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                Select {requiredCandidates} Candidate(s) <span className="text-[var(--color-primary)]">{form.candidateIds.length}/{requiredCandidates}</span>
              </label>
              <div className="max-h-48 overflow-y-auto border border-[var(--color-border)] rounded-lg">
                {candidates.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">No candidates in your team.</div>
                ) : candidates.map(c => (
                  <label key={c._id} className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--color-surface-elevated)] cursor-pointer border-b border-[var(--color-border)] last:border-0">
                    <input type="checkbox" checked={form.candidateIds.includes(c._id)} onChange={() => handleCandidateToggle(c._id)}
                      className="rounded" />
                    <div>
                      <div className="text-sm text-[var(--color-text-heading)]">{c.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{c.admissionNo} · {c.category}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Submit Registration</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
