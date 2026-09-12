import React, { useState, useEffect, useCallback } from 'react';
import { Radio, Save, AlertCircle, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import api from '../services/api';
import ProgrammeCodePicker from '../components/ProgrammeCodePicker';
import Button from '../components/Button';

const STATUS_OPTIONS = [
  { value: 'upcoming',  label: 'Upcoming',  color: 'bg-blue-100 text-blue-700' },
  { value: 'live',      label: 'LIVE',       color: 'bg-green-500 text-white' },
  { value: 'completed', label: 'Completed',  color: 'bg-gray-200 text-gray-600' },
  { value: 'postponed', label: 'Postponed',  color: 'bg-red-100 text-red-700' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ─── Section: Status Updater ─────────────────────────────────────────────────
const StatusSection = ({ programmes }) => {
  const [selectedProg, setSelectedProg] = useState(null);
  const [status, setStatus] = useState('upcoming');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text }

  const handleSelect = (prog) => {
    setSelectedProg(prog);
    setStatus(prog?.status || 'upcoming');
    setMsg(null);
  };

  const handleSave = async () => {
    if (!selectedProg) return;
    setSaving(true);
    setMsg(null);
    try {
      await api.patch(`/programmes/${selectedProg._id}/status`, { status });
      setMsg({ type: 'success', text: `Status updated to "${status}" successfully.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update status.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">Live Status Update</h2>

      <ProgrammeCodePicker programmes={programmes} value={selectedProg?._id || null} onSelect={handleSelect} />

      {selectedProg && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--color-text-muted)]">Set Status</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`py-2 px-4 rounded-lg text-sm font-bold transition-all border-2 ${
                  status === opt.value
                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30 ' + opt.color
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)]'
                } ${opt.value === 'live' ? 'animate-pulse-slow' : ''}`}
              >
                {opt.value === 'live' && <span className="inline-block w-2 h-2 rounded-full bg-green-300 mr-1.5 animate-ping" />}
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="primary" onClick={handleSave} loading={saving}>
              <Save size={15} className="mr-1.5" /> Save Status
            </Button>
            {msg && (
              <span className={`text-sm flex items-center gap-1.5 ${msg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                {msg.text}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Section: Code Letter Assignment ─────────────────────────────────────────
const CodeLetterSection = ({ programmes }) => {
  const [selectedProg, setSelectedProg] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [assignments, setAssignments] = useState({}); // candidateId -> letter
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSelect = useCallback(async (prog) => {
    setSelectedProg(prog);
    setAssignments({});
    setMsg(null);
    if (!prog) { setCandidates([]); return; }

    setLoadingCandidates(true);
    try {
      // Fetch approved registrations for this programme
      const [regRes, existingRes] = await Promise.all([
        api.get(`/programmes/${prog._id}/registrations`),
        api.get(`/programmes/${prog._id}/code-letters`).catch(() => ({ data: [] })),
      ]);

      // Flatten candidates from registrations
      const regs = regRes.data || [];
      const allCandidates = [];
      regs.forEach(reg => {
        if (reg.status === 'approved') {
          (reg.candidates || []).forEach(c => {
            if (!allCandidates.find(x => x._id === c._id)) allCandidates.push(c);
          });
        }
      });
      setCandidates(allCandidates);

      // Pre-fill existing letters
      const existing = {};
      (existingRes.data || []).forEach(cl => {
        existing[cl.candidate._id || cl.candidate] = cl.letter;
      });

      // Auto-suggest sequential letters for those without one
      let nextIdx = 0;
      const autoAssign = {};
      allCandidates.forEach(c => {
        if (existing[c._id]) {
          autoAssign[c._id] = existing[c._id];
        } else {
          // Find next unused letter
          while (
            nextIdx < ALPHABET.length &&
            Object.values({ ...existing, ...autoAssign }).includes(ALPHABET[nextIdx])
          ) nextIdx++;
          if (nextIdx < ALPHABET.length) autoAssign[c._id] = ALPHABET[nextIdx++];
        }
      });
      setAssignments(autoAssign);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load candidates.' });
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  const handleLetterChange = (candidateId, letter) => {
    setAssignments(prev => ({ ...prev, [candidateId]: letter.toUpperCase().slice(0, 3) }));
  };

  const handleSave = async () => {
    if (!selectedProg || candidates.length === 0) return;
    const assignArr = candidates
      .filter(c => assignments[c._id]?.trim())
      .map(c => ({ candidateId: c._id, letter: assignments[c._id].trim() }));

    if (assignArr.length === 0) { setMsg({ type: 'error', text: 'No assignments to save.' }); return; }

    setSaving(true);
    setMsg(null);
    try {
      const res = await api.post(`/programmes/${selectedProg._id}/code-letters`, { assignments: assignArr });
      setMsg({ type: 'success', text: res.data.message });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save letters.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">Code Letter Assignment</h2>

      <ProgrammeCodePicker programmes={programmes} value={selectedProg?._id || null} onSelect={handleSelect} />

      {loadingCandidates && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Loader2 size={16} className="animate-spin" /> Loading candidates…
        </div>
      )}

      {!loadingCandidates && selectedProg && candidates.length === 0 && (
        <div className="p-6 text-center text-sm text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-xl">
          No approved candidates found for this programme.
        </div>
      )}

      {!loadingCandidates && candidates.length > 0 && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">
                  <th className="pb-3 pr-6 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">#</th>
                  <th className="pb-3 pr-6 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Candidate</th>
                  <th className="pb-3 pr-6 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Admission No</th>
                  <th className="pb-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Code Letter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {candidates.map((c, idx) => (
                  <tr key={c._id} className="hover:bg-[var(--color-surface-elevated)] transition-colors">
                    <td className="py-3 pr-6 text-[var(--color-text-muted)]">{idx + 1}</td>
                    <td className="py-3 pr-6 font-medium text-[var(--color-text-heading)]">{c.name}</td>
                    <td className="py-3 pr-6 text-[var(--color-text-muted)]">{c.admissionNo || '—'}</td>
                    <td className="py-3">
                      <input
                        type="text"
                        value={assignments[c._id] || ''}
                        onChange={e => handleLetterChange(c._id, e.target.value)}
                        maxLength={3}
                        placeholder="A"
                        className="w-20 px-3 py-1.5 text-center text-sm font-bold uppercase bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-heading)]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button variant="primary" onClick={handleSave} loading={saving}>
              <Save size={15} className="mr-1.5" /> Save All Letters
            </Button>
            {msg && (
              <span className={`text-sm flex items-center gap-1.5 ${msg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                {msg.text}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main VolunteerPortal ────────────────────────────────────────────────────
const VolunteerPortal = () => {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/programmes').then(res => setProgrammes(res.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-[var(--color-text-muted)]">Loading…</div>;

  return (
    <div className="p-6 w-full space-y-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Volunteer Portal</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Update programme statuses live and assign blind-judging code letters.
        </p>
      </div>

      <StatusSection programmes={programmes} />
      <CodeLetterSection programmes={programmes} />
    </div>
  );
};

export default VolunteerPortal;
