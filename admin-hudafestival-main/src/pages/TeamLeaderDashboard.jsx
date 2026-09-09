import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { ClipboardList, Users, Plus, Search, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';

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
  const teamColor = userInfo.team?.color || '#4f46e5'; 

  const [activeTab, setActiveTab] = useState('registrations');
  const [programmes, setProgrammes] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  
  const [topicEnabledProgrammes, setTopicEnabledProgrammes] = useState([]);
  const [myTopics, setMyTopics] = useState([]);
  const [otherTopics, setOtherTopics] = useState({}); // programmeId -> topics array
  
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [form, setForm] = useState({ programmeId: '', candidateIds: [] });
  const [topicForm, setTopicForm] = useState({ programmeId: '', candidateId: '', topic: '' });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowPreloader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const loadData = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const [progRes, candRes, regRes, settingsRes, topicProgRes, myTopicRes] = await Promise.all([
        api.get('/programmes'),
        api.get('/candidates'), 
        api.get('/registrations'),
        api.get('/settings').catch(() => ({ data: {} })),
        api.get('/topic-registrations/enabled-programmes'),
        api.get('/topic-registrations/my-submissions')
      ]);
      setProgrammes(progRes.data);
      if(!isPoll) setCandidates(candRes.data);
      const regs = regRes.data?.registrations || regRes.data || [];
      setMyRegistrations(regs);
      if (settingsRes.data && settingsRes.data.isRegistrationOpen !== undefined) {
        setIsRegistrationOpen(settingsRes.data.isRegistrationOpen);
      }
      setTopicEnabledProgrammes(topicProgRes.data);
      setMyTopics(myTopicRes.data);
      setLastUpdated(0);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (teamId) loadData();
    else setLoading(false);
  }, [teamId]);

  // Polling every 30s
  useEffect(() => {
    const dataInterval = setInterval(() => {
      if(teamId) loadData(true);
    }, 30000);
    const timeInterval = setInterval(() => {
      setLastUpdated(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(timeInterval);
    };
  }, [teamId]);

  const loadOtherTopics = async (progId) => {
    try {
      const { data } = await api.get(`/topic-registrations/programme/${progId}`);
      setOtherTopics(prev => ({ ...prev, [progId]: data }));
    } catch (e) {}
  };

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

  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!topicForm.programmeId || !topicForm.topic) { setError('Please fill all fields'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/topic-registrations', {
        programmeId: topicForm.programmeId,
        teamId: teamId,
        candidateId: topicForm.candidateId || undefined,
        topic: topicForm.topic
      });
      setMyTopics(prev => [data, ...prev]);
      setSuccess(true);
      setTimeout(() => {
        setShowTopicForm(false);
        setTopicForm({ programmeId: '', candidateId: '', topic: '' });
        setSuccess(false);
      }, 1500);
    } catch(e) {
      setError(e.response?.data?.message || 'Failed to submit topic');
    } finally { setSubmitting(false); }
  };

  const openNewRegistration = () => {
    if (activeTab === 'topics') {
      setSuccess(false); setError('');
      setTopicForm({ programmeId: '', candidateId: '', topic: '' });
      setShowTopicForm(true);
    } else {
      setSuccess(false); setError('');
      setForm({ programmeId: '', candidateIds: [] });
      setSearchQuery('');
      setShowForm(true);
    }
  };

  if (loading && !showPreloader && !myRegistrations.length) return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="text-[var(--color-text-muted)] animate-pulse">Loading portal...</div>
    </div>
  );

  return (
    <div 
      className="min-h-screen pb-12 transition-colors duration-500 bg-[var(--color-surface)]"
      style={{ '--color-primary': teamColor, '--color-primary-hover': teamColor }}
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-heading)]">
              Team Portal
            </h1>
            <p className="text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: teamColor }} />
              {userInfo.team?.name || teamId}
              <span className="ml-4 text-xs opacity-60">Last updated: {lastUpdated}s ago</span>
            </p>
          </div>
          <Button onClick={openNewRegistration} variant="primary">
            <Plus size={16} /> {activeTab === 'topics' ? 'Submit Topic' : 'New Registration'}
          </Button>
        </div>

        <div className="flex border-b border-[var(--color-border)] gap-6">
          <button 
            className={`pb-3 font-medium transition-colors ${activeTab === 'registrations' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'}`}
            onClick={() => setActiveTab('registrations')}
          >
            Registrations
          </button>
          <button 
            className={`pb-3 font-medium transition-colors ${activeTab === 'topics' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'}`}
            onClick={() => setActiveTab('topics')}
          >
            Topic Registrations
          </button>
        </div>

        {activeTab === 'registrations' && (
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
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {myRegistrations.map(reg => (
                      <motion.tr key={reg._id} className="hover:bg-[var(--color-surface)] transition-colors">
                        <td className="px-6 py-4 font-medium text-[var(--color-text-heading)]">{reg.programme?.name || '—'}</td>
                        <td className="px-6 py-4 text-[var(--color-text-muted)]">
                          <div className="flex items-center gap-1.5 bg-[var(--color-surface)] px-2 py-1 rounded-md border border-[var(--color-border)] w-fit text-xs">
                            <Users size={12} className="text-[var(--color-primary)]" /> 
                            {reg.candidates?.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[var(--color-text-muted)]">
                          {new Date(reg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={reg.status} /></td>
                        <td className="px-6 py-4 text-xs text-[var(--color-text-muted)] max-w-xs truncate">{reg.rejectionReason || '—'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[var(--color-surface-elevated)] rounded-lg text-[var(--color-primary)]">
                  <MessageSquare size={18} />
                </div>
                <h2 className="text-base font-semibold text-[var(--color-text-heading)]">My Topics</h2>
              </div>
              <div className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                {myTopics.length} Total
              </div>
            </div>
            
            {myTopics.length === 0 ? (
              <div className="p-12 text-center text-sm text-[var(--color-text-muted)] flex flex-col items-center">
                <MessageSquare size={32} className="opacity-20 mb-3" />
                No topics submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-surface)]">
                    <tr>
                      {['Programme','Candidate','Topic','Status','Review Note'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {myTopics.map(reg => (
                      <motion.tr key={reg._id} className="hover:bg-[var(--color-surface)] transition-colors">
                        <td className="px-6 py-4 font-medium text-[var(--color-text-heading)]">{reg.programme?.name || '—'}</td>
                        <td className="px-6 py-4 text-[var(--color-text-muted)]">{reg.candidate?.name || '—'}</td>
                        <td className="px-6 py-4 text-[var(--color-primary)] font-medium">{reg.topic}</td>
                        <td className="px-6 py-4"><StatusBadge status={reg.status} /></td>
                        <td className="px-6 py-4 text-xs text-[var(--color-text-muted)] max-w-xs truncate">{reg.reviewNote || '—'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
                  <h3 className="text-lg font-bold text-[var(--color-text-heading)]">Registration is closed</h3>
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
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="text-sm text-red-400 bg-red-900/10 border border-red-800/20 rounded-lg px-4 py-3 flex items-start gap-2">⚠️ {error}</div>}
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Programme</label>
                  <select 
                    value={form.programmeId} 
                    onChange={e => setForm(f => ({ ...f, programmeId: e.target.value, candidateIds: [] }))}
                    className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm"
                  >
                    <option value="">Select a programme...</option>
                    {programmes.map(p => <option key={p._id} value={p._id}>{p.name} ({p.category})</option>)}
                  </select>
                </div>

                {selectedProg && (
                  <div className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg flex gap-4">
                    <div className="flex-1">
                      <div className="text-xs uppercase opacity-70">Format</div>
                      <div className="text-sm font-medium">{selectedProg.format}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs uppercase opacity-70">Required</div>
                      <div className="text-sm font-medium">{requiredCandidates} candidate(s)</div>
                    </div>
                  </div>
                )}

                {form.programmeId && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Assign Candidates</label>
                      <div className="text-xs font-semibold px-2 py-1 bg-opacity-10 rounded-full">{form.candidateIds.length} / {requiredCandidates} Selected</div>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search candidates..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-[var(--color-surface)] border-[var(--color-border)]"
                    />
                    <div className="max-h-56 overflow-y-auto border rounded-lg bg-[var(--color-surface)] border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                      {filteredCandidates.map(c => {
                        const isSelected = form.candidateIds.includes(c._id);
                        return (
                          <label key={c._id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${isSelected ? 'bg-[var(--color-primary)] text-white' : ''}`}>
                            <input type="checkbox" checked={isSelected} onChange={() => handleCandidateToggle(c._id)} className="w-4 h-4 rounded" />
                            <div>
                              <div className="text-sm font-medium">{c.name}</div>
                              <div className="text-xs opacity-70">{c.admissionNo} • {c.category}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" loading={submitting}>Submit Registration</Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Modal>

        <Modal isOpen={showTopicForm} onClose={() => setShowTopicForm(false)} title="Submit Topic">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" className="py-12 flex flex-col items-center text-center space-y-4">
                <CheckCircle size={32} className="text-green-500" />
                <h3 className="text-lg font-bold">Topic Submitted</h3>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleTopicSubmit} className="space-y-5">
                {error && <div className="text-sm text-red-400 p-3 bg-red-900/10 rounded-lg">⚠️ {error}</div>}
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Programme</label>
                  <select 
                    value={topicForm.programmeId} 
                    onChange={e => {
                      setTopicForm(f => ({ ...f, programmeId: e.target.value, topic: '' }));
                      if(e.target.value) loadOtherTopics(e.target.value);
                    }}
                    className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm"
                  >
                    <option value="">Select a programme...</option>
                    {topicEnabledProgrammes.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>

                {topicForm.programmeId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Topic</label>
                      {topicEnabledProgrammes.find(p => p._id === topicForm.programmeId)?.topicMode === 'fixed-list' ? (
                        <select
                          value={topicForm.topic}
                          onChange={e => setTopicForm(f => ({ ...f, topic: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm"
                        >
                          <option value="">Select a topic...</option>
                          {topicEnabledProgrammes.find(p => p._id === topicForm.programmeId)?.topicList?.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={topicForm.topic}
                          onChange={e => setTopicForm(f => ({ ...f, topic: e.target.value }))}
                          placeholder="Enter your topic"
                          className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm"
                        />
                      )}
                    </div>
                    
                    {/* Read-only list of other teams' topics */}
                    {otherTopics[topicForm.programmeId]?.length > 0 && (
                      <div className="mt-4 p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-elevated)]">
                        <h4 className="text-xs font-semibold mb-2 uppercase text-[var(--color-text-muted)]">Already Submitted Topics</h4>
                        <ul className="space-y-1">
                          {otherTopics[topicForm.programmeId].map(t => (
                            <li key={t._id} className="text-sm flex gap-2">
                              <span className="opacity-50">{t.team?.name}:</span> 
                              <span className={t.status === 'approved' ? 'text-green-500 font-medium' : ''}>{t.topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                  <Button variant="ghost" type="button" onClick={() => setShowTopicForm(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" loading={submitting}>Submit Topic</Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Modal>
      </motion.div>
    </div>
  );
}
