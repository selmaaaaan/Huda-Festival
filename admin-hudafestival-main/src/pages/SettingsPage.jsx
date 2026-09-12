import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import DataImportSection from '../components/DataImportSection';

const SettingsPage = () => {
  const [teams, setTeams] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [settings, setSettings] = useState({ isRegistrationOpen: true, maintenanceMode: false, maintenanceMessage: '' });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmToggleReg, setShowConfirmToggleReg] = useState(false);
  
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
      const [teamsRes, leadersRes, settingsRes] = await Promise.all([
        api.get('/teams').catch(() => ({ data: [] })),
        api.get('/auth/team-leaders').catch(() => ({ data: [] })),
        api.get('/settings').catch(() => ({ data: {} }))
      ]);
      setTeams(teamsRes.data || []);
      setTeamLeaders(leadersRes.data || []);
      if (settingsRes.data) {
        setSettings({
          isRegistrationOpen: settingsRes.data.isRegistrationOpen ?? true,
          maintenanceMode: settingsRes.data.maintenanceMode ?? false,
          maintenanceMessage: settingsRes.data.maintenanceMessage ?? '',
          venues: settingsRes.data.venues || []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRegistration = async () => {
    try {
      const updatedStatus = !settings.isRegistrationOpen;
      await api.patch('/settings', { isRegistrationOpen: updatedStatus });
      setSettings(s => ({ ...s, isRegistrationOpen: updatedStatus }));
      setShowConfirmToggleReg(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update registration status');
    }
  };

  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const handleToggleMaintenance = async () => {
    try {
      const updatedStatus = !settings.maintenanceMode;
      await api.patch('/settings', { maintenanceMode: updatedStatus });
      setSettings(s => ({ ...s, maintenanceMode: updatedStatus }));
    } catch (err) {
      setError('Failed to update maintenance mode');
    }
  };

  const handleSaveMaintenanceMessage = async () => {
    try {
      setSavingMaintenance(true);
      await api.patch('/settings', { maintenanceMessage: settings.maintenanceMessage });
    } catch (err) {
      setError('Failed to save message');
    } finally {
      setSavingMaintenance(false);
    }
  };

  const [venueForm, setVenueForm] = useState('');
  const handleAddVenue = async () => {
    if(!venueForm.trim()) return;
    try {
        const newVenues = [...(settings.venues || []), venueForm.trim()];
        await api.patch('/settings', { venues: newVenues });
        setSettings(s => ({ ...s, venues: newVenues }));
        setVenueForm('');
    } catch(err) {
        setError('Failed to add venue');
    }
  };

  const handleDeleteVenue = async (venueToDelete) => {
    if(!window.confirm(`Delete venue "${venueToDelete}"?`)) return;
    try {
        const newVenues = (settings.venues || []).filter(v => v !== venueToDelete);
        await api.patch('/settings', { venues: newVenues });
        setSettings(s => ({ ...s, venues: newVenues }));
    } catch(err) {
        setError('Failed to delete venue');
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
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Settings</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Registration Status</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--color-text-heading)] font-medium">Allow New Registrations</p>
            <p className="text-sm text-[var(--color-text-muted)]">When disabled, team leaders will see a "Closed" message and cannot register new candidates.</p>
          </div>
          <button 
            onClick={() => setShowConfirmToggleReg(true)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${settings.isRegistrationOpen ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isRegistrationOpen ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Maintenance Mode</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[var(--color-text-heading)] font-medium">Enable Maintenance Mode</p>
            <p className="text-sm text-[var(--color-text-muted)]">When enabled, the public site is hidden and displays the maintenance message. Admins can still log in.</p>
          </div>
          <button 
            onClick={handleToggleMaintenance}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        
        {settings.maintenanceMode && (
          <div className="space-y-2 mt-4 pt-4 border-t border-[var(--color-border)]">
            <label className="block text-sm font-medium text-[var(--color-text-heading)]">Maintenance Message</label>
            <textarea 
              value={settings.maintenanceMessage || ''}
              onChange={(e) => setSettings(s => ({ ...s, maintenanceMessage: e.target.value }))}
              rows={3}
              placeholder="e.g., We are currently updating the results. Please check back later."
              className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveMaintenanceMessage} loading={savingMaintenance} variant="primary">
                Save Message
              </Button>
            </div>
          </div>
        )}
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
                const leaderTeamName = leader.team?.name || teams.find(t => t._id === leader.team)?.name || 'None';
                return (
                  <div key={leader._id} className="flex items-center justify-between p-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                    <div>
                      <div className="font-medium text-[var(--color-text-heading)]">{leader.userName}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Team: {leaderTeamName}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Venues Section */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden col-span-1 lg:col-span-2">
          <div className="px-4 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">Venues</h2>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={venueForm} 
                onChange={e => setVenueForm(e.target.value)}
                placeholder="New Venue Name"
                className="px-3 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddVenue(); }}
              />
              <Button onClick={handleAddVenue} variant="primary" className="py-1 px-3 text-sm">
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {(!settings.venues || settings.venues.length === 0) ? (
              <div className="text-sm text-[var(--color-text-muted)] text-center py-4 col-span-full">No venues found.</div>
            ) : (
              settings.venues.map(venue => (
                <div key={venue} className="flex items-center justify-between p-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                  <div className="font-medium text-[var(--color-text-heading)]">{venue}</div>
                  <button onClick={() => handleDeleteVenue(venue)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 rounded-md hover:bg-red-500/10">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <DataImportSection />

        {/* Team Modal */}
      <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title={editingTeam ? 'Edit Team' : 'Add Team'}>
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
      <Modal isOpen={showLeaderModal} onClose={() => setShowLeaderModal(false)} title="Add Team Leader">
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

      <ConfirmDialog
        open={showConfirmToggleReg}
        title={settings.isRegistrationOpen ? "Close Registration" : "Open Registration"}
        message={settings.isRegistrationOpen 
          ? "Are you sure you want to close registration? Team leaders will no longer be able to assign candidates to programmes." 
          : "Are you sure you want to open registration? Team leaders will be able to start assigning candidates again."}
        onConfirm={handleToggleRegistration}
        onCancel={() => setShowConfirmToggleReg(false)}
        confirmText={settings.isRegistrationOpen ? "Close Registration" : "Open Registration"}
      />
    </div>
  );
};

export default SettingsPage;
