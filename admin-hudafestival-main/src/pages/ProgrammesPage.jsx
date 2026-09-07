import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AddProgrammeForm from '../components/AddProgrammeForm';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { ChevronLeft } from 'lucide-react';

const ProgrammesPage = () => {
  const [programmes, setProgrammes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = ['BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'];

  const fetchProgrammes = async () => { try { setLoading(true); const { data } = await api.get('/programmes'); setProgrammes(data); } catch { setError('Failed to fetch programmes.'); } finally { setLoading(false); } };
  useEffect(() => { fetchProgrammes(); }, []);
  const handleFormSubmit = () => { setIsModalOpen(false); fetchProgrammes(); };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this programme?')) {
      try { await api.delete(`/programmes/${id}`); fetchProgrammes(); } catch { setError('Failed to delete programme.'); }
    }
  };

  const filteredProgrammes = selectedCategory ? programmes.filter(p => p.category === selectedCategory) : [];
  const headers = ['Name', 'Type', 'Date', 'Published', 'Actions'];
  const renderRow = (prog) => (
    <tr key={prog._id} className="hover:bg-[var(--color-surface-elevated)] transition">
      <td className="px-6 py-4 text-sm font-medium text-[var(--color-text-heading)]">{prog.name}</td>
      <td className="px-6 py-4"><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]">{prog.type}</span></td>
      <td className="px-6 py-4 text-sm text-[var(--color-text-body)]">{new Date(prog.date).toLocaleString()}</td>
      <td className="px-6 py-4"><StatusBadge status={prog.isResultPublished ? 'published' : 'pending'} /></td>
      <td className="px-6 py-4"><button onClick={() => handleDelete(prog._id)} className="text-red-400 hover:text-red-300 text-sm font-medium transition">Delete</button></td>
    </tr>
  );

  if (loading) return <p className="p-8 text-[var(--color-text-body)]">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Programmes</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Programme</Button>
      </div>

      {!selectedCategory ? (
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-4">Select a Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat} onClick={() => setSelectedCategory(cat)}
                className="p-5 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer transition group">
                <h2 className="text-lg font-semibold text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)] transition">{cat}</h2>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] mb-4 transition">
            <ChevronLeft size={16} /> Back to Categories
          </button>
          <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-4">Programmes — {selectedCategory}</h2>
          <DataTable headers={headers} data={filteredProgrammes} renderRow={renderRow} />
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCategory ? `Add Programme to ${selectedCategory}` : 'Add Programme'}>
        <div className="text-[var(--color-text-body)]">
           <AddProgrammeForm onFormSubmit={handleFormSubmit} onFormCancel={() => setIsModalOpen(false)} categoryName={selectedCategory} categories={categories} />
        </div>
      </Modal>
    </div>
  );
};

export default ProgrammesPage;
