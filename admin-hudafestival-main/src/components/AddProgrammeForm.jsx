import React, { useState } from 'react';
import api from '../services/api';

const AddProgrammeForm = ({ onFormSubmit, onFormCancel, categoryName, categories = [] }) => {
  const [formData, setFormData] = useState({ 
    code: '',
    name: '', 
    type: '', 
    stageType: 'stage',
    participantsRaw: '',
    date: '',
    selectedCategory: categoryName || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const programmeTypes = ['Stage', 'Non-Stage', 'Starred', 'Group', 'General', 'Special'];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.type || !formData.date || !formData.selectedCategory || !formData.code || !formData.stageType || !formData.participantsRaw) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        type: formData.type,
        stageType: formData.stageType,
        participantsRaw: formData.participantsRaw,
        date: formData.date,
        category: formData.selectedCategory,
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Programme Code</label>
          <input type="text" name="code" required onChange={handleChange} value={formData.code} placeholder="e.g. BS1"
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition uppercase" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Programme Name</label>
          <input type="text" name="name" required onChange={handleChange} value={formData.name}
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Type</label>
          <select name="type" required onChange={handleChange} value={formData.type}
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition">
            <option value="" disabled>Select Type</option>
            {programmeTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Stage Type</label>
          <select name="stageType" required onChange={handleChange} value={formData.stageType}
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition">
            <option value="stage">Stage</option>
            <option value="non-stage">Non-Stage</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Participants Quota</label>
          <input type="text" name="participantsRaw" required onChange={handleChange} value={formData.participantsRaw} placeholder="e.g. 1, 2, 1*7, -"
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Date and Time</label>
          <input type="datetime-local" name="date" required onChange={handleChange} value={formData.date}
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" />
        </div>
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
