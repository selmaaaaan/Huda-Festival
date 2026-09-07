import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AddCandidateForm from '../components/AddCandidate';
import Button from '../components/Button';
import { ChevronRight, Users } from 'lucide-react';

const CandidatesPage = () => {
  const [teams, setTeams] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA'];

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isTeamLeader = userInfo?.role === 'team_leader';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamsRes, candidatesRes] = await Promise.all([api.get('/teams'), api.get('/candidates')]);
        setTeams(teamsRes.data);
        setCandidates(candidatesRes.data);

        if (isTeamLeader && teamsRes.data.length === 1) {
          setSelectedTeam(teamsRes.data[0]);
        }
      } catch (err) {
        setError('Failed to fetch initial data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isTeamLeader]);

  const handleFormSubmit = () => { setIsModalOpen(false); api.get('/candidates').then(res => setCandidates(res.data)); };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try { await api.delete(`/candidates/${id}`); api.get('/candidates').then(res => setCandidates(res.data)); } catch { setError('Failed to delete candidate.'); }
    }
  };

  // If team_leader, filter locally just in case backend doesn't filter perfectly, though backend should.
  // Actually, backend filters candidates if team_leader.
  let filteredCandidates = candidates;
  if (!isTeamLeader && selectedTeam) {
    filteredCandidates = filteredCandidates.filter(c => c.team?._id === selectedTeam._id);
  }
  if (selectedCategory) {
    filteredCandidates = filteredCandidates.filter(c => c.category === selectedCategory);
  }

  const headers = ['Image', 'Admission No', 'Name', 'Points', 'Actions'];
  const renderRow = (candidate) => (
    <tr key={candidate._id} className="hover:bg-[var(--color-surface-elevated)] transition">
      <td className="px-6 py-4"><img src={candidate.image?.url || `https://ui-avatars.com/api/?name=${candidate.name}`} alt={candidate.name} className="w-10 h-10 rounded-full object-cover bg-[var(--color-surface)] border border-[var(--color-border)]" /></td>
      <td className="px-6 py-4 text-sm text-[var(--color-text-heading)]">{candidate.admissionNo}</td>
      <td className="px-6 py-4 text-sm font-medium text-[var(--color-text-heading)]">
        <div className="flex items-center gap-2">
          {candidate.team && (
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: candidate.team.color || '#ccc' }} title={candidate.team.name}></span>
          )}
          {candidate.name}
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-[var(--color-text-heading)]">{candidate.totalPoints || 0}</td>
      <td className="px-6 py-4 text-sm">
        {!isTeamLeader && (
          <button onClick={() => handleDelete(candidate._id)} className="text-red-400 hover:text-red-300 transition text-sm font-medium">Delete</button>
        )}
      </td>
    </tr>
  );

  const Breadcrumbs = () => (
    <div className="text-sm mb-6 text-[var(--color-text-body)] flex items-center gap-2">
      {!isTeamLeader && (
        <span onClick={() => { setSelectedTeam(null); setSelectedCategory(null); }} className="hover:text-[var(--color-primary)] cursor-pointer transition">Teams</span>
      )}
      {selectedTeam && (
        <>
          {!isTeamLeader && <ChevronRight size={14} />}
          <span onClick={() => setSelectedCategory(null)} className="hover:text-[var(--color-primary)] cursor-pointer transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTeam.color || '#ccc' }}></span>
            {selectedTeam.name}
          </span>
        </>
      )}
      {selectedCategory && <><ChevronRight size={14} /><span className="font-medium text-[var(--color-text-heading)]">{selectedCategory}</span></>}
    </div>
  );

  if (loading) return <p className="p-8 text-[var(--color-text-body)]">Loading data...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">{isTeamLeader ? 'My Team Candidates' : 'Candidates'}</h1>
        {!isTeamLeader && <Button onClick={() => setIsModalOpen(true)}>+ Add Candidate</Button>}
      </div>

      {!selectedTeam && !isTeamLeader ? (
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-4">Select a Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <div key={team._id} onClick={() => setSelectedTeam(team)}
                className="relative p-5 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer transition group overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: team.color || 'var(--color-primary)' }}></div>
                <h2 className="text-lg font-semibold text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)] transition ml-2">{team.name}</h2>
                <p className="text-sm text-[var(--color-text-body)] mt-1 ml-2">Total Points: {team.totalPoints || 0}</p>
              </div>
            ))}
          </div>
        </div>
      ) : !selectedCategory ? (
        <div>
          <Breadcrumbs />
          <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-4">Select a Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <Breadcrumbs />
          <DataTable headers={headers} data={filteredCandidates} renderRow={renderRow} />
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedTeam && selectedCategory ? `Add Candidate to ${selectedTeam.name} (${selectedCategory})` : 'Add Candidate'}>
        <div className="text-[var(--color-text-body)]">
           <AddCandidateForm onFormSubmit={handleFormSubmit} onFormCancel={() => setIsModalOpen(false)} teamId={selectedTeam?._id} categoryName={selectedCategory} teams={teams} categories={categories} />
        </div>
      </Modal>
    </div>
  );
};

export default CandidatesPage;
