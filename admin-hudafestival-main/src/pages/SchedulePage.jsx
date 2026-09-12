import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, Save, Trash2 } from 'lucide-react';
import api from '../services/api';
import ProgrammeCodePicker from '../components/ProgrammeCodePicker';
import Button from '../components/Button';

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [venue, setVenue] = useState('');
  const [time, setTime] = useState('');
  const [venuesList, setVenuesList] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, programmesRes] = await Promise.all([
        api.get('/settings'),
        api.get('/programmes')
      ]);
      setVenuesList(settingsRes.data?.venues || []);
      setProgrammes(programmesRes.data || []);
      if (settingsRes.data?.venues?.length > 0 && !venue) {
        setVenue(settingsRes.data.venues[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load schedule data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!selectedProgramme || !venue || !time || !selectedDate) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    setSubmitting(true);
    
    try {
      // Create a Date object combining the date and time
      const [hours, minutes] = time.split(':');
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(parseInt(hours, 10));
      startDateTime.setMinutes(parseInt(minutes, 10));
      startDateTime.setSeconds(0);

      await api.patch(`/programmes/${selectedProgramme._id}/schedule`, {
        date: selectedDate,
        startTime: startDateTime,
        venue
      });
      
      // Refresh programmes list to update the schedule view below
      const res = await api.get('/programmes');
      setProgrammes(res.data);
      
      // Reset form but keep date and venue selected for convenience
      setSelectedProgramme(null);
      setTime('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSchedule = async (progId) => {
    if (!window.confirm('Clear schedule for this programme?')) return;
    try {
      await api.patch(`/programmes/${progId}/schedule`, {
        date: null,
        startTime: null,
        venue: null
      });
      const res = await api.get('/programmes');
      setProgrammes(res.data);
    } catch (err) {
      setError('Error removing schedule');
    }
  };

  const scheduledForDate = useMemo(() => {
    return programmes.filter(p => {
      if (!p.date) return false;
      const pDate = new Date(p.date).toISOString().split('T')[0];
      return pDate === selectedDate;
    }).sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      return new Date(a.startTime) - new Date(b.startTime);
    });
  }, [programmes, selectedDate]);

  return (
    <div className="p-6 w-full space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Schedule Builder</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Assign Slot</h2>
        <form onSubmit={handleSaveSchedule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input 
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-1">
             <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Programme</label>
             <ProgrammeCodePicker onSelect={setSelectedProgramme} selectedCode={selectedProgramme?.code} />
          </div>
          
          <div className="lg:col-span-1">
             <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Venue</label>
             <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <select
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] appearance-none"
              >
                <option value="">Select venue...</option>
                {venuesList.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Time</label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input 
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="lg:col-span-3 flex justify-end">
             <Button variant="primary" type="submit" loading={submitting}>
                <Save size={16} className="mr-2" /> Save Slot
             </Button>
          </div>

        </form>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">
            Schedule for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-[var(--color-text-muted)]">Loading schedule...</div>
        ) : scheduledForDate.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-text-muted)]">
            No programmes scheduled for this date.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {scheduledForDate.map(prog => (
              <div key={prog._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--color-surface-elevated)] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-2 rounded-lg text-center min-w-[90px]">
                    <div className="text-sm font-bold">
                      {prog.startTime ? new Date(prog.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-heading)] text-lg">{prog.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[var(--color-text-muted)]">
                       <span className="flex items-center gap-1"><MapPin size={14} /> {prog.venue || 'No Venue'}</span>
                       <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{prog.code}</span>
                       <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{prog.category}</span>
                       <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{prog.type}</span>
                    </div>
                  </div>
                </div>
                <div>
                   <button 
                     onClick={() => handleRemoveSchedule(prog._id)}
                     className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                     title="Remove from schedule"
                   >
                     <Trash2 size={18} />
                   </button>
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
