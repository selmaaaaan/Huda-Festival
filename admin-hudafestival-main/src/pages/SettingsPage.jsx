import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const THEME_COLORS = [
  { name: 'Red', bg: '#ef4444', hover: '#dc2626' },
  { name: 'Blue', bg: '#3b82f6', hover: '#2563eb' },
  { name: 'Green', bg: '#22c55e', hover: '#16a34a' },
  { name: 'Purple', bg: '#a855f7', hover: '#9333ea' },
  { name: 'Orange', bg: '#f97316', hover: '#ea580c' },
  { name: 'Teal', bg: '#14b8a6', hover: '#0d9488' }
];

const SettingsPage = () => {
  const [settings, setSettings] = useState({ 
    isRegistrationOpen: true, 
    topicRegistrationEnabled: true,
    maintenanceMode: false, 
    maintenanceMessage: '',
    categoryRegistrationStatus: {
      'BIDĀYAH': true, 'ŪLĀ': true, 'THĀNIYAH': true, 'THĀNAWIYYAH': true, 'ĀLIYAH': true, 'KULLIYYAH': true
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showConfirmToggleReg, setShowConfirmToggleReg] = useState(false);
  const [showConfirmToggleTopic, setShowConfirmToggleTopic] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setSettings({
          isRegistrationOpen: res.data.isRegistrationOpen ?? true,
          topicRegistrationEnabled: res.data.topicRegistrationEnabled ?? true,
          maintenanceMode: res.data.maintenanceMode ?? false,
          maintenanceMessage: res.data.maintenanceMessage ?? '',
          categoryRegistrationStatus: res.data.categoryRegistrationStatus || {
            'BIDĀYAH': true, 'ŪLĀ': true, 'THĀNIYAH': true, 'THĀNAWIYYAH': true, 'ĀLIYAH': true, 'KULLIYYAH': true
          },
          venues: res.data.venues || []
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load settings');
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

  const handleToggleTopic = async () => {
    try {
      const newVal = !settings.topicRegistrationEnabled;
      await api.patch('/settings', { topicRegistrationEnabled: newVal });
      setSettings(s => ({ ...s, topicRegistrationEnabled: newVal }));
      setShowConfirmToggleTopic(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating settings');
    }
  };

  const handleToggleCategory = async (cat) => {
    try {
      const currentStatus = settings.categoryRegistrationStatus || {};
      const newStatus = { ...currentStatus, [cat]: !(currentStatus[cat] !== false) };
      await api.patch('/settings', { categoryRegistrationStatus: newStatus });
      setSettings(s => ({ ...s, categoryRegistrationStatus: newStatus }));
    } catch (err) {
      console.error(err);
      setError('Failed to update category registration status');
    }
  };

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

  const applyTheme = (theme) => {
    document.documentElement.style.setProperty('--color-primary', theme.bg);
    document.documentElement.style.setProperty('--color-primary-hover', theme.hover);
    localStorage.setItem('huda-admin-primary-theme', JSON.stringify(theme));
    setSettings({ ...settings }); 
  };

  const currentTheme = JSON.parse(localStorage.getItem('huda-admin-primary-theme')) || THEME_COLORS[0];

  return (
    <div className="p-6 w-full space-y-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Settings</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : (
        <>
          {/* Theme Preferences */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Theme Preferences</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">Select your preferred accent color for the application.</p>
            <div className="flex gap-4">
              {THEME_COLORS.map(theme => (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  className={`w-10 h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center \${currentTheme.name === theme.name ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg)] ring-[var(--color-text-heading)]' : ''}`}
                  style={{ backgroundColor: theme.bg }}
                  title={theme.name}
                />
              ))}
            </div>
          </div>

          {/* Registration Status */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-6">Registration Status</h2>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[var(--color-text-heading)] font-medium">Allow New Registrations</p>
                <p className="text-sm text-[var(--color-text-muted)]">When disabled, team leaders will see a "Closed" message and cannot register new candidates.</p>
              </div>
              <button 
                onClick={() => setShowConfirmToggleReg(true)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 \${settings.isRegistrationOpen ? 'bg-green-500' : 'bg-[var(--color-border)]'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${settings.isRegistrationOpen ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Category Toggles */}
            {settings.isRegistrationOpen && (
              <div className="mb-6 pt-6 border-t border-[var(--color-border)]">
                <p className="text-[var(--color-text-heading)] font-medium mb-4">Category-Wise Registration Status</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['BIDĀYAH', 'ŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ĀLIYAH', 'KULLIYYAH'].map(cat => {
                    const isOpen = settings.categoryRegistrationStatus ? settings.categoryRegistrationStatus[cat] !== false : true;
                    return (
                      <div key={cat} className="flex items-center justify-between bg-[var(--color-surface-elevated)] p-3 rounded-lg border border-[var(--color-border)]">
                        <span className="text-sm font-medium text-[var(--color-text-heading)]">{cat}</span>
                        <button 
                          onClick={() => handleToggleCategory(cat)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none \${isOpen ? 'bg-green-500' : 'bg-red-500'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform \${isOpen ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
              <div>
                <p className="text-[var(--color-text-heading)] font-medium">Allow Topic Registrations</p>
                <p className="text-sm text-[var(--color-text-muted)]">When disabled, team leaders cannot submit new topic registrations.</p>
              </div>
              <button 
                onClick={() => setShowConfirmToggleTopic(true)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 \${settings.topicRegistrationEnabled ? 'bg-green-500' : 'bg-[var(--color-border)]'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${settings.topicRegistrationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-6">Maintenance Mode</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--color-text-heading)] font-medium">Enable Maintenance Mode</p>
                <p className="text-sm text-[var(--color-text-muted)]">When enabled, the public site is hidden and displays the maintenance message. Admins can still log in.</p>
              </div>
              <button 
                onClick={handleToggleMaintenance}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none \${settings.maintenanceMode ? 'bg-red-500' : 'bg-[var(--color-border)]'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {settings.maintenanceMode && (
              <div className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-4">
                <label className="block text-sm font-medium text-[var(--color-text-heading)]">Maintenance Message</label>
                <textarea 
                  value={settings.maintenanceMessage || ''}
                  onChange={(e) => setSettings(s => ({ ...s, maintenanceMessage: e.target.value }))}
                  rows={3}
                  placeholder="e.g., We are currently updating the results. Please check back later."
                  className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-heading)]"
                />
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveMaintenanceMessage} loading={savingMaintenance} variant="primary">
                    Save Message
                  </Button>
                </div>
              </div>
            )}
          </div>

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

          <ConfirmDialog
            open={showConfirmToggleTopic}
            title={settings.topicRegistrationEnabled ? "Close Topic Registration" : "Open Topic Registration"}
            message={settings.topicRegistrationEnabled 
              ? "Are you sure you want to close topic registration? Team leaders will no longer be able to submit topics." 
              : "Are you sure you want to open topic registration? Team leaders will be able to submit topics again."}
            onConfirm={handleToggleTopic}
            onCancel={() => setShowConfirmToggleTopic(false)}
            confirmText={settings.topicRegistrationEnabled ? "Close Topic Registration" : "Open Topic Registration"}
          />
        </>
      )}
    </div>
  );
};

export default SettingsPage;
