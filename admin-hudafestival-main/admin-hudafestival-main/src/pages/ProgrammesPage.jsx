import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AddProgrammeForm from '../components/AddProgrammeForm';
import { ChevronLeft } from 'lucide-react';

const typeColors = {
  Stage: 'bg-blue-50 text-blue-700',
  'Non-Stage': 'bg-purple-50 text-purple-700',
  Starred: 'bg-yellow-50 text-yellow-700',
  Group: 'bg-green-50 text-green-700',
  General: 'bg-gray-100 text-gray-700',
  Special: 'bg-orange-50 text-orange-700',
};

const ProgrammesPage = () => {
  const [programmes, setProgrammes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA'];

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
    <tr key={prog._id} className="hover:bg-[var(--color-admin-bg)] transition">
      <td className="px-6 py-4 text-sm font-medium text-[var(--color-text-heading)]">{prog.name}</td>
      <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[prog.type] || 'bg-gray-100 text-gray-700'}`}>{prog.type}</span></td>
      <td className="px-6 py-4 text-sm text-[var(--color-text-body)]">{new Date(prog.date).toLocaleString()}</td>
      <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${prog.isResultPublished ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{prog.isResultPublished ? 'Published' : 'Pending'}</span></td>
      <td className="px-6 py-4"><button onClick={() => handleDelete(prog._id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition">Delete</button></td>
    </tr>
  );

  if (loading) return <p className="p-8 text-[var(--color-text-body)]">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  if (!selectedCategory) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mb-6">Select a Category</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat} onClick={() => setSelectedCategory(cat)}
              className="p-5 bg-white rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer transition group">
              <h2 className="text-lg font-semibold text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)] transition">{cat}</h2>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline mb-4 transition">
        <ChevronLeft size={16} /> Back to Categories
      </button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Programmes — {selectedCategory}</h1>
        <button onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl transition">
          + Add Programme
        </button>
      </div>
      <DataTable headers={headers} data={filteredProgrammes} renderRow={renderRow} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add Programme to ${selectedCategory}`}>
        <AddProgrammeForm onFormSubmit={handleFormSubmit} onFormCancel={() => setIsModalOpen(false)} categoryName={selectedCategory} />
      </Modal>
    </div>
  );
};

export default ProgrammesPage;
