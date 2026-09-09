import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { ClipboardList, Users, Plus, Search, CheckCircle, AlertTriangle } from 'lucide-react';

const Preloader = () => {
  const text = "HUDA FESTIVAL 2K26".split("");
  
  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-surface)]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="flex font-bold text-2xl md:text-4xl text-[var(--color-primary)] tracking-widest overflow-hidden">
        {text.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.05,
              ease: [0.2, 0.65, 0.3, 0.9],
            }}
            className="inline-block"
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

export default function TeamLeaderDashboard() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const teamId = userInfo.team?._id || userInfo.team;
  // Use a fallback primary color if team doesn't have one
  const teamColor = userInfo.team?.color || '#4f46e5'; 

  const [programmes, setProgrammes] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ programmeId: '', candidateIds: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

  useEffect(() => {
    // Hide preloader after animation finishes
    const timer = setTimeout(() => setShowPreloader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [progRes, candRes, regRes, settingsRes] = await Promise.all([
          api.get('/programmes'),
          api.get('/candidates'), // no team param, scoped by JWT on the backend
          api.get('/registrations'),
          api.get('/settings').catch(() => ({ data: {} })),
        ]);
        setProgrammes(progRes.data);
        setCandidates(candRes.data);
        const regs = regRes.data?.registrations || regRes.data || [];
        setMyRegistrations(regs);
        if (settingsRes.data && settingsRes.data.isRegistrationOpen !== undefined) {
          setIsRegistrationOpen(settingsRes.data.isRegistrationOpen);
        }
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (teamId) load();
    else setLoading(false);
  }, [teamId]);

  // Poll for settings every 60s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get('/settings');
        if (data && data.isRegistrationOpen !== undefined) {
          setIsRegistrationOpen(data.isRegistrationOpen);
        }
      } catch(e) {}
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const selectedProg = programmes.find(p => p._id === form.programmeId);
  const requiredCandidates = selectedProg?.format === 'Group' ? (selectedProg?.groupSize || 1) : 1;

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.admissionNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [candidates, searchQuery]);

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
    setSuccess(false);
    if (!form.programmeId) { setError('Select a programme'); return; }
    if (form.candidateIds.length !== requiredCandidates) {
      setError(`Select exactly ${requiredCandidates} candidate(s) for this programme`);
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/registrations', {
        programmeId: form.programmeId,
        teamId: teamId,
        candidateIds: form.candidateIds,
      });
      setMyRegistrations(prev => [data, ...prev]);
      setSuccess(true);
      setTimeout(() => {
        setShowForm(false);
        setForm({ programmeId: '', candidateIds: [] });
        setSearchQuery('');
        setSuccess(false);
      }, 1500);
    } catch(e) {
      setError(e.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const openNewRegistration = () => {
    setSuccess(false);
    setError('');
    setForm({ programmeId: '', candidateIds: [] });
    setSearchQuery('');
    setShowForm(true);
  };

  if (loading && !showPreloader) return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="text-[var(--color-text-muted)] animate-pulse">Loading portal...</div>
    </div>
  );

  return (
    <div 
      className="min-h-screen pb-12 transition-colors duration-500 bg-[var(--color-surface)]"
      style={{
        '--color-primary': teamColor,
        '--color-primary-hover': teamColor, 
      }}
    >
      <AnimatePresence>
        {showPreloader && <Preloader />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="p-6 max-w-5xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-heading)]">
              Team Registration Portal
            </h1>
            <p className="text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: teamColor }}
              />
              {userInfo.team?.name || teamId}
            </p>
          </div>
          <Button onClick={openNewRegistration} variant="primary">
            <Plus size={16} /> New Registration
          </Button>
        </div>

        {/* My Registrations */}
        <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[var(--color-surface-elevated)] rounded-lg text-[var(--color-primary)]">
                <ClipboardList size={18} />
              </div>
              <h2 className="text-base font-semibold text-[var(--color-text-heading)]">My Submissions</h2>
            </div>
            <div className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] px-3 py-1 rounded-full border border-[var(--color-border)]">
              {myRegistrations.length} Total
            </div>
          </div>
          
          {myRegistrations.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--color-text-muted)] flex flex-col items-center">
              <ClipboardList size={32} className="opacity-20 mb-3" />
              No registrations submitted yet. Click "New Registration" to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface)]">
                  <tr>
                    {['Programme','Candidates','Submitted','Status','Reason'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {myRegistrations.map(reg => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={reg._id} 
                      className="hover:bg-[var(--color-surface)] transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-[var(--color-text-heading)]">
                        {reg.programme?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">
                        <div className="flex items-center gap-1.5 bg-[var(--color-surface)] px-2 py-1 rounded-md border border-[var(--color-border)] w-fit text-xs">
                          <Users size={12} className="text-[var(--color-primary)]" /> 
                          {reg.candidates?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">
                        {new Date(reg.createdAt).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--color-text-muted)] max-w-xs truncate" title={reg.rejectionReason || ''}>
                        {reg.rejectionReason || '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Registration Form Modal */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Registration">
          <AnimatePresence mode="wait">
            {!isRegistrationOpen ? (
              <motion.div 
                key="closed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 flex flex-col items-center text-center space-y-4"
              >
                <motion.div 
                  className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center"
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <AlertTriangle size={32} />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-text-heading)]">Registration is closed by Fest Admins</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    You cannot submit new candidates at this time.
                  </p>
                </div>
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)} className="mt-4">Close</Button>
              </motion.div>
            ) : success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-text-heading)]">Registration Submitted</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Your candidates have been registered for this programme.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit} 
                className="space-y-5"
              >
                {error && (
                  <div className="text-sm text-red-400 bg-red-900/10 border border-red-800/20 rounded-lg px-4 py-3 flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-1.5">
                    Programme
                  </label>
                  <select 
                    value={form.programmeId} 
                    onChange={e => setForm(f => ({ ...f, programmeId: e.target.value, candidateIds: [] }))}
                    className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                  >
                    <option value="">Select a programme...</option>
                    {programmes.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg flex flex-wrap gap-4"
                  >
                    <div className="flex-1 min-w-[120px]">
                      <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Format</div>
                      <div className="text-sm font-medium text-[var(--color-text-heading)]">{selectedProg.format}</div>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Required</div>
                      <div className="text-sm font-medium text-[var(--color-text-heading)]">{requiredCandidates} candidate(s)</div>
                    </div>
                    {selectedProg.maxParticipants && (
                      <div className="flex-1 min-w-[120px]">
                        <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Max Entries</div>
                        <div className="text-sm font-medium text-[var(--color-text-heading)]">{selectedProg.maxParticipants} per team</div>
                      </div>
                    )}
                  </motion.div>
                )}

                {form.programmeId && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-[var(--color-text-heading)]">
                        Assign Candidates
                      </label>
                      <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        form.candidateIds.length === requiredCandidates 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                      }`}>
                        {form.candidateIds.length} / {requiredCandidates} Selected
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search candidates by name, admission no, or category..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                      />
                    </div>

                    <div className="max-h-56 overflow-y-auto border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
                      {filteredCandidates.length === 0 ? (
                        <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">
                          {candidates.length === 0 ? "No candidates in your team." : "No candidates match your search."}
                        </div>
                      ) : (
                        <div className="divide-y divide-[var(--color-border)]">
                          {filteredCandidates.map(c => {
                            const isSelected = form.candidateIds.includes(c._id);
                            return (
                              <label 
                                key={c._id} 
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                                  isSelected 
                                    ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white' 
                                    : 'hover:bg-[var(--color-surface-elevated)]'
                                }`}
                                style={{
                                  backgroundColor: isSelected ? 'var(--color-primary)' : '',
                                  opacity: isSelected ? 0.9 : 1
                                }}
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isSelected} 
                                  onChange={() => handleCandidateToggle(c._id)}
                                  className="w-4 h-4 rounded border-[var(--color-border)] focus:ring-[var(--color-primary)] focus:ring-offset-[var(--color-surface)]" 
                                />
                                <div className="flex-1">
                                  <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-[var(--color-text-heading)]'}`}>{c.name}</div>
                                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>
                                    {c.admissionNo} <span className="mx-1.5 opacity-50">•</span> {c.category}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                  <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" loading={submitting}>
                    <CheckCircle size={14} className="mr-1" /> Submit Registration
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Modal>
      </motion.div>
    </div>
  );
}
