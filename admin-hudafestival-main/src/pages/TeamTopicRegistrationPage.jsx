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
export default function TeamTopicRegistrationPage() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const teamId = userInfo.team?._id || userInfo.team;
  const teamColor = 'var(--color-primary)';
  const teamName = userInfo.team?.name || 'Your Team';

  // ── Core State ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('topics');
  const [programmes, setProgrammes] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [topicEnabledProgrammes, setTopicEnabledProgrammes] = useState([]);
  const [myTopics, setMyTopics] = useState([]);
  const [otherTopics, setOtherTopics] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isTopicRegistrationEnabled, setIsTopicRegistrationEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(0);

  // ── Modal State ─────────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ── Registration Form ───────────────────────────────────────────────────────
  const [form, setForm] = useState({ programmeId: '', candidateIds: [] });
  const [regSearchQuery, setRegSearchQuery] = useState('');

  // ── Topic Form (cascade state) ──────────────────────────────────────────────
  const [topicForm, setTopicForm] = useState({ programmeId: '', candidates: {}, groupTopic: '' });
  const [editTopicId, setEditTopicId] = useState(null);
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
        api.get('/registrations?limit=500'),
        api.get('/settings').catch(() => ({ data: {} })),
        api.get('/topic-registrations/enabled-programmes'),
        api.get('/topic-registrations/my-submissions'),
      ]);
      setProgrammes(progRes.data);
      if (!isPoll) setCandidates(candRes.data);
      setMyRegistrations(regRes.data?.registrations || regRes.data || []);
      if (settingsRes.data?.isRegistrationOpen !== undefined)
        setIsRegistrationOpen(settingsRes.data.isRegistrationOpen);
      if (settingsRes.data?.topicRegistrationEnabled !== undefined)
        setIsTopicRegistrationEnabled(settingsRes.data.topicRegistrationEnabled);
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
  const filteredFormCandidates = useMemo(() => {
    if (!selectedProg) return [];
    return candidates.filter(c => {
      if (c.category !== selectedProg.category) return false;
      const q = regSearchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) ||
             c.admissionNo?.toLowerCase().includes(q) ||
             c.category?.toLowerCase().includes(q);
    });
  }, [candidates, regSearchQuery, selectedProg]);

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
      const { data } = await api.post('/registrations', {
        programmeId: form.programmeId, teamId, candidateIds: form.candidateIds,
      });
      setMyRegistrations(prev => [data, ...prev]);
      setSuccess(true);
      setTimeout(() => {
        setShowForm(false); setForm({ programmeId: '', candidateIds: [] });
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
    const registeredProgrammeIds = myRegistrations.filter(r => r.status !== 'rejected').map(r => r.programme._id || r.programme);
    const validProgrammes = eligibleTopicProgrammes.filter(p => registeredProgrammeIds.includes(p._id));
    const cats = [...new Set(validProgrammes.map(p => p.category))];
    return cats.sort();
  }, [eligibleTopicProgrammes, myRegistrations]);

  // Programmes within the selected category
  const topicProgrammesInCategory = useMemo(() => {
    if (!topicCategory) return [];
    const registeredProgrammeIds = myRegistrations.filter(r => r.status !== 'rejected').map(r => r.programme._id || r.programme);
    return eligibleTopicProgrammes.filter(p => 
      (p.category === topicCategory || p.category === 'KULLIYYAH') && registeredProgrammeIds.includes(p._id)
    );
  }, [eligibleTopicProgrammes, topicCategory, myRegistrations]);

  const selectedTopicProg = topicEnabledProgrammes.find(p => p._id === topicForm.programmeId);

  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!topicForm.programmeId || !topicForm.topic) { setError('Please fill all fields'); return; }
      const hasCands = myRegistrations.some(r => (r.programme._id || r.programme) === topicForm.programmeId && r.candidates?.length > 0);
      const isGroup = selectedTopicProg?.format === 'Group';
      if (hasCands && !isGroup && !topicForm.candidateId && !editTopicId) { setError('Please select a candidate'); return; }
      setSubmitting(true);
    try {
      if (editTopicId) {
        const { data } = await api.patch('/topic-registrations/' + editTopicId, { topic: topicForm.topic, attachment: topicForm.attachment });
        setMyTopics(prev => prev.map(t => t._id === editTopicId ? data : t));
      } else {
        const { data } = await api.post('/topic-registrations', {
          programmeId: topicForm.programmeId, teamId,
          candidateId: topicForm.candidateId || undefined,
          topic: topicForm.topic,
            attachment: topicForm.attachment,
        });
        setMyTopics(prev => [data, ...prev]);
      }
      setSuccess(true);
      setTimeout(() => {
        setShowTopicForm(false);
        setEditTopicId(null);
        setTopicForm({ programmeId: '', candidates: {}, groupTopic: '' });
        setTopicCategory('');
        setSuccess(false);
      }, 1500);
    } catch (e) { setError(e.response?.data?.message || 'Failed to submit topic'); }
    finally { setSubmitting(false); }
  };

  const openNewRegistration = () => {
    if (isTopicRegistrationEnabled === false) return;
    setSuccess(false); setError('');
    setEditTopicId(null);
    setTopicForm({ programmeId: '', candidates: {}, groupTopic: '' });
    setTopicCategory('');
    setShowTopicForm(true);
  };

  const openEditTopic = (t) => {
    if (isTopicRegistrationEnabled === false) return;
    setSuccess(false); setError('');
    setEditTopicId(t._id);
    setTopicCategory(t.programme?.category || '');
    {
      const existingForProg = myTopics.filter(topic => (topic.programme?._id || topic.programme) === t.programme?._id);
      const candsMap = {};
      myRegistrations.filter(r => (r.programme?._id || r.programme) === t.programme?._id && r.status !== 'rejected').flatMap(r => r.candidates || []).forEach(c => {
         const et = existingForProg.find(topic => topic.candidate?._id === c._id);
         if (et) candsMap[c._id] = { topic: et.topic, attachment: et.attachment || '', attachmentType: et.attachment ? (et.attachment.includes('youtu') ? 'youtube' : 'image') : '' };
         else candsMap[c._id] = { topic: '', attachment: '', attachmentType: '' };
      });
      const groupEt = existingForProg[0];
      setTopicForm({ programmeId: t.programme?._id, candidates: candsMap, groupTopic: groupEt?.topic || '', groupAttachment: groupEt?.attachment || '', groupAttachmentType: groupEt?.attachment ? (groupEt.attachment.includes('youtu') ? 'youtube' : 'image') : '' });
    }
    loadOtherTopics(t.programme?._id);
    setShowTopicForm(true);
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic registration?')) return;
    setSubmitting(true);
    try {
      await api.delete(`/topic-registrations/${topicId}`);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete topic');
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
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="p-8 w-full max-w-[1600px] mx-auto">
        {/* ── Branded Header ──────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm mb-8"
          style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${teamColor} 12%, transparent), transparent)` }}
        >
          {/* Decorative Mosque Silhouette */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-2/3 h-full overflow-hidden flex justify-end items-end">
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full fill-current mix-blend-multiply dark:mix-blend-screen" style={{ color: teamColor }}>
              <path d="M70,50 L70,30 Q70,25 65,25 Q60,25 60,30 L60,50 Z M80,50 L80,10 Q80,0 85,0 Q90,0 90,10 L90,50 Z M40,50 L40,20 Q40,10 45,10 Q50,10 50,20 L50,50 Z M10,50 L10,35 Q10,30 15,30 Q20,30 20,35 L20,50 Z" />
            </svg>
          </div>

          <div className="relative z-10 w-full px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/40 dark:border-white/10 mb-4 shadow-sm" style={{ color: teamColor }}>
                ✨ <span className="uppercase tracking-wider">Team Portal</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-heading)]">
                Topic Registration
              </h1>
              <p className="text-[var(--color-text-muted)] mt-2 font-medium">
                Submit and track your team's topic applications for Huda Festival.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-heading)] px-4 py-2 bg-white/50 dark:bg-black/20 rounded-full border border-white/30 backdrop-blur-sm shadow-sm">
                <span className="w-3 h-3 rounded-full" style={{ background: teamColor }} />
                {teamName}
              </div>
              <span className="text-xs text-[var(--color-text-muted)] font-medium mb-1">
                Updated {lastUpdated}s ago
              </span>
              <Button onClick={() => setShowTopicForm(true)} variant="primary" className="shadow-md">
                <Plus size={15} />
                Submit Topic
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full space-y-8">

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
                        {['Programme', 'Candidates', 'Submitted', 'Status', 'Reason'].map(h => (
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
                        {['Programme', 'Candidate', 'Topic', 'Status', 'Review Note', ''].map(h => (
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
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            {isTopicRegistrationEnabled !== false && t.status !== 'approved' && (
                              <button onClick={() => openEditTopic(t)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-1" title="Edit Topic">
                                <Edit3 size={16} />
                              </button>
                            )}
                            {isTopicRegistrationEnabled !== false && (
                              <button onClick={() => handleDeleteTopic(t._id)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-1" title="Delete Topic">
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
        </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          New Registration Modal
      ══════════════════════════════════════════════════════════════════════════ */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Registration">
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
                <ProgrammeCodePicker
                  programmes={programmes}
                  value={form.programmeId}
                  onSelect={(prog) => setForm(f => ({ ...f, programmeId: prog?._id || '', candidateIds: [] }))}
                />
              </div>

              {form.programmeId && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--color-text-heading)]">Assign Candidates</label>
                    <div className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ background: `color-mix(in srgb, ${teamColor} 20%, transparent)`, color: teamColor }}>
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
      <Modal isOpen={showTopicForm} onClose={() => setShowTopicForm(false)} title={editTopicId ? "Edit Topic" : "Submit Topic"}>
        <AnimatePresence mode="wait">
          {!isTopicRegistrationEnabled ? (
            <motion.div key="closed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 flex flex-col items-center text-center space-y-4">
              <motion.div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
                <AlertTriangle size={32} />
              </motion.div>
              <h3 className="text-lg font-bold text-[var(--color-text-heading)]">Topic Registration is closed</h3>
              <Button variant="ghost" onClick={() => setShowTopicForm(false)}>Close</Button>
            </motion.div>
          ) : success ? (
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

              {editTopicId ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Category & Programme</label>
                    <div className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-muted)] opacity-70">
                      {topicCategory} • {selectedTopicProg?.code} - {selectedTopicProg?.name}
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                            setTopicForm(f => ({ ...f, programmeId: '', candidates: {}, groupTopic: '' }));
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
                            {
        const existingForProg = myTopics.filter(t => (t.programme?._id || t.programme) === val);
        const candsMap = {};
        myRegistrations.filter(r => (r.programme?._id || r.programme) === val && r.status !== 'rejected').flatMap(r => r.candidates || []).forEach(c => {
           const et = existingForProg.find(t => t.candidate?._id === c._id);
           if (et) candsMap[c._id] = { topic: et.topic, attachment: et.attachment || '', attachmentType: et.attachment ? (et.attachment.includes('youtu') ? 'youtube' : 'image') : '' };
           else candsMap[c._id] = { topic: '', attachment: '', attachmentType: '' };
        });
        const groupEt = existingForProg[0];
        setTopicForm(f => ({ ...f, programmeId: val, candidates: candsMap, groupTopic: groupEt?.topic || '', groupAttachment: groupEt?.attachment || '', groupAttachmentType: groupEt?.attachment ? (groupEt.attachment.includes('youtu') ? 'youtube' : 'image') : '' }));
    }
                            if (val) loadOtherTopics(val);
                          }}
                          compact
                        />
                      )}
                    </motion.div>
                  )}
                </>
              )}

              {/* ── Step 3: Topic entry ───────────────────────────────────────── */}
                                          {topicForm.programmeId && (() => {
                  const regs = myRegistrations.filter(r => (r.programme._id || r.programme) === topicForm.programmeId && r.status !== 'rejected');
                  const registeredCands = regs.flatMap(r => r.candidates || []);
                  
                  const uniqueCandsMap = new Map();
                  registeredCands.forEach(c => {
                      if (c && c._id) uniqueCandsMap.set(c._id, c);
                  });
                  const uniqueCands = Array.from(uniqueCandsMap.values());

                  const isGroup = selectedTopicProg?.format === 'Group';
                  const otherTeamTopics = otherTopics[topicForm.programmeId] || [];
                  const globallyTakenTopics = selectedTopicProg?.topicMode === 'exclusive' ? otherTeamTopics.map(t => t.topic) : [];
                  
                  return (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      {isGroup ? (
                        <div className="p-3 border rounded-lg bg-[var(--color-surface-elevated)] space-y-3">
                           <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                             3 ?" Enter Group Topic
                           </label>
                           {selectedTopicProg?.topicMode === 'fixed' || selectedTopicProg?.topicMode === 'exclusive' ? (
                              <select
                                value={topicForm.groupTopic || ''}
                                onChange={e => setTopicForm(f => ({ ...f, groupTopic: e.target.value }))}
                                className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                              >
                                <option value="">Select a topic?</option>
                                {selectedTopicProg?.topicList?.map(t => (
                                  <option key={t} value={t} disabled={globallyTakenTopics.includes(t) && topicForm.groupTopic !== t}>{t}</option>
                                ))}
                              </select>
                           ) : (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={topicForm.groupTopic || ''}
                                  onChange={e => setTopicForm(f => ({ ...f, groupTopic: e.target.value }))}
                                  placeholder="Enter group topic?"
                                  className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                                />
                                
                                {selectedTopicProg?.topicMode === 'free-text' && (
                                   <div className="pt-2 border-t border-[var(--color-border)]">
                                     <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-2">Attachment</label>
                                     <div className="flex gap-2 mb-2">
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'youtube', groupAttachment: '' }))} className={`px-2 py-1 text-xs font-medium rounded border ${topicForm.groupAttachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}`}>YouTube Link</button>
                                       <button type="button" onClick={() => setTopicForm(f => ({ ...f, groupAttachmentType: 'image', groupAttachment: '' }))} className={`px-2 py-1 text-xs font-medium rounded border ${topicForm.groupAttachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}`}>Image Upload</button>
                                     </div>
                                     {topicForm.groupAttachmentType === 'youtube' && (
                                       <input type="text" placeholder="https://youtube.com/..." value={topicForm.groupAttachment || ''} onChange={e => setTopicForm(f => ({ ...f, groupAttachment: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                                     )}
                                     {topicForm.groupAttachmentType === 'image' && (
                                       <div>
                                         {topicForm.groupAttachment ? (
                                            <div className="flex items-center gap-2 text-sm text-green-500 font-medium">Uploaded Successfully! <button type="button" onClick={() => setTopicForm(f => ({...f, groupAttachment: ''}))} className="text-red-500 underline ml-2">Remove</button></div>
                                         ) : (
                                            <input type="file" accept="image/*" onChange={async (e) => {
                                               if(!e.target.files[0]) return;
                                               const fd = new FormData(); fd.append('file', e.target.files[0]);
                                               try {
                                                  const res = await api.post('/topic-registrations/upload', fd);
                                                  setTopicForm(f => ({ ...f, groupAttachment: res.data.url }));
                                               } catch(err) { alert('Upload failed'); }
                                            }} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-dark)]" />
                                         )}
                                       </div>
                                     )}
                                   </div>
                                )}
                              </div>
                           )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                            3 ?" Assign Topics to Candidates
                          </label>
                          {uniqueCands.length === 0 && <p className="text-sm text-red-500">No candidates registered for this programme yet.</p>}
                          {uniqueCands.map(c => {
                             const candData = topicForm.candidates[c._id] || { topic: '', attachment: '' };
                             const otherCandTopics = Object.keys(topicForm.candidates).filter(id => id !== c._id).map(id => topicForm.candidates[id]?.topic).filter(Boolean);
                             
                             return (
                               <div key={c._id} className="p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-elevated)] space-y-3">
                                  <div className="font-semibold text-sm">{c.name} <span className="text-xs opacity-60">({c.admissionNo})</span></div>
                                  {selectedTopicProg?.topicMode === 'fixed' || selectedTopicProg?.topicMode === 'exclusive' ? (
                                    <select
                                      value={candData.topic || ''}
                                      onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, topic: e.target.value } } }))}
                                      className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]"
                                    >
                                      <option value="">Select a topic?</option>
                                      {selectedTopicProg?.topicList?.map(t => {
                                         let isDisabled = false;
                                         if (selectedTopicProg.topicMode === 'exclusive') {
                                             if (globallyTakenTopics.includes(t) && candData.topic !== t) isDisabled = true;
                                         }
                                         if (selectedTopicProg.topicMode === 'fixed') {
                                             if (otherCandTopics.includes(t)) isDisabled = true;
                                         }
                                         return <option key={t} value={t} disabled={isDisabled}>{t}</option>;
                                      })}
                                    </select>
                                  ) : (
                                    <div className="space-y-3">
                                      <input
                                        type="text"
                                        value={candData.topic || ''}
                                        onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, topic: e.target.value } } }))}
                                        placeholder="Enter topic?"
                                        className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]"
                                      />
                                      {selectedTopicProg?.topicMode === 'free-text' && (
                                         <div className="pt-2 border-t border-[var(--color-border)]">
                                           <label className="block text-xs font-bold uppercase text-[var(--color-text-muted)] mb-2">Attachment</label>
                                           <div className="flex gap-2 mb-2">
                                             <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'youtube', attachment: '' } } }))} className={`px-2 py-1 text-xs font-medium rounded border ${candData.attachmentType === 'youtube' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}`}>YouTube Link</button>
                                             <button type="button" onClick={() => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachmentType: 'image', attachment: '' } } }))} className={`px-2 py-1 text-xs font-medium rounded border ${candData.attachmentType === 'image' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text-muted)]'}`}>Image Upload</button>
                                           </div>
                                           {candData.attachmentType === 'youtube' && (
                                             <input type="text" placeholder="https://youtube.com/..." value={candData.attachment || ''} onChange={e => setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachment: e.target.value } } }))} className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                                           )}
                                           {candData.attachmentType === 'image' && (
                                             <div>
                                               {candData.attachment ? (
                                                  <div className="flex items-center gap-2 text-sm text-green-500 font-medium">Uploaded Successfully! <button type="button" onClick={() => setTopicForm(f => ({...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachment: '' } } }))} className="text-red-500 underline ml-2">Remove</button></div>
                                               ) : (
                                                  <input type="file" accept="image/*" onChange={async (e) => {
                                                     if(!e.target.files[0]) return;
                                                     const fd = new FormData(); fd.append('file', e.target.files[0]);
                                                     try {
                                                        const res = await api.post('/topic-registrations/upload', fd);
                                                        setTopicForm(f => ({ ...f, candidates: { ...f.candidates, [c._id]: { ...candData, attachment: res.data.url } } }));
                                                     } catch(err) { alert('Upload failed'); }
                                                  }} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-dark)]" />
                                               )}
                                             </div>
                                           )}
                                         </div>
                                      )}
                                    </div>
                                  )}
                               </div>
                             );
                          })}
                        </div>
                      )}

                  {/* Already-submitted topics by other teams */}
                  {otherTopics[topicForm.programmeId]?.length > 0 && (
                    <div className="p-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-elevated)] mt-4">
                      <h4 className="text-xs font-bold mb-2 uppercase tracking-wider text-[var(--color-text-muted)]">
                        Already Submitted Topics (Other Teams)
                      </h4>
                      <ul className="space-y-1">
                        {otherTopics[topicForm.programmeId].map(t => (
                          <li key={t._id} className="text-sm flex gap-2">
                            <span className="opacity-50 shrink-0">{t.team?.name}:</span>
                            <span className={t.status === 'approved' ? 'text-green-500 font-medium' : ''}>
                              {t.topic} {t.attachment && <a href={t.attachment} target="_blank" className="text-blue-500 text-xs ml-1 underline">View</a>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                {selectedTopicProg?.topicMode === 'free-text' && (
                      <div className="mt-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                          Attachment (YouTube Link / Image URL)
                        </label>
                        <input
                          type="text"
                          value={topicForm.attachment || ''}
                          onChange={e => setTopicForm(f => ({ ...f, attachment: e.target.value }))}
                          placeholder="Optional: https://youtube.com/..."
                          className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
                    )}
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

