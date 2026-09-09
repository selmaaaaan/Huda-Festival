import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { SectionHeading, FilterPills, EmptyState } from '../components/ui';
import api from '../services/api';

const ResultsPage = () => {
  const { programmeId } = useParams();
  const [programme, setProgramme] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');

  // Exact Bylaw Categories + All
  const categories = [
    { label: 'All', value: 'All' },
    { label: 'BIDĀYAH', value: 'BIDĀYAH' },
    { label: 'ʾŪLĀ', value: 'ʾŪLĀ' },
    { label: 'THĀNIYAH', value: 'THĀNIYAH' },
    { label: 'THĀNAWIYYAH', value: 'THĀNAWIYYAH' },
    { label: 'ʿĀLIYAH', value: 'ʿĀLIYAH' },
    { label: 'KULLIYYAH', value: 'KULLIYYAH' }
  ];

  const statuses = [
    { label: 'All', value: 'All' },
    { label: 'Published', value: 'Published' }
  ];

  useEffect(() => {
    const fetchResults = async () => {
      if (!programmeId) return;
      try {
        setLoading(true);
        const [progRes, resultsRes] = await Promise.all([
          api.get(`/programmes/${programmeId}`),
          api.get(`/programmes/${programmeId}/results`),
        ]);
        setProgramme(progRes.data);
        const resultsWithCandidates = await Promise.all(
          resultsRes.data.map(async (result) => {
            const candidateRes = await api.get(`/candidates/${result.candidate}`);
            return { ...result, candidate: candidateRes.data };
          })
        );
        resultsWithCandidates.sort((a, b) => {
          if (a.rank === null) return 1;
          if (b.rank === null) return -1;
          return a.rank - b.rank;
        });
        setResults(resultsWithCandidates);
      } catch { setError('Failed to load results.'); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, [programmeId]);

  const getRankNumber = (rank) => {
    if (rank === 1) return '01';
    if (rank === 2) return '02';
    if (rank === 3) return '03';
    return '--';
  };

  const filteredResults = results.filter(r => {
    if (searchTerm) {
       const term = searchTerm.toLowerCase();
       if (!r.candidate.name.toLowerCase().includes(term) && !r.candidate.admissionNo.toLowerCase().includes(term)) return false;
    }
    // Since this is scoped to a programme, category filtering might just check if it matches the programme's category
    if (activeCategory !== 'All' && programme?.category !== activeCategory) return false;
    // Status filter is a bit redundant if we only fetch published results publicly, but we'll include it for the UI contract
    return true;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center font-display text-2xl uppercase font-black">Loading Results...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-display text-2xl uppercase font-black text-[var(--festival-red)]">{error}</div>;

  return (
    <div className="min-h-screen bg-[var(--festival-white)] py-24 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <Link to="/programmes" className="font-bold uppercase tracking-widest text-sm mb-12 flex items-center gap-2 hover:text-[var(--festival-red)] transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Programmes
        </Link>

        <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-16 border-b-2 border-[var(--border)] pb-8 gap-8">
          <div>
            <span className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-2 block">{programme?.category} • {programme?.type}</span>
            <h1 className="text-5xl md:text-7xl font-black font-display uppercase tracking-tighter leading-none">
              {programme?.name} <br/> <span className="text-[var(--festival-red)]">RESULTS</span>
            </h1>
          </div>
          <p className="font-bold text-sm uppercase tracking-widest text-right hidden lg:block">
            Every effort <br/> deserves a spotlight
          </p>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
          <div className="lg:col-span-6 relative">
             <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search participant or admission no..."
                className="w-full px-6 py-4 border-2 border-[var(--border)] font-bold text-lg focus:outline-none focus:ring-4 focus:ring-[var(--festival-red)] shadow-[6px_6px_0px_0px_rgba(23,23,23,1)] bg-white" />
             <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="lg:col-span-6 flex flex-col sm:flex-row gap-6">
             <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Category</span>
                <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="w-full px-4 py-3 border-2 border-[var(--border)] font-bold bg-white focus:outline-none focus:ring-4 focus:ring-[var(--festival-red)]">
                   {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
             </div>
             <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Status</span>
                <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)} className="w-full px-4 py-3 border-2 border-[var(--border)] font-bold bg-white focus:outline-none focus:ring-4 focus:ring-[var(--festival-red)]">
                   {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
             </div>
          </div>
        </div>

        {/* Results List */}
        {filteredResults.length === 0 ? (
          <EmptyState icon="🎯" title="No matching results" message="Try adjusting your search or filters." />
        ) : (
          <div className="space-y-4">
            {filteredResults.map((result, i) => { const prefersReducedMotion = useReducedMotion(); return (
              <motion.div key={result._id} initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }} whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }} viewport={{ once: true }} whileHover={prefersReducedMotion ? {} : { y: -4, rotate: i % 2 === 0 ? 0.5 : -0.5, scale: 1.01 }} transition={{ delay: prefersReducedMotion ? 0 : i * 0.05, ease: 'easeOut' }}
                className="bg-white border-2 border-[var(--border)] p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-gray-50 transition-colors shadow-[6px_6px_0px_0px_rgba(23,23,23,1)]">
                
                <div className="flex items-center gap-6 flex-1 min-w-0">
                   <div className="w-16 h-16 shrink-0 flex items-center justify-center font-black font-display text-3xl text-[var(--festival-red)]">
                      {getRankNumber(result.rank)}
                   </div>
                   <div className="w-12 h-12 rounded-full border-2 border-[var(--border)] overflow-hidden shrink-0 hidden sm:block">
                      <img src={result.candidate.image.url} alt={result.candidate.name} className="w-full h-full object-cover grayscale" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-black font-display uppercase tracking-tight truncate">{result.candidate.name}</h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1 truncate">
                        {programme?.name} • {programme?.category}
                      </p>
                   </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto shrink-0 justify-between md:justify-end">
                   <div className="flex flex-col items-start md:items-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Grade</span>
                      <span className="font-black font-display text-2xl">{result.grade || '--'}</span>
                   </div>
                   <Link to={`/programmes/${programmeId}/results/${result._id}/certificate`}
                     className="px-6 py-3 bg-[var(--festival-black)] text-[var(--festival-white)] font-bold uppercase tracking-widest text-xs border-2 border-[var(--border)] hover:bg-[var(--festival-red)] transition-colors">
                     View
                   </Link>
                </div>
              </motion.div>);})}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;