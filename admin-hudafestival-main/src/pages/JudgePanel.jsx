import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Trophy, CheckCircle, Clock, AlertTriangle, User, ClipboardList, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const JudgePanel = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [activeProgramme, setActiveProgramme] = useState(null);
  const [candidates, setCandidates] = useState([]);
  
  const [results, setResults] = useState({}); // { candidateId: { rank, grade } }
  
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError(null);
    setActiveProgramme(null);
    setCandidates([]);
    setResults({});

    try {
      const res = await api.get(`/programmes/code/${code}/judging`);
      setActiveProgramme(res.data.programme);
      
      // Extract candidates from approved registrations
      const cands = [];
      res.data.registrations.forEach(reg => {
        reg.candidates.forEach(c => {
          cands.push({
            ...c,
            teamName: reg.team.name
          });
        });
      });
      setCandidates(cands);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch programme for judging. Invalid code?');
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (candidateId, field, value) => {
    setResults(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!activeProgramme) return;

    // Filter out rows that have neither rank nor grade
    const resultsArray = Object.entries(results).map(([candidateId, data]) => ({
      candidateId,
      rank: data.rank || null,
      grade: data.grade || null
    })).filter(r => r.rank !== null || r.grade !== null);

    if (resultsArray.length === 0) {
      setError('No scores to submit.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const batchId = `JUDGE-\${Date.now()}`;
      await api.post(`/programmes/\${activeProgramme._id}/results/bulk`, {
        results: resultsArray,
        batchId
      });
      
      setResults({});
      setActiveProgramme(null);
      setCandidates([]);
      setCode('');
      fetchSubmissions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
          <Trophy size={20} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Judge Panel</h1>
      </div>
      <p className="text-[var(--color-text-body)]">Search for a programme by code to score its registered candidates.</p>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Search & Enter */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-[var(--color-text-muted)]" size={18} />
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter Programme Code (e.g., MUSIC-01)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-heading)]"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !code}
                className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
              >
                Search
              </button>
            </form>

            {activeProgramme && (
              <div className="mt-6 p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl">
                <h3 className="font-semibold text-[var(--color-primary)] mb-1">{activeProgramme.name}</h3>
                <div className="flex gap-4 text-xs text-[var(--color-text-body)]">
                  <span>Category: {activeProgramme.category}</span>
                  <span>Type: {activeProgramme.type}</span>
                </div>
              </div>
            )}
          </div>

          {activeProgramme && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface-elevated)]">
                <h3 className="font-medium text-sm text-[var(--color-text-heading)]">Scoring Sheet</h3>
                <span className="text-xs text-[var(--color-text-muted)]">{candidates.length} candidates</span>
              </div>
              
              {candidates.length === 0 ? (
                <div className="p-12 text-center text-[var(--color-text-muted)] text-sm">
                  No approved registrations found for this programme.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                        <th className="py-3 px-4 text-left font-medium">Candidate</th>
                        <th className="py-3 px-4 text-left font-medium">Position</th>
                        <th className="py-3 px-4 text-left font-medium">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.map(cand => (
                        <tr key={cand._id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-elevated)] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-[var(--color-text-heading)]">{cand.name}</div>
                            <div className="text-xs text-[var(--color-text-muted)]">{cand.admissionNo} • {cand.teamName}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {[1, 2, 3].map(pos => (
                                <button
                                  key={pos}
                                  onClick={() => handleResultChange(cand._id, 'rank', results[cand._id]?.rank === pos ? null : pos)}
                                  className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all \${
                                    results[cand._id]?.rank === pos 
                                      ? 'bg-[var(--color-primary)] text-white shadow-md' 
                                      : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-body)] hover:border-[var(--color-primary)]/50'
                                  }`}
                                >
                                  {pos}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {['A', 'B', 'C'].map(g => (
                                <button
                                  key={g}
                                  onClick={() => handleResultChange(cand._id, 'grade', results[cand._id]?.grade === g ? null : g)}
                                  className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all \${
                                    results[cand._id]?.grade === g 
                                      ? 'bg-emerald-500 text-white shadow-md' 
                                      : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-body)] hover:border-emerald-500/50'
                                  }`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {candidates.length > 0 && (
                <div className="p-4 bg-[var(--color-surface-elevated)] border-t border-[var(--color-border)] flex justify-end">
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Send size={16} />
                    Submit to Admin
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Column: History */}
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
                          <div className="font-medium text-[var(--color-text-heading)] text-sm">{sub.candidate?.name || 'Unknown Candidate'}</div>
                          <div className="text-xs text-[var(--color-text-muted)]">{sub.programme?.name}</div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full \${
                          sub.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs">
                        {sub.rank && (
                          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 rounded-md text-[var(--color-text-heading)]">
                            Pos: <span className="font-semibold">{sub.rank}</span>
                          </div>
                        )}
                        {sub.grade && (
                          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 rounded-md text-[var(--color-text-heading)]">
                            Grade: <span className="font-semibold">{sub.grade}</span>
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
