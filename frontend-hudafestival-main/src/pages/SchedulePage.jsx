import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SectionHeading, FilterPills, EmptyState } from '../components/ui';
import api from '../services/api';

const SchedulePage = () => {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    { label: 'All', value: 'All' },
    { label: 'BIDĀYAH', value: 'BIDĀYAH' },
    { label: 'ʾŪLĀ', value: 'ʾŪLĀ' },
    { label: 'THĀNIYAH', value: 'THĀNIYAH' },
    { label: 'THĀNAWIYYAH', value: 'THĀNAWIYYAH' },
    { label: 'ʿĀLIYAH', value: 'ʿĀLIYAH' },
    { label: 'KULLIYYAH', value: 'KULLIYYAH' }
  ];

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const response = await api.get('/programmes');
        setProgrammes(response.data);
      } catch (error) {
        console.error('Error fetching programmes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgrammes();
  }, []);

  const filtered = activeCategory === 'All' 
    ? programmes 
    : programmes.filter(p => p.category === activeCategory);

  const scheduled = filtered.filter(p => p.date);
  const unscheduled = filtered.filter(p => !p.date);

  // Sort scheduled by date
  scheduled.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (loading) return <div className="min-h-screen flex items-center justify-center font-display text-2xl uppercase font-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-[var(--festival-cream)] py-24 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <SectionHeading subtitle="Different Voices. Same Tomorrow.">
            Festival <br/>
            <span className="text-[var(--festival-purple)]">Schedule</span>
          </SectionHeading>
          
          <div className="flex-shrink-0 lg:max-w-2xl overflow-hidden">
            <FilterPills 
              options={categories} 
              selected={activeCategory} 
              onChange={setActiveCategory} 
            />
          </div>
        </div>

        {scheduled.length === 0 && unscheduled.length === 0 ? (
          <EmptyState icon="⏳" title="No Schedule Yet" message="The schedule for this category has not been published yet." />
        ) : (
          <div className="space-y-24">
            {scheduled.length > 0 && (
              <div>
                <h3 className="text-2xl font-black font-display uppercase tracking-tight mb-8 border-b-2 border-[var(--border)] pb-4">Scheduled Events</h3>
                <div className="relative border-l-4 border-[var(--border)] ml-4 md:ml-0 md:border-l-0 md:border-t-4 md:flex md:flex-row md:overflow-x-auto md:pb-12 md:pt-8 md:gap-8 no-scrollbar">
                  {scheduled.map((prog, i) => { const prefersReducedMotion = useReducedMotion(); return (
                    <motion.div key={prog._id} initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }} whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }} whileHover={prefersReducedMotion ? {} : { y: -6, rotate: i % 2 === 0 ? 1 : -1, scale: 1.02 }}
                      viewport={{ once: true }}
                      transition={{ delay: (i % 5) * 0.1 }}
                      className="relative pl-8 md:pl-0 pt-8 md:pt-0 md:min-w-[300px] mb-12 md:mb-0"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-[-14px] md:left-auto md:-top-[42px] top-8 w-6 h-6 rounded-full border-4 border-[var(--border)] bg-[var(--festival-purple)]" />
                      
                      <div className="font-bold text-xl mb-4 font-display">
                        {new Date(prog.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="block text-sm text-gray-500 mt-1">
                          {new Date(prog.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="bg-white border-2 border-[var(--border)] p-6 shadow-[6px_6px_0px_0px_rgba(23,23,23,1)]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--festival-purple)] mb-2 block">{prog.category}</span>
                        <h4 className="text-xl font-black font-display uppercase tracking-tight leading-tight mb-2">{prog.name}</h4>
                        <p className="text-sm font-medium text-gray-600">Main Stage</p>
                      </div></motion.div>);})}
                </div>
              </div>
            )}

            {unscheduled.length > 0 && (
              <div>
                <h3 className="text-2xl font-black font-display uppercase tracking-tight mb-8 border-b-2 border-[var(--border)] pb-4">To Be Scheduled</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {unscheduled.map(prog => (
                    <div key={prog._id} className="border-2 border-dashed border-[var(--border)] p-6 bg-gray-50/50">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">{prog.category}</span>
                       <h4 className="text-lg font-bold font-display uppercase tracking-tight">{prog.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
