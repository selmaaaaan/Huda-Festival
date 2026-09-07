import React, { useState } from 'react';
import api from '../services/api';

const AddCandidateForm = ({ onFormSubmit, onFormCancel, teamId, categoryName, teams = [], categories = [], initialData = null }) => {
  const [formData, setFormData] = useState({ 
    admissionNo: initialData?.admissionNo || '', 
    name: initialData?.name || '',
    selectedTeam: initialData?.team?._id || initialData?.team || teamId || '',
    selectedCategory: initialData?.category || categoryName || ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImageFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!initialData && !imageFile) {
      setError('Please select an image.');
      return;
    }
    if (!formData.admissionNo || !formData.name || !formData.selectedTeam || !formData.selectedCategory) {
      setError('Please fill all text fields.');
      return;
    }
    setLoading(true);
    const submissionData = new FormData();
    submissionData.append('team', formData.selectedTeam);
    submissionData.append('category', formData.selectedCategory);
    submissionData.append('admissionNo', formData.admissionNo);
    submissionData.append('name', formData.name);
    if (imageFile) {
      submissionData.append('image', imageFile);
    }

    try {
      if (initialData) {
        await api.put(`/candidates/${initialData._id}`, submissionData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/candidates', submissionData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onFormSubmit();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${initialData ? 'update' : 'add'} candidate.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="p-3 text-sm font-medium text-red-800 bg-red-50 rounded-xl border border-red-200">{error}</p>}

      {!teamId && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Team</label>
          <select name="selectedTeam" value={formData.selectedTeam} onChange={handleChange} required
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition">
            <option value="">Select Team</option>
            {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
      )}

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
        <label className="block text-sm font-medium text-[var(--color-text-heading)]">Admission Number</label>
        <input type="text" name="admissionNo" required onChange={handleChange}
          className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition" />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-heading)]">Candidate Name</label>
        <input type="text" name="name" required onChange={handleChange}
          className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition" />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-heading)]">Candidate Image</label>
        <input type="file" name="image" required onChange={handleFileChange}
          className="w-full text-sm text-[var(--color-text-body)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[var(--color-primary)] hover:file:bg-red-100 transition" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onFormCancel}
          className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-heading)] bg-gray-100 rounded-xl hover:bg-gray-200 transition">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl transition disabled:opacity-50">
          {loading ? 'Saving...' : (initialData ? 'Update Candidate' : 'Add Candidate')}
        </button>
      </div>
    </form>
  );
};

export default AddCandidateForm;
