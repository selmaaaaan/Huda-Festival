import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { SectionHeading, FilterPills, EmptyState } from '../components/ui';
import api from '../services/api';

// Accent Colors Pool
const ACCENT_COLORS = [
  'var(--festival-red)',
  'var(--festival-orange)',
  'var(--festival-purple)',
  'var(--festival-teal)',
  'var(--festival-yellow)'
];

const ProgrammeCard = ({ programme, index }) => {
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div 
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={prefersReducedMotion ? {} : { y: -8, rotate: index % 2 === 0 ? 1.5 : -1.5, scale: 1.02, boxShadow: '16px 16px 0px 0px rgba(23,23,23,1)' }}
      transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : (index % 10) * 0.05, ease: "easeOut" }}
      className="group relative bg-[var(--festival-cream)] border-2 border-[var(--border)] transition-colors duration-300 flex flex-col"
    >
      <div className="h-4 w-full border-b-2 border-[var(--border)]" style={{ backgroundColor: accentColor }} />
      
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-6">
          <span 
            className="px-3 py-1 text-xs font-bold uppercase tracking-widest border-2 border-[var(--border)]"
            style={{ backgroundColor: accentColor, color: 'white', borderColor: 'var(--border)' }}
          >
            {programme.category}
          </span>
          <span className="text-4xl font-black font-display text-gray-200">
            {(index + 1).toString().padStart(2, '0')}
          </span>
        </div>
        
        <h3 className="text-2xl md:text-3xl font-black font-display uppercase tracking-tight leading-none mb-4 group-hover:text-[var(--festival-red)] transition-colors">
          {programme.name}
        </h3>
        
        <div className="flex gap-4 mt-auto pt-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</span>
            <span className="font-medium text-sm">{programme.type}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Format</span>
            <span className="font-medium text-sm">{programme.format}</span>
          </div>
        </div>

        <Link 
          to={`/programmes/${programme._id}/results`}
          className="mt-8 flex items-center justify-between border-t-2 border-[var(--border)] pt-4 font-bold uppercase tracking-widest text-sm group/link hover:text-[var(--festival-red)]"
        >
          {programme.isResultPublished ? 'View Results' : 'Programme Info'}
          <svg className="w-5 h-5 transform transition-transform group-hover/link:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

const ProgrammesPage = () => {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const { data } = await api.get('/programmes');
        setProgrammes(data);
      } catch (err) {
        setError('Failed to fetch programmes');
      } finally {
        setLoading(false);
      }
    };
    fetchProgrammes();
  }, []);

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

  const filteredProgrammes = activeCategory === 'All' 
    ? (programmes || []) 
    : (programmes || []).filter(p => p.category === activeCategory);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-display text-2xl uppercase font-black">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-display text-2xl uppercase font-black text-[var(--festival-red)]">{error}</div>;

  return (
    <div className="min-h-screen bg-[var(--festival-cream)] py-24 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <SectionHeading subtitle="Talents Take Centre Stage">
            Explore <br/>
            <span className="text-[var(--festival-red)]">Programmes</span>
          </SectionHeading>
          
          <div className="flex-shrink-0 lg:max-w-2xl overflow-hidden">
            <FilterPills 
              options={categories} 
              selected={activeCategory} 
              onChange={setActiveCategory} 
            />
          </div>
        </div>

        {filteredProgrammes.length === 0 ? (
          <EmptyState 
            icon="🎪"
            title="No Programmes Found" 
            message={`There are no programmes scheduled under the ${activeCategory} category yet.`} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProgrammes.map((programme, index) => (
              <ProgrammeCard key={programme._id} programme={programme} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgrammesPage;
