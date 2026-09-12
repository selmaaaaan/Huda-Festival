import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trophy, Clock, AlertTriangle, ClipboardList, Send, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgrammeCodePicker from '../components/ProgrammeCodePicker';

const JudgePanel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [activeProgramme, setActiveProgramme] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [alreadyJudged, setAlreadyJudged] = useState(false);
  const [overrideWarning, setOverrideWarning] = useState(false);
  
  const [results, setResults] = useState({});
  
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const res = await api.get('/results/my-submissions');
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleProgrammeSelect = async (programme) => {
    if (!programme) {
      setActiveProgramme(null);
      setCandidates([]);
      setResults({});
      setAlreadyJudged(false);
      setOverrideWarning(false);
      return;
    }

    setLoading(true);
    setError(null);
    setResults({});
    setOverrideWarning(false);
    
    try {
      const res = await api.get('/programmes/' + programme._id + '/candidates-for-judging');
      setActiveProgramme(res.data.programme);
      setCandidates(res.data.codeLetters);
      setAlreadyJudged(res.data.alreadyJudged);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch programme candidates. They might not have code letters assigned yet.');
      setActiveProgramme(null);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (codeLetterId, field, value) => {
    setResults(prev => ({
      ...prev,
      [codeLetterId]: {
        ...prev[codeLetterId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!activeProgramme) return;

    const resultsArray = Object.entries(results).map(([codeLetterId, data]) => ({
      candidateId: codeLetterId,
      rank: data.rank || null,
      grade: data.grade || null,
      remarks: data.remarks || null
    })).filter(r => r.rank !== null || r.grade !== null);

    if (resultsArray.length === 0) {
      setError('No scores to submit. Please assign at least one rank or grade.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const batchId = 'JUDGE-' + Date.now();
      await api.post('/programmes/' + activeProgramme._id + '/results/bulk', {
        results: resultsArray,
        batchId
      });
      
      setResults({});
      setActiveProgramme(null);
      setCandidates([]);
      setAlreadyJudged(false);
      setOverrideWarning(false);
      fetchSubmissions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
          <Trophy size={20} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Judge Panel (Blind Evaluation)</h1>
      </div>
      <p className="text-[var(--color-text-body)]">Select a programme to evaluate its candidates using their blind code letters.</p>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-[var(--color-text-heading)] mb-2">Select Programme</label>
            <ProgrammeCodePicker onSelect={handleProgrammeSelect} />

            {activeProgramme && (
              <div className="mt-6 p-4 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Programme</div>
                    <div className="font-medium text-[var(--color-text-heading)]">{activeProgramme.name} ({activeProgramme.code})</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Category & Format</div>
                    <div className="font-medium text-[var(--color-text-heading)]">{activeProgramme.category} • {activeProgramme.format}</div>
                  </div>
                </div>
                
                {activeProgramme.conceptNote && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                    <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <FileText size={14} /> Concept Note
                    </div>
                    <div className="text-sm text-[var(--color-text-body)] italic leading-relaxed">
                      "{activeProgramme.conceptNote}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {activeProgramme && candidates.length === 0 && !error && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center">
              <AlertTriangle size={32} className="mx-auto text-amber-500 mb-3" />
              <h3 className="text-lg font-bold text-amber-600 mb-1">Code letters not yet assigned</h3>
              <p className="text-amber-600/80 text-sm">Ask a volunteer to assign code letters to candidates for this programme first before judging.</p>
            </div>
          )}

          {activeProgramme && candidates.length > 0 && alreadyJudged && !overrideWarning && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center">
              <AlertTriangle size={32} className="mx-auto text-amber-500 mb-3" />
              <h3 className="text-lg font-bold text-amber-600 mb-1">Programme Already Judged</h3>
              <p className="text-amber-600/80 text-sm mb-6">Results have already been submitted for this programme. Resubmitting will overwrite or duplicate pending scores.</p>
              <button 
                onClick={() => setOverrideWarning(true)}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
              >
                Continue Anyway
              </button>
            </div>
          )}

          {activeProgramme && candidates.length > 0 && (!alreadyJudged || overrideWarning) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface-elevated)]">
                <h3 className="font-medium text-sm text-[var(--color-text-heading)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Blind Scoring Sheet
                </h3>
                <span className="text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded">
                  {candidates.length} candidates
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)]">
                      <th className="py-3 px-4 text-center font-medium w-24">Candidate</th>
                      <th className="py-3 px-4 text-center font-medium w-32">Position</th>
                      <th className="py-3 px-4 text-center font-medium w-32">Grade</th>
                      <th className="py-3 px-4 text-left font-medium">Remarks (Optional)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map(cand => (
                      <tr key={cand.codeLetterId} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-elevated)] transition-colors">
                        <td className="py-4 px-4 text-center">
                          <div className="w-10 h-10 mx-auto bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-lg flex items-center justify-center rounded-xl border border-[var(--color-primary)]/20 shadow-inner">
                            {cand.letter}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-1.5">
                            {[1, 2, 3].map(pos => (
                              <button
                                key={pos}
                                onClick={() => handleResultChange(cand.codeLetterId, 'rank', results[cand.codeLetterId]?.rank === pos ? null : pos)}
                                className={"w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all " + (
                                  results[cand.codeLetterId]?.rank === pos 
                                    ? "bg-[var(--color-primary)] text-white shadow-md scale-105" 
                                    : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-body)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-elevated)]"
                                )}
                              >
                                {pos}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-1.5">
                            {['A', 'B', 'C'].map(g => (
                              <button
                                key={g}
                                onClick={() => handleResultChange(cand.codeLetterId, 'grade', results[cand.codeLetterId]?.grade === g ? null : g)}
                                className={"w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all " + (
                                  results[cand.codeLetterId]?.grade === g 
                                    ? "bg-emerald-500 text-white shadow-md scale-105" 
                                    : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-body)] hover:border-emerald-500/50 hover:bg-[var(--color-surface-elevated)]"
                                )}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <input
                            type="text"
                            placeholder="Add brief remarks..."
                            value={results[cand.codeLetterId]?.remarks || ''}
                            onChange={(e) => handleResultChange(cand.codeLetterId, 'remarks', e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-heading)] placeholder:text-[var(--color-text-muted)] transition-colors"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-[var(--color-surface-elevated)] border-t border-[var(--color-border)] flex justify-end">
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50 active:scale-95"
                >
                  <Send size={16} />
                  Submit Results
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[600px]">
            <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface-elevated)]">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-[var(--color-text-muted)]" />
                <h3 className="font-medium text-sm text-[var(--color-text-heading)]">My Submissions</h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loadingSubmissions ? (
                <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">Loading...</div>
              ) : submissions.length === 0 ? (
                <div className="p-12 text-center text-[var(--color-text-muted)] text-sm flex flex-col items-center">
                  <Trophy size={24} className="opacity-20 mb-3" />
                  You haven't submitted any scores yet.
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">
                  {submissions.map(sub => (
                    <div key={sub._id} className="p-4 hover:bg-[var(--color-surface-elevated)] transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-[var(--color-text-heading)] text-sm">
                            {sub.candidate?.name ? (
                                <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={12}/> Security Warning: Name Leaked</span>
                            ) : (
                                "Candidate " + (sub.codeLetter || '[Masked]')
                            )}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">{sub.programme?.name}</div>
                        </div>
                        <span className={"text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full " + (
                          sub.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        )}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {sub.rank && (
                          <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 px-2 py-1.5 rounded-md text-[var(--color-primary)] text-xs font-bold flex items-center gap-1">
                            <Trophy size={12}/> {sub.rank}
                          </div>
                        )}
                        {sub.grade && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5 rounded-md text-emerald-600 text-xs font-bold">
                            Grade {sub.grade}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgePanel;