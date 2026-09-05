import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AddCandidateForm from '../components/AddCandidate';
import EmptyState from '../components/EmptyState';
import { Users, ChevronRight } from 'lucide-react';

const CandidatesPage = () => {
  const [teams, setTeams] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamsRes, candidatesRes] = await Promise.all([api.get('/teams'), api.get('/candidates')]);
        setTeams(teamsRes.data);
        setCandidates(candidatesRes.data);
      } catch (err) {
        setError('Failed to fetch initial data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFormSubmit = () => { setIsModalOpen(false); api.get('/candidates').then(res => setCandidates(res.data)); };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try { await api.delete(`/candidates/${id}`); api.get('/candidates').then(res => setCandidates(res.data)); } catch { setError('Failed to delete candidate.'); }
    }
  };

  const filteredCandidates = selectedTeam ? candidates.filter(c => c.team?._id === selectedTeam._id && c.category === selectedCategory) : [];
  const headers = ['Image', 'Admission No', 'Name', 'Points', 'Actions'];
  const renderRow = (candidate) => (
    <tr key={candidate._id} className="hover:bg-[var(--color-admin-bg)] transition">
      <td className="px-6 py-4"><img src={candidate.image.url} alt={candidate.name} className="w-10 h-10 rounded-full object-cover" /></td>
      <td className="px-6 py-4 text-sm text-[var(--color-text-heading)]">{candidate.admissionNo}</td>
      <td className="px-6 py-4 text-sm font-medium text-[var(--color-text-heading)]">{candidate.name}</td>
      <td className="px-6 py-4 text-sm font-semibold text-[var(--color-text-heading)]">{candidate.totalPoints}</td>
      <td className="px-6 py-4 text-sm"><button onClick={() => handleDelete(candidate._id)} className="text-red-500 hover:text-red-700 transition text-sm font-medium">Delete</button></td>
    </tr>
  );

  const Breadcrumbs = () => (
    <div className="text-sm mb-6 text-[var(--color-text-body)] flex items-center gap-2">
      <span onClick={() => { setSelectedTeam(null); setSelectedCategory(null); }} className="hover:text-[var(--color-primary)] cursor-pointer transition">Teams</span>
      {selectedTeam && <><ChevronRight size={14} /><span onClick={() => setSelectedCategory(null)} className="hover:text-[var(--color-primary)] cursor-pointer transition">{selectedTeam.name}</span></>}
      {selectedCategory && <><ChevronRight size={14} /><span className="font-medium text-[var(--color-text-heading)]">{selectedCategory}</span></>}
    </div>
  );

  if (loading) return <p className="p-8 text-[var(--color-text-body)]">Loading data...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  if (!selectedTeam) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mb-6">Select a Team</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <div key={team._id} onClick={() => setSelectedTeam(team)}
              className="p-5 bg-white rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer transition group">
              <h2 className="text-lg font-semibold text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)] transition">{team.name}</h2>
              <p className="text-sm text-[var(--color-text-body)] mt-1">Total Points: {team.totalPoints}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="p-8">
        <Breadcrumbs />
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mb-6">Select a Category</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <Breadcrumbs />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Manage Candidates</h1>
        <button onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl transition">
          + Add Candidate
        </button>
      </div>
      <DataTable headers={headers} data={filteredCandidates} renderRow={renderRow} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add Candidate to ${selectedTeam.name} (${selectedCategory})`}>
        <AddCandidateForm onFormSubmit={handleFormSubmit} onFormCancel={() => setIsModalOpen(false)} teamId={selectedTeam._id} categoryName={selectedCategory} />
      </Modal>
    </div>
  );
};

export default CandidatesPage;
