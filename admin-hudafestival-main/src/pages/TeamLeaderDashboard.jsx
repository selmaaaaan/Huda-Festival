import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ProgrammeCodePicker from '../components/ProgrammeCodePicker';
import {
  ClipboardList, Users, Plus, Search, CheckCircle, AlertTriangle,
  MessageSquare, BookOpen, ChevronRight, X, Filter, Edit3, Trash2
} from 'lucide-react';

const CATEGORIES = ['All', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'];

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent }) => (
  <div className="flex flex-col gap-0.5 px-5 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</span>
    <span className="text-2xl font-bold" style={{ color: accent || 'var(--color-text-heading)' }}>{value}</span>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TeamLeaderDashboard() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const teamId = userInfo.team?._id || userInfo.team;
  const teamColor = userInfo.team?.color || '#4f46e5';
  const teamName = userInfo.team?.name || 'Your Team';

  // ── Core State ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('registrations');
  const [programmes, setProgrammes] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [topicEnabledProgrammes, setTopicEnabledProgrammes] = useState([]);
  const [myTopics, setMyTopics] = useState([]);
  const [otherTopics, setOtherTopics] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(0);

  // ── Modal State ─────────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ── Registration Form ───────────────────────────────────────────────────────
  const [form, setForm] = useState({ programmeId: '', candidateIds: [] });
  const [editId, setEditId] = useState(null);
  const [regSearchQuery, setRegSearchQuery] = useState('');

  // ── Topic Form (cascade state) ──────────────────────────────────────────────
  const [topicForm, setTopicForm] = useState({ programmeId: '', candidateId: '', topic: '' });
  const [topicCategory, setTopicCategory] = useState('');

  // ── Table Filters ───────────────────────────────────────────────────────────
  const [regTableSearch, setRegTableSearch] = useState('');
  const [regTableStatus, setRegTableStatus] = useState('all');
  const [regTableCategory, setRegTableCategory] = useState('All');
  const [topicTableSearch, setTopicTableSearch] = useState('');
  const [topicTableStatus, setTopicTableStatus] = useState('all');
  const [topicTableCategory, setTopicTableCategory] = useState('All');

  // ── Data Loading ─────────────────────────────────────────────────────────────
  const loadData = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const [progRes, candRes, regRes, settingsRes, topicProgRes, myTopicRes] = await Promise.all([
        api.get('/programmes'),
        api.get('/candidates'),
        api.get('/registrations'),
        api.get('/settings').catch(() => ({ data: {} })),
        api.get('/topic-registrations/enabled-programmes'),
        api.get('/topic-registrations/my-submissions'),
      ]);
      setProgrammes(progRes.data);
      if (!isPoll) setCandidates(candRes.data);
      setMyRegistrations(regRes.data?.registrations || regRes.data || []);
      if (settingsRes.data?.isRegistrationOpen !== undefined)
        setIsRegistrationOpen(settingsRes.data.isRegistrationOpen);
      setTopicEnabledProgrammes(topicProgRes.data);
      setMyTopics(myTopicRes.data);
      setLastUpdated(0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (teamId) loadData(); else setLoading(false); }, [teamId]);

  // Polling every 30s
  useEffect(() => {
    const dataInterval = setInterval(() => { if (teamId) loadData(true); }, 30000);
    const timeInterval = setInterval(() => setLastUpdated(p => p + 1), 1000);
    return () => { clearInterval(dataInterval); clearInterval(timeInterval); };
  }, [teamId]);

  const loadOtherTopics = async (progId) => {
    try {
      const { data } = await api.get(`/topic-registrations/programme/${progId}`);
      setOtherTopics(prev => ({ ...prev, [progId]: data }));
    } catch (e) {}
  };

  // ── Derived Stats ─────────────────────────────────────────────────────────────
  const approvedCount = useMemo(() => myRegistrations.filter(r => r.status === 'approved').length, [myRegistrations]);
  const pendingCount  = useMemo(() => myRegistrations.filter(r => r.status === 'pending').length, [myRegistrations]);
  const memberCount   = candidates.length;

  // ── Registration Form Logic ───────────────────────────────────────────────────
  const selectedProg = programmes.find(p => p._id === form.programmeId);
  const requiredCandidates = selectedProg?.format === 'Group' ? (selectedProg?.groupSize || 1) : 1;
  
  const alreadyRegisteredCandidateIds = useMemo(() => {
    if (!form.programmeId) return [];
    return myRegistrations
      .filter(r => r.programme?._id === form.programmeId && r._id !== editId && r.status !== 'rejected')
      .flatMap(r => r.candidates.map(c => c._id));
  }, [myRegistrations, form.programmeId, editId]);

  const filteredFormCandidates = useMemo(() => {
    if (!selectedProg) return [];
    return candidates.filter(c => {
      if (selectedProg.category !== 'KULLIYYAH' && c.category !== selectedProg.category) return false;
      if (alreadyRegisteredCandidateIds.includes(c._id)) return false;
      const q = regSearchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) ||
             c.admissionNo?.toLowerCase().includes(q) ||
             c.category?.toLowerCase().includes(q);
    });
  }, [candidates, regSearchQuery, selectedProg, alreadyRegisteredCandidateIds]);

  const handleCandidateToggle = id => {
    setForm(f => {
      const ids = f.candidateIds.includes(id)
        ? f.candidateIds.filter(c => c !== id)
        : [...f.candidateIds, id];
      return { ...f, candidateIds: ids };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!form.programmeId) { setError('Select a programme'); return; }
    if (form.candidateIds.length !== requiredCandidates) {
      setError(`Select exactly ${requiredCandidates} candidate(s) for this programme`); return;
    }
    setSubmitting(true);
    try {
      if (editId) {
        const { data } = await api.patch('/registrations/' + editId, { candidateIds: form.candidateIds });
        setMyRegistrations(prev => prev.map(r => r._id === editId ? data : r));
      } else {
        const { data } = await api.post('/registrations', {
          programmeId: form.programmeId, teamId, candidateIds: form.candidateIds,
        });
        setMyRegistrations(prev => [data, ...prev]);
      }
      setSuccess(true);
      setTimeout(() => {
        setShowForm(false); setForm({ programmeId: '', candidateIds: [] }); setEditId(null);
        setRegSearchQuery(''); setSuccess(false);
      }, 1500);
    } catch (e) { setError(e.response?.data?.message || 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  // ── Topic Form Logic ─────────────────────────────────────────────────────────
  // Only programmes where topicMode isn't 'none'
  const eligibleTopicProgrammes = useMemo(() =>
    topicEnabledProgrammes.filter(p => p.topicMode && p.topicMode !== 'none'),
    [topicEnabledProgrammes]);

  // Categories that actually have eligible programmes
  const topicCategories = useMemo(() => {
    const cats = [...new Set(eligibleTopicProgrammes.map(p => p.category))];
    return cats.sort();
  }, [eligibleTopicProgrammes]);

  // Programmes within the selected category
  const topicProgrammesInCategory = useMemo(() =>
    topicCategory
      ? eligibleTopicProgrammes.filter(p => p.category === topicCategory || p.category === 'KULLIYYAH')
      : [],
    [eligibleTopicProgrammes, topicCategory]);

  const selectedTopicProg = topicEnabledProgrammes.find(p => p._id === topicForm.programmeId);

  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!topicForm.programmeId || !topicForm.topic) { setError('Please fill all fields'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/topic-registrations', {
        programmeId: topicForm.programmeId, teamId,
        candidateId: topicForm.candidateId || undefined,
        topic: topicForm.topic,
      });
      setMyTopics(prev => [data, ...prev]);
      setSuccess(true);
      setTimeout(() => {
        setShowTopicForm(false);
        setTopicForm({ programmeId: '', candidateId: '', topic: '' });
        setTopicCategory('');
        setSuccess(false);
      }, 1500);
    } catch (e) { setError(e.response?.data?.message || 'Failed to submit topic'); }
    finally { setSubmitting(false); }
  };

  const openNewRegistration = () => {
    if (isRegistrationOpen === false) return;
    setSuccess(false); setError('');
    setEditId(null);
    setForm({ programmeId: '', candidateIds: [] });
    setRegSearchQuery('');
    setShowForm(true);
  };

  const openEditRegistration = (reg) => {
    if (isRegistrationOpen === false) return;
    setSuccess(false); setError('');
    setEditId(reg._id);
    setForm({ programmeId: reg.programme._id, candidateIds: reg.candidates.map(c => c._id) });
    setShowForm(true);
  };

  const handleDeleteRegistration = async (regId) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    setSubmitting(true);
    try {
      await api.delete(`/registrations/${regId}`);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete registration');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Table Filter Logic ─────────────────────────────────────────────────────────
  const filteredRegistrations = useMemo(() => {
    return myRegistrations.filter(r => {
      const matchSearch = !regTableSearch ||
        r.programme?.name?.toLowerCase().includes(regTableSearch.toLowerCase());
      const matchStatus = regTableStatus === 'all' || r.status === regTableStatus;
      const matchCat = regTableCategory === 'All' || r.programme?.category === regTableCategory;
      return matchSearch && matchStatus && matchCat;
    });
  }, [myRegistrations, regTableSearch, regTableStatus, regTableCategory]);

  const filteredTopics = useMemo(() => {
    return myTopics.filter(t => {
      const matchSearch = !topicTableSearch ||
        t.programme?.name?.toLowerCase().includes(topicTableSearch.toLowerCase());
      const matchStatus = topicTableStatus === 'all' || t.status === topicTableStatus;
      const matchCat = topicTableCategory === 'All' || t.programme?.category === topicTableCategory;
      return matchSearch && matchStatus && matchCat;
    });
  }, [myTopics, topicTableSearch, topicTableStatus, topicTableCategory]);

  // ── Loading / No-team guard ────────────────────────────────────────────────────
  if (loading && !myRegistrations.length) return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="text-[var(--color-text-muted)] animate-pulse">Loading portal...</div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="min-h-screen pb-16 transition-colors duration-500"
      style={{ background: 'var(--color-bg)', '--color-primary': teamColor, '--color-primary-hover': teamColor }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* ── Branded Header ──────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden border-b border-[var(--color-border)]"
          style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${teamColor} 12%, transparent), transparent)` }}
        >
          {/* decorative accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: teamColor }} />

          <div className="w-full px-6 pt-10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: teamColor }} />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Team Portal
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-[var(--color-text-heading)]">
                Programme<br />
                <span style={{ color: teamColor }}>Registration</span>
              </h1>
              <p className="mt-3 text-[var(--color-text-body)] text-sm max-w-md">
                Submit and track your team's programme registrations and topic applications for Huda Festival.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-heading)]">
                <span className="w-3 h-3 rounded-full shadow" style={{ background: teamColor }} />
                {teamName}
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">
                Updated {lastUpdated}s ago
              </span>
              <Button onClick={openNewRegistration} variant="primary" className="mt-1">
                <Plus size={15} />
                {activeTab === 'topics' ? 'Submit Topic' : 'New Registration'}
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full px-6 space-y-8 mt-8">

          {/* ── Stats Strip ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Team Members"    value={memberCount}                  accent={teamColor} />
            <StatCard label="Total Submitted" value={myRegistrations.length}       />
            <StatCard label="Approved"        value={approvedCount}                accent="#22c55e" />
            <StatCard label="Pending Review"  value={pendingCount}                 accent="#f59e0b" />
          </div>

          {/* ── Hidden Tabs ─────────────────────────────────────────────────────────── */}
          <div className="hidden border-b border-[var(--color-border)] gap-6">
          </div>

          {/* ── Registrations Tab ─────────────────────────────────────────────── */}
          {activeTab === 'registrations' && (
            <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
              {/* Table filter row */}
              <div className="px-5 py-4 border-b border-[var(--color-border)] flex flex-wrap gap-3 items-center bg-[var(--color-surface)]">
                <div className="relative flex-1 min-w-[180px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search by programme…"
                    value={regTableSearch}
                    onChange={e => setRegTableSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-heading)]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Filter size={13} className="text-[var(--color-text-muted)]" />
                  {['all', 'pending', 'approved', 'rejected'].map(s => (
                    <button
                      key={s}
                      onClick={() => setRegTableStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        regTableStatus === s
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'
                      }`}
                    >{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
                  ))}
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-x-auto flex items-center gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setRegTableCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      regTableCategory === cat
                        ? 'bg-[var(--color-primary)] text-white shadow-sm'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] border border-[var(--color-border)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filteredRegistrations.length === 0 ? (
                <div className="p-14 text-center text-sm text-[var(--color-text-muted)] flex flex-col items-center">
                  <ClipboardList size={36} className="opacity-15 mb-3" />
                  {myRegistrations.length === 0
                    ? 'No registrations yet. Click "New Registration" to begin.'
                    : 'No registrations match your filter.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--color-surface)]">
                      <tr>
                        {['Programme', 'Candidates', 'Submitted', 'Status', 'Reason', ''].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {filteredRegistrations.map(reg => (
                        <motion.tr key={reg._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="hover:bg-[var(--color-surface)] transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-[var(--color-text-heading)]">{reg.programme?.name || '—'}</div>
                            <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{reg.programme?.code || ''}</div>
                          </td>
                          <td className="px-6 py-4 text-[var(--color-text-muted)]">
                            <div className="flex items-center gap-1.5 bg-[var(--color-surface)] px-2 py-1 rounded-md border border-[var(--color-border)] w-fit text-xs">
                              <Users size={12} style={{ color: teamColor }} />
                              {reg.candidates?.length || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[var(--color-text-muted)] text-xs">
                            {new Date(reg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4"><StatusBadge status={reg.status} /></td>
                          <td className="px-6 py-4 text-xs text-[var(--color-text-muted)] max-w-xs truncate">{reg.rejectionReason || '—'}</td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            {isRegistrationOpen !== false && reg.status !== 'approved' && (
                              <button onClick={() => openEditRegistration(reg)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-1" title="Edit Registration">
                                <Edit3 size={16} />
                              </button>
                            )}
                            {isRegistrationOpen !== false && (
                              <button onClick={() => handleDeleteRegistration(reg._id)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-1" title="Delete Registration">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Topics Tab ─────────────────────────────────────────────────────── */}
          {activeTab === 'topics' && (
            <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
              {/* Table filter row */}
              <div className="px-5 py-4 border-b border-[var(--color-border)] flex flex-wrap gap-3 items-center bg-[var(--color-surface)]">
                <div className="relative flex-1 min-w-[180px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search by programme…"
                    value={topicTableSearch}
                    onChange={e => setTopicTableSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-heading)]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Filter size={13} className="text-[var(--color-text-muted)]" />
                  {['all', 'pending', 'approved', 'rejected'].map(s => (
                    <button
                      key={s}
                      onClick={() => setTopicTableStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        topicTableStatus === s
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'
                      }`}
                    >{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-x-auto flex items-center gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setTopicTableCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      topicTableCategory === cat
                        ? 'bg-[var(--color-primary)] text-white shadow-sm'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] border border-[var(--color-border)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {filteredTopics.length === 0 ? (
                <div className="p-14 text-center text-sm text-[var(--color-text-muted)] flex flex-col items-center">
                  <BookOpen size={36} className="opacity-15 mb-3" />
                  {myTopics.length === 0
                    ? 'No topic submissions yet. Click "Submit Topic" to begin.'
                    : 'No topics match your filter.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--color-surface)]">
                      <tr>
                        {['Programme', 'Candidate', 'Topic', 'Status', 'Review Note'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {filteredTopics.map(t => (
                        <motion.tr key={t._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="hover:bg-[var(--color-surface)] transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-[var(--color-text-heading)]">{t.programme?.name || '—'}</div>
                            <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{t.programme?.category || ''}</div>
                          </td>
                          <td className="px-6 py-4 text-[var(--color-text-muted)]">{t.candidate?.name || '—'}</td>
                          <td className="px-6 py-4 font-medium" style={{ color: teamColor }}>{t.topic}</td>
                          <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                          <td className="px-6 py-4 text-xs text-[var(--color-text-muted)] max-w-xs truncate">{t.reviewNote || '—'}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          New Registration Modal
      ══════════════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? "Edit Registration" : "New Registration"}>
        <AnimatePresence mode="wait">
          {!isRegistrationOpen ? (
            <motion.div key="closed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 flex flex-col items-center text-center space-y-4">
              <motion.div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
                <AlertTriangle size={32} />
              </motion.div>
              <h3 className="text-lg font-bold text-[var(--color-text-heading)]">Registration is closed</h3>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Close</Button>
            </motion.div>
          ) : success ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text-heading)]">Registration Submitted</h3>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-sm text-red-400 bg-red-900/10 border border-red-800/20 rounded-lg px-4 py-3 flex items-start gap-2">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-heading)]">Programme</label>
                {editId ? (
                  <div className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-muted)] opacity-70">
                    {selectedProg?.code} - {selectedProg?.name}
                  </div>
                ) : (
                  <ProgrammeCodePicker
                    programmes={programmes}
                    value={form.programmeId}
                    onSelect={(prog) => setForm(f => ({ ...f, programmeId: prog?._id || '', candidateIds: [] }))}
                  />
                )}
              </div>

              {form.programmeId && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--color-text-heading)]">Assign Candidates</label>
                    <div className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ background: `${teamColor}20`, color: teamColor }}>
                      {form.candidateIds.length} / {requiredCandidates} Selected
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Search candidates…"
                    value={regSearchQuery}
                    onChange={e => setRegSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-[var(--color-surface)] border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                  <div className="max-h-56 overflow-y-auto border rounded-lg bg-[var(--color-surface)] border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                    {filteredFormCandidates.map(c => {
                      const isSelected = form.candidateIds.includes(c._id);
                      return (
                        <label key={c._id}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                            isSelected ? 'text-white' : 'hover:bg-[var(--color-surface-elevated)]'
                          }`}
                          style={isSelected ? { background: teamColor } : {}}>
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

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={submitting}>Submit Registration</Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          Submit Topic Modal — Category-First Cascade
      ══════════════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={showTopicForm} onClose={() => setShowTopicForm(false)} title="Submit Topic">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text-heading)]">Topic Submitted</h3>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleTopicSubmit} className="space-y-5">
              {error && (
                <div className="text-sm text-red-400 bg-red-900/10 border border-red-800/20 rounded-lg px-4 py-3">
                  ⚠️ {error}
                </div>
              )}

              {/* ── Step 1: Category ─────────────────────────────────────────── */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                  1 — Select Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {topicCategories.length === 0 && (
                    <p className="text-xs text-[var(--color-text-muted)]">No topic-enabled programmes available.</p>
                  )}
                  {topicCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setTopicCategory(cat);
                        setTopicForm(f => ({ ...f, programmeId: '', topic: '', candidateId: '' }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        topicCategory === cat
                          ? 'text-white border-transparent'
                          : 'bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'
                      }`}
                      style={topicCategory === cat ? { background: teamColor, borderColor: teamColor } : {}}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Step 2: Programme (filtered by category) ──────────────────── */}
              {topicCategory && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                    2 — Select Programme
                  </label>
                  {topicProgrammesInCategory.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-muted)]">No programmes in this category require a topic.</p>
                  ) : (
                    <ProgrammeCodePicker
                      programmes={topicProgrammesInCategory}
                      value={topicForm.programmeId}
                      onSelect={(prog) => {
                        const val = prog?._id || '';
                        setTopicForm(f => ({ ...f, programmeId: val, topic: '', candidateId: '' }));
                        if (val) loadOtherTopics(val);
                      }}
                      compact
                    />
                  )}
                </motion.div>
              )}

              {/* ── Step 3: Topic entry ───────────────────────────────────────── */}
              {topicForm.programmeId && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                      3 — Enter Topic
                    </label>
                    {selectedTopicProg?.topicMode === 'fixed-list' ? (
                      <select
                        value={topicForm.topic}
                        onChange={e => setTopicForm(f => ({ ...f, topic: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                      >
                        <option value="">Select a topic…</option>
                        {selectedTopicProg?.topicList?.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={topicForm.topic}
                        onChange={e => setTopicForm(f => ({ ...f, topic: e.target.value }))}
                        placeholder="Enter your topic…"
                        className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                      />
                    )}
                  </div>

                  {/* Already-submitted topics by other teams */}
                  {otherTopics[topicForm.programmeId]?.length > 0 && (
                    <div className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-elevated)]">
                      <h4 className="text-xs font-bold mb-2 uppercase tracking-wider text-[var(--color-text-muted)]">
                        Already Submitted Topics
                      </h4>
                      <ul className="space-y-1">
                        {otherTopics[topicForm.programmeId].map(t => (
                          <li key={t._id} className="text-sm flex gap-2">
                            <span className="opacity-50 shrink-0">{t.team?.name}:</span>
                            <span className={t.status === 'approved' ? 'text-green-500 font-medium' : ''}>
                              {t.topic}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                <Button variant="ghost" type="button" onClick={() => setShowTopicForm(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={submitting}>Submit Topic</Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
}

