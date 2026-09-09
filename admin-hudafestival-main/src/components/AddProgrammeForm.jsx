import React, { useState } from 'react';
import api from '../services/api';

const AddProgrammeForm = ({ onFormSubmit, onFormCancel, categoryName, categories = [], initialData = null }) => {
  let initialDisplayType = '';
  if (initialData) {
    if (initialData.category === 'KULLIYYAH') initialDisplayType = 'Kulliyyah';
    else if (initialData.isStarred) initialDisplayType = 'Starred Programme';
    else if (initialData.format === 'Group' || initialData.type === 'Group') initialDisplayType = 'Group';
    else initialDisplayType = 'Individual';
  }

  const [formData, setFormData] = useState({ 
    code: initialData?.code || '',
    name: initialData?.name || '', 
    displayType: initialDisplayType || '', 
    stageType: initialData?.stageType || 'non-stage',
    participantsRaw: initialData?.participantsRaw || '',
    selectedCategory: initialData?.category || categoryName || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const displayTypes = ['Individual', 'Group', 'Starred Programme', 'Kulliyyah'];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.displayType || !formData.code || !formData.stageType || !formData.participantsRaw) {
      setError('Please fill all required fields.');
      return;
    }

    if (formData.displayType !== 'Kulliyyah' && !formData.selectedCategory) {
      setError('Please select a category.');
      return;
    }

    let format = 'Individual';
    let isStarred = false;
    let category = formData.selectedCategory;
    let type = formData.stageType === 'stage' ? 'Stage' : 'Non-Stage';

    if (formData.displayType === 'Group') {
        format = 'Group';
        type = 'Group';
    } else if (formData.displayType === 'Starred Programme') {
        isStarred = true;
        type = 'Starred';
    } else if (formData.displayType === 'Kulliyyah') {
        category = 'KULLIYYAH';
    }

    setLoading(true);
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        type,
        stageType: formData.stageType,
        participantsRaw: formData.participantsRaw,
        category,
        format,
        isStarred,
      };
      
      if (initialData) {
        await api.put(`/programmes/${initialData._id}`, payload);
      } else {
        await api.post('/programmes', payload);
      }
      onFormSubmit();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${initialData ? 'update' : 'add'} programme.`);
    } finally {
      setLoading(false);
    }
  };

  const isCategoryDisabled = formData.displayType === 'Kulliyyah';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="p-3 text-sm text-red-800 bg-red-50 rounded-xl border border-red-200">{error}</p>}

      {!categoryName && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Category</label>
          <select 
            name="selectedCategory" 
            value={isCategoryDisabled ? 'KULLIYYAH' : formData.selectedCategory} 
            onChange={handleChange} 
            required={!isCategoryDisabled}
            disabled={isCategoryDisabled}
            className={`w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition ${isCategoryDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {isCategoryDisabled && <p className="text-xs text-[var(--color-text-muted)] mt-1">Category is set to Kulliyyah for this type</p>}
        </div>
      )}

      {categoryName && isCategoryDisabled && categoryName !== 'KULLIYYAH' && (
          <p className="text-sm text-red-500">Warning: You are adding a Kulliyyah type programme under the {categoryName} category. It will be moved to KULLIYYAH.</p>
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
          <select name="displayType" required onChange={handleChange} value={formData.displayType}
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition">
            <option value="" disabled>Select Type</option>
            {displayTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-heading)]">Stage / Non-Stage</label>
          <div className="flex items-center h-[42px] gap-3">
             <span className={`text-sm ${formData.stageType === 'non-stage' ? 'font-semibold text-[var(--color-text-heading)]' : 'text-[var(--color-text-muted)]'}`}>Non-Stage</span>
             <button
               type="button"
               onClick={() => setFormData(f => ({ ...f, stageType: f.stageType === 'stage' ? 'non-stage' : 'stage' }))}
               className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${formData.stageType === 'stage' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}
             >
               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.stageType === 'stage' ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
             <span className={`text-sm ${formData.stageType === 'stage' ? 'font-semibold text-[var(--color-text-heading)]' : 'text-[var(--color-text-muted)]'}`}>Stage</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-heading)]">Participants Quota</label>
        <input type="text" name="participantsRaw" required onChange={handleChange} value={formData.participantsRaw} placeholder="e.g. 1, 2, 1*7, -"
          className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border)] mt-4">
        <button type="button" onClick={onFormCancel}
          className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-heading)] bg-gray-100 rounded-xl hover:bg-gray-200 transition">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl transition disabled:opacity-50">
          {loading ? 'Saving...' : (initialData ? 'Update Programme' : 'Add Programme')}
        </button>
      </div>
    </form>
  );
};

export default AddProgrammeForm;
