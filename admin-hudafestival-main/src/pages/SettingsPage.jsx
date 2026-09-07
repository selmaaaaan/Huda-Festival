import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const SettingsPage = () => {
  const [teams, setTeams] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);

  // Forms state
  const [teamForm, setTeamForm] = useState({ name: '', color: '#000000' });
  const [leaderForm, setLeaderForm] = useState({ userName: '', password: '', team: '' });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsRes, leadersRes] = await Promise.all([
        api.get('/teams').catch(() => ({ data: [] })),
        api.get('/auth/team-leaders').catch(() => ({ data: [] }))
      ]);
      setTeams(teamsRes.data || []);
      setTeamLeaders(leadersRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Team Actions
  const handleOpenTeamModal = (team = null) => {
    setError('');
    if (team) {
      setEditingTeam(team);
      setTeamForm({ name: team.name, color: team.color || '#000000' });
    } else {
      setEditingTeam(null);
      setTeamForm({ name: '', color: '#000000' });
    }
    setShowTeamModal(true);
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editingTeam) {
        await api.put(`/teams/${editingTeam._id}`, teamForm);
      } else {
        await api.post('/teams', teamForm);
      }
      setShowTeamModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving team');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteTeam = (team) => {
    setDeletingTeam(team);
    setShowConfirmDelete(true);
  };

  const handleDeleteTeam = async () => {
    try {
      await api.delete(`/teams/${deletingTeam._id}`);
      setShowConfirmDelete(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting team');
    }
  };

  // Leader Actions
  const handleOpenLeaderModal = () => {
    setError('');
    setLeaderForm({ userName: '', password: '', team: '' });
    setShowLeaderModal(true);
  };

  const handleSaveLeader = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/create-team-leader', leaderForm);
      setShowLeaderModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating team leader');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage teams and team leaders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Teams Section */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="px-4 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">Teams</h2>
            <Button onClick={() => handleOpenTeamModal()} variant="primary" className="py-1 px-3 text-sm">
              <Plus size={16} className="mr-1" /> Add Team
            </Button>
          </div>
          <div className="p-4 space-y-3">
            {teams.length === 0 ? (
              <div className="text-sm text-[var(--color-text-muted)] text-center py-4">No teams found.</div>
            ) : (
              teams.map(team => (
                <div key={team._id} className="flex items-center justify-between p-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: team.color || '#ccc' }}></div>
                    <span className="font-medium text-[var(--color-text-heading)]">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenTeamModal(team)} className="p-1.5 text-[var(--color-text-muted)] hover:text-blue-500 rounded-md hover:bg-blue-500/10">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => confirmDeleteTeam(team)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 rounded-md hover:bg-red-500/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Leaders Section */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="px-4 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">Team Leaders</h2>
            <Button onClick={handleOpenLeaderModal} variant="primary" className="py-1 px-3 text-sm">
              <Plus size={16} className="mr-1" /> Add Leader
            </Button>
          </div>
          <div className="p-4 space-y-3">
            {teamLeaders.length === 0 ? (
              <div className="text-sm text-[var(--color-text-muted)] text-center py-4">No team leaders found.</div>
            ) : (
              teamLeaders.map(leader => {
                const leaderTeam = teams.find(t => t._id === leader.team);
                return (
                  <div key={leader._id} className="flex items-center justify-between p-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                    <div>
                      <div className="font-medium text-[var(--color-text-heading)]">{leader.userName}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Team: {leaderTeam?.name || leader.team || 'None'}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Team Modal */}
      <Modal open={showTeamModal} onClose={() => setShowTeamModal(false)} title={editingTeam ? 'Edit Team' : 'Add Team'}>
        <form onSubmit={handleSaveTeam} className="space-y-4">
          {error && <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Team Name</label>
            <input 
              type="text" 
              required
              value={teamForm.name} 
              onChange={e => setTeamForm({...teamForm, name: e.target.value})}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Team Color</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={teamForm.color} 
                onChange={e => setTeamForm({...teamForm, color: e.target.value})}
                className="w-12 h-10 p-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded cursor-pointer"
              />
              <span className="text-sm text-[var(--color-text-muted)]">{teamForm.color}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowTeamModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Save Team</Button>
          </div>
        </form>
      </Modal>

      {/* Leader Modal */}
      <Modal open={showLeaderModal} onClose={() => setShowLeaderModal(false)} title="Add Team Leader">
        <form onSubmit={handleSaveLeader} className="space-y-4">
          {error && <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Username</label>
            <input 
              type="text" 
              required
              value={leaderForm.userName} 
              onChange={e => setLeaderForm({...leaderForm, userName: e.target.value})}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Password</label>
            <input 
              type="password" 
              required
              value={leaderForm.password} 
              onChange={e => setLeaderForm({...leaderForm, password: e.target.value})}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Assign Team</label>
            <select
              required
              value={leaderForm.team}
              onChange={e => setLeaderForm({...leaderForm, team: e.target.value})}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Select a team...</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowLeaderModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Create Leader</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={showConfirmDelete}
        title="Delete Team"
        message={`Are you sure you want to delete ${deletingTeam?.name}?`}
        onConfirm={handleDeleteTeam}
        onCancel={() => setShowConfirmDelete(false)}
        confirmText="Delete"
      />
    </div>
  );
};

export default SettingsPage;
