import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { ClipboardList, Users } from 'lucide-react';

export default function RegistrationReviewPage() {
  const [programmes, setProgrammes] = useState([]);
  const [selectedProg, setSelectedProg] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch programmes
  useEffect(() => {
    api.get('/programmes').then(r => setProgrammes(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Fetch registrations for selected programme
  useEffect(() => {
    if (!selectedProg) return;
    api.get(`/registrations?programme=${selectedProg._id}`).then(r => {
      const regs = r.data?.registrations || r.data || [];
      setRegistrations(regs);
    }).catch(console.error);
  }, [selectedProg]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/registrations/${id}/approve`);
      setRegistrations(prev => prev.map(r => r._id === id ? {...r, status: 'approved'} : r));
    } catch(e) { alert(e.response?.data?.message || 'Failed to approve'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert('Rejection reason is required'); return; }
    setActionLoading(rejectDialog.id);
    try {
      await api.patch(`/registrations/${rejectDialog.id}/reject`, { rejectionReason: rejectReason });
      setRegistrations(prev => prev.map(r => r._id === rejectDialog.id ? {...r, status: 'rejected', rejectionReason: rejectReason} : r));
      setRejectDialog({ open: false, id: null });
      setRejectReason('');
    } catch(e) { alert(e.response?.data?.message || 'Failed to reject'); }
    finally { setActionLoading(null); }
  };

  const pendingCount = (prog) => registrations.filter(r => r.programme === prog._id || r.programme?._id === prog._id).filter(r => r.status === 'pending').length;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Programme list */}
      <div className="w-72 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-[var(--color-text-heading)] flex items-center gap-2">
            <ClipboardList size={16} /> Programmes
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-[var(--color-text-muted)]">Loading...</div>
          ) : programmes.map(prog => (
            <button key={prog._id} onClick={() => setSelectedProg(prog)}
              className={`w-full text-left px-4 py-3 border-b border-[var(--color-border)] transition-colors flex items-center justify-between ${
                selectedProg?._id === prog._id ? 'bg-[var(--color-primary)]/10 border-l-2 border-l-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-elevated)]'
              }`}>
              <div>
                <div className="text-sm font-medium text-[var(--color-text-heading)]">{prog.name}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{prog.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Registration queue */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedProg ? (
          <EmptyState title="Select a Programme" description="Choose a programme from the left to review its registrations" />
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">{selectedProg.name}</h2>
              <p className="text-sm text-[var(--color-text-muted)]">{selectedProg.category} · {selectedProg.format} · Max {selectedProg.maxParticipants} entries</p>
            </div>
            {registrations.length === 0 ? (
              <EmptyState title="No Registrations" description="No registrations submitted for this programme yet" />
            ) : (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-surface-elevated)]">
                    <tr>
                      {['Team','Candidates','Submitted By','Date','Status','Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                        <td className="px-4 py-3 font-medium">{reg.team?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-[var(--color-text-muted)]">
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            {reg.candidates?.length || 0} candidate(s)
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text-muted)]">{reg.submittedBy?.userName || 'N/A'}</td>
                        <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{new Date(reg.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={reg.status} /></td>
                        <td className="px-4 py-3">
                          {reg.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="primary" loading={actionLoading === reg._id} onClick={() => handleApprove(reg._id)}>Approve</Button>
                              <Button size="sm" variant="danger" onClick={() => setRejectDialog({ open: true, id: reg._id })}>Reject</Button>
                            </div>
                          )}
                          {reg.status === 'rejected' && (
                            <span className="text-xs text-[var(--color-text-muted)]">{reg.rejectionReason}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Dialog */}
      <ConfirmDialog
        open={rejectDialog.open}
        title="Reject Registration"
        confirmLabel="Reject"
        variant="danger"
        onConfirm={handleReject}
        onCancel={() => { setRejectDialog({ open: false, id: null }); setRejectReason(''); }}
      >
        <textarea
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="Enter rejection reason (required)"
          rows={3}
          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
        />
      </ConfirmDialog>
    </div>
  );
}
