import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, Plus, Power, Clock } from 'lucide-react';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/all');
      setNotifications(res.data);
    } catch (err) {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/notifications', { title, body });
      setSuccess('Notification published successfully!');
      setTitle('');
      setBody('');
      fetchNotifications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create notification.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await api.patch(`/notifications/${id}/toggle`);
      // Update local state directly for snappy UI
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isActive: !currentStatus } : n));
    } catch (err) {
      alert('Failed to toggle notification status.');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Notifications</h1>
        <p className="text-sm text-[var(--color-text-body)] mt-1">Manage global alerts pushed to the public website.</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-800/40 text-red-400 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-900/20 border border-green-800/40 text-green-400 rounded-lg text-sm">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
              <Plus size={18} className="text-[var(--color-primary)]" />
              New Notification
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Schedule Update"
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-1">Body</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Details of the announcement..."
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] resize-none h-24"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full" disabled={!title.trim() || !body.trim() || submitting} loading={submitting}>
                Publish
              </Button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
            <Bell size={18} className="text-[var(--color-text-muted)]" />
            History
          </h2>
          
          {loading ? (
            <p className="text-[var(--color-text-muted)]">Loading notifications...</p>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif._id} className={`p-4 rounded-xl border transition-colors ${notif.isActive ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/30' : 'bg-[var(--color-surface-elevated)] border-[var(--color-border)] opacity-75'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${notif.isActive ? 'text-[var(--color-text-heading)]' : 'text-[var(--color-text-body)]'}`}>{notif.title}</h3>
                        {notif.isActive && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full">Active</span>}
                      </div>
                      <p className="text-sm text-[var(--color-text-body)] whitespace-pre-wrap mb-3">{notif.body}</p>
                      <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(notif.createdAt).toLocaleString()} 
                        {notif.createdBy?.userName && ` • by ${notif.createdBy.userName}`}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleToggle(notif._id, notif.isActive)}
                      className={`p-2 rounded-full shrink-0 transition-colors ${notif.isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-heading)]'}`}
                      title={notif.isActive ? "Deactivate" : "Reactivate"}
                    >
                      <Power size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Bell}
              title="No notifications" 
              description="You haven't published any notifications yet." 
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
