import React, { useState } from 'react';
import api from '../services/api';

const AddProgrammeForm = ({ onFormSubmit, onFormCancel, categoryName, categories = [] }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    type: '', 
    date: '',
    selectedCategory: categoryName || '',
    format: 'Individual',
    groupSize: 1,
    maxParticipants: '' // Leave empty for Infinity, but user inputs a number
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const programmeTypes = ['Stage', 'Non-Stage', 'Starred', 'Group', 'General', 'Special'];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.type || !formData.date || !formData.selectedCategory) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        date: formData.date,
        category: formData.selectedCategory,
        format: formData.format,
        groupSize: Number(formData.groupSize) || 1,
        maxParticipants: formData.maxParticipants ? Number(formData.maxParticipants) : Infinity
      };
      await api.post('/programmes', payload);
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

      {!categoryName && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Category</label>
          <select name="selectedCategory" value={formData.selectedCategory} onChange={handleChange} required
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-heading)]">Programme Name</label>
        <input type="text" name="name" required onChange={handleChange}
          className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Type</label>
          <select name="type" required onChange={handleChange} defaultValue=""
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition">
            <option value="" disabled>Select Type</option>
            {programmeTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Format</label>
          <select name="format" required onChange={handleChange} value={formData.format}
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition">
            <option value="Individual">Individual</option>
            <option value="Group">Group</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Group Size</label>
          <input type="number" name="groupSize" min="1" required onChange={handleChange} value={formData.groupSize}
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Team Quota</label>
          <input type="number" name="maxParticipants" min="1" onChange={handleChange} value={formData.maxParticipants} placeholder="No Limit"
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-heading)]">Date and Time</label>
        <input type="datetime-local" name="date" required onChange={handleChange}
          className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" />
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
