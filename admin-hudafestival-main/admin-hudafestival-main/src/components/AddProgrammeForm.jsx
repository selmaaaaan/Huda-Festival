import React, { useState } from 'react';
import api from '../services/api';

const AddProgrammeForm = ({ onFormSubmit, onFormCancel, categoryName }) => {
  const [formData, setFormData] = useState({ name: '', type: '', date: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const programmeTypes = ['Stage', 'Non-Stage', 'Starred', 'Group', 'General', 'Special'];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.type || !formData.date) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/programmes', { ...formData, category: categoryName });
      onFormSubmit();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add programme.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="p-3 text-sm text-red-800 bg-red-50 rounded-xl border border-red-200">{error}</p>}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-heading)]">Programme Name</label>
        <input type="text" name="name" required onChange={handleChange}
          className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition" />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-heading)]">Type</label>
        <select name="type" required onChange={handleChange} defaultValue=""
          className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition">
          <option value="" disabled>Select Programme Type</option>
          {programmeTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-heading)]">Date and Time</label>
        <input type="datetime-local" name="date" required onChange={handleChange}
          className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onFormCancel}
          className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-heading)] bg-gray-100 rounded-xl hover:bg-gray-200 transition">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl transition disabled:opacity-50">
          {loading ? 'Adding...' : 'Add Programme'}
        </button>
      </div>
    </form>
  );
};

export default AddProgrammeForm;
