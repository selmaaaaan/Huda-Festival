import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionHeading, EmptyState } from '../components/ui';
import api from '../services/api';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateResults, setCandidateResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true); setSearched(true); setSelectedCandidate(null);
    try { const { data } = await api.get(`/candidates/search?term=${searchTerm}`); setSearchResults(data); }
    catch { setSearchResults([]); } finally { setLoading(false); }
  };

  const handleSelectCandidate = async (candidate) => {
    setSelectedCandidate(candidate); setLoadingResults(true);
    try { const { data } = await api.get(`/candidates/${candidate._id}/results`); setCandidateResults(data); }
    catch { console.error('Failed to fetch results'); } finally { setLoadingResults(false); }
  };

  if (!selectedCandidate) {
    return (
      <div className="min-h-screen bg-[var(--festival-white)] py-24 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto text-center">
          <SectionHeading subtitle="Find Your Festival Moment" align="center">
            Candidate <br/>
            <span className="text-[var(--festival-yellow)]">Search</span>
          </SectionHeading>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 mb-16">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter name or admission number..."
              className="flex-grow px-6 py-4 border-2 border-[var(--border)] font-bold text-lg focus:outline-none focus:ring-4 focus:ring-[var(--festival-yellow)] shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] transition-all bg-[var(--festival-white)]" />
            <button type="submit" disabled={loading}
              className="px-10 py-4 font-black font-display text-xl uppercase tracking-widest text-[var(--festival-white)] bg-[var(--festival-black)] hover:bg-[var(--festival-yellow)] hover:text-[var(--festival-black)] border-2 border-[var(--border)] shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] transition-colors disabled:opacity-50">
              {loading ? '...' : 'Search'}
            </button>
          </form>

          <div className="max-w-2xl mx-auto text-left">
            {!loading && searched && searchResults.length === 0 && (
              <EmptyState title="No matches found" message="Try a different search term or check the spelling." icon="🔍" />
            )}
            {!loading && searchResults.length > 0 && (
              <div className="space-y-6">
                {searchResults.map((candidate, i) => (
                  <motion.div key={candidate._id} onClick={() => handleSelectCandidate(candidate)}
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="bg-[var(--festival-white)] p-6 border-2 border-[var(--border)] shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] flex items-center gap-6 cursor-pointer group hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(23,23,23,1)] transition-all">
                    <div className="w-16 h-16 rounded-full border-2 border-[var(--border)] overflow-hidden shrink-0">
                       <img src={candidate.image.url} alt={candidate.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-black font-display uppercase tracking-tight truncate group-hover:text-[var(--festival-yellow)] transition-colors">{candidate.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 border border-[var(--border)] px-2 py-1">{candidate.admissionNo}</span>
                        {candidate.team?.name && <span className="text-xs font-bold uppercase tracking-widest text-[var(--festival-white)] border border-[var(--border)] px-2 py-1" style={{ backgroundColor: candidate.team?.color || 'var(--festival-black)' }}>{candidate.team.name}</span>}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Points</span>
                       <span className="text-3xl font-black font-display">{candidate.totalPoints || 0}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--festival-white)] py-24 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <button onClick={() => setSelectedCandidate(null)} className="font-bold uppercase tracking-widest text-sm mb-12 flex items-center gap-2 hover:text-[var(--festival-yellow)] transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Search Results
        </button>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Candidate Profile Panel */}
          <div className="w-full md:w-1/3 border-2 border-[var(--border)] p-8 shadow-[8px_8px_0px_0px_rgba(23,23,23,1)] bg-white">
            <div className="w-48 h-48 mx-auto rounded-full border-4 border-[var(--border)] overflow-hidden mb-8">
               <img src={selectedCandidate.image.url} alt={selectedCandidate.name} className="w-full h-full object-cover grayscale" />
            </div>
            <h1 className="text-4xl font-black font-display uppercase tracking-tighter text-center leading-none mb-6">{selectedCandidate.name}</h1>
            <div className="flex flex-col gap-4">
              {selectedCandidate.team?.name && (
                 <div className="flex justify-between items-center border-b-2 border-gray-100 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Team</span>
                    <span className="font-bold uppercase tracking-widest px-3 py-1 text-xs text-white border border-[var(--border)]" style={{ backgroundColor: selectedCandidate.team?.color || 'var(--festival-black)' }}>{selectedCandidate.team.name}</span>
                 </div>
              )}
              <div className="flex justify-between items-center border-b-2 border-gray-100 pb-2">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Category</span>
                 <span className="font-bold uppercase tracking-widest text-sm">{selectedCandidate.category}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Points</span>
                 <span className="font-black font-display text-2xl">{selectedCandidate.totalPoints || 0}</span>
              </div>
            </div>
          </div>

          {/* Achievements List */}
          <div className="w-full md:w-2/3">
             <h2 className="text-5xl font-black font-display uppercase tracking-tight mb-8">Achievements</h2>
             {loadingResults && <p className="font-bold uppercase tracking-widest text-gray-500">Loading achievements...</p>}
             {!loadingResults && candidateResults.length === 0 && (
               <EmptyState icon="🏆" title="No achievements yet" message="Results will appear once published." />
             )}
             {!loadingResults && candidateResults.length > 0 && (
               <div className="space-y-6">
                 {candidateResults.map((result, i) => result.programme && (
                   <motion.div key={result._id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                     className="bg-[var(--festival-white)] p-6 border-2 border-[var(--border)] flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                     <div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--festival-red)] block mb-1">{result.programme?.category || 'Programme'}</span>
                       <p className="text-2xl font-black font-display uppercase tracking-tight leading-none mb-3">{result.programme?.name || 'Programme unavailable'}</p>
                       <div className="flex gap-4">
                          {result.rank && <span className="font-bold uppercase text-sm border-2 border-[var(--festival-black)] px-3 py-1">Rank: {result.rank}</span>}
                          {result.grade && <span className="font-bold uppercase text-sm border-2 border-[var(--festival-black)] px-3 py-1 bg-gray-100">Grade: {result.grade}</span>}
                       </div>
                     </div>
                     <Link to={`/programmes/${result.programme?._id}/results/${result._id}/certificate`}
                       className="shrink-0 px-6 py-4 bg-[var(--festival-black)] text-[var(--festival-white)] font-bold uppercase tracking-widest text-xs hover:bg-[var(--festival-red)] transition-colors border-2 border-[var(--border)] text-center">
                       View Certificate
                     </Link>
                   </motion.div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;