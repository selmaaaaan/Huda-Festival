import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, CalendarDays, Clock, MapPin, Timer } from 'lucide-react';

const SchedulePage = () => {
  const [programmes, setProgrammes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/programmes');
        setProgrammes(data);
      } catch (err) {
        setError('Failed to fetch schedule data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProgrammes();
  }, []);

  const filteredProgrammes = programmes.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--color-public-bg)] py-8 mt-16 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-text-heading)]">Event Schedule</h1>
          <p className="text-[var(--color-text-body)] mt-2">Find timings and venues for all upcoming programmes</p>
        </div>

        <div className="max-w-md mx-auto mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-[var(--color-text-body)]" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--color-border)] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition shadow-sm"
            placeholder="Search events or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-center text-[var(--color-text-body)]">Loading schedule...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredProgrammes.length === 0 ? (
          <div className="text-center py-12">
             <p className="text-lg font-semibold text-[var(--color-text-heading)]">No events found</p>
             <p className="text-[var(--color-text-body)]">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProgrammes.map(prog => (
              <div key={prog._id} className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-[var(--color-text-heading)] leading-tight">{prog.name}</h3>
                  <span className="bg-[var(--color-badge-yellow)]/20 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-3">
                    {prog.category || 'General'}
                  </span>
                </div>
                
                <div className="space-y-2 mt-4">
                  {prog.date && (
                    <div className="flex items-center text-sm text-[var(--color-text-body)]">
                      <CalendarDays size={16} className="mr-2 text-[var(--color-primary)]" />
                      <span>{new Date(prog.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {prog.startTime && (
                    <div className="flex items-center text-sm text-[var(--color-text-body)]">
                      <Clock size={16} className="mr-2 text-[var(--color-primary)]" />
                      <span>{prog.startTime}</span>
                    </div>
                  )}
                  {prog.venue && (
                    <div className="flex items-center text-sm text-[var(--color-text-body)]">
                      <MapPin size={16} className="mr-2 text-[var(--color-primary)]" />
                      <span>{prog.venue}</span>
                    </div>
                  )}
                  {prog.duration && (
                    <div className="flex items-center text-sm text-[var(--color-text-body)]">
                      <Timer size={16} className="mr-2 text-[var(--color-primary)]" />
                      <span>{prog.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
