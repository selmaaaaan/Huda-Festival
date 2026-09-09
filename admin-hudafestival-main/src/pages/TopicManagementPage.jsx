import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

export default function TopicManagementPage() {
  const [programmes, setProgrammes] = useState([]);
  const [pendingTopics, setPendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  
  const [topicMode, setTopicMode] = useState('none');
  const [topicListRaw, setTopicListRaw] = useState('');
  
  const fetchProgrammes = async () => {
    try {
      const { data } = await api.get('/programmes');
      setProgrammes(data);
    } catch(e) {}
  };

  const fetchPendingTopics = async () => {
    try {
      const { data } = await api.get('/topic-registrations/pending');
      setPendingTopics(data);
    } catch(e) {}
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchProgrammes(), fetchPendingTopics()]);
      setLoading(false);
    };
    load();
  }, []);

  const selectProgramme = (prog) => {
    setSelectedProgramme(prog);
    setTopicMode(prog.topicMode || 'none');
    setTopicListRaw(prog.topicList ? prog.topicList.join('\n') : '');
  };

  const saveTopicSettings = async () => {
    if (!selectedProgramme) return;
    try {
      const topicList = topicListRaw.split('\n').map(s => s.trim()).filter(s => s);
      await api.patch(`/programmes/${selectedProgramme._id}/topic-settings`, {
        topicMode,
        topicList
      });
      alert('Settings saved!');
      await fetchProgrammes();
    } catch (e) {
      alert('Failed to save settings');
    }
  };

  const reviewTopic = async (id, status) => {
    const reason = status === 'rejected' ? prompt('Rejection reason (optional):') : '';
    if (status === 'rejected' && reason === null) return;
    try {
      await api.patch(`/topic-registrations/${id}/review`, {
        status,
        reviewNote: reason
      });
      await fetchPendingTopics();
    } catch (e) {
      alert('Failed to review topic');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 h-full flex flex-col space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Topic Management</h1>
      </div>

      <div className="flex gap-6 h-[calc(100vh-140px)]">
        {/* Left Panel - Programmes */}
        <div className="w-1/2 flex flex-col bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <h2 className="text-base font-semibold">Programme Topic Settings</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)] p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="border-r border-[var(--color-border)] pr-4 overflow-y-auto">
                {programmes.map(prog => (
                  <div 
                    key={prog._id}
                    onClick={() => selectProgramme(prog)}
                    className={`p-3 rounded-lg cursor-pointer mb-2 border ${
                      selectedProgramme?._id === prog._id 
                        ? 'bg-[var(--color-primary)] text-white border-transparent' 
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
                    }`}
                  >
                    <div className="font-medium text-sm">{prog.name}</div>
                    <div className="text-xs opacity-80 mt-1">
                      Mode: <span className="font-semibold uppercase">{prog.topicMode || 'none'}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pl-2 flex flex-col">
                {selectedProgramme ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[var(--color-primary)]">{selectedProgramme.name}</h3>
                    <div>
                      <label className="block text-sm font-medium mb-1">Topic Mode</label>
                      <select 
                        value={topicMode}
                        onChange={e => setTopicMode(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm"
                      >
                        <option value="none">None</option>
                        <option value="free-text">Free Text</option>
                        <option value="fixed-list">Fixed List</option>
                      </select>
                    </div>
                    {topicMode === 'fixed-list' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Allowed Topics (one per line)</label>
                        <textarea
                          rows={6}
                          value={topicListRaw}
                          onChange={e => setTopicListRaw(e.target.value)}
                          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm"
                          placeholder="Topic A\nTopic B..."
                        />
                      </div>
                    )}
                    <Button onClick={saveTopicSettings} variant="primary" className="w-full">
                      <Save size={16} /> Save Settings
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-[var(--color-text-muted)] mt-10 text-center">
                    Select a programme to configure
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Pending Topics */}
        <div className="w-1/2 flex flex-col bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex justify-between items-center">
            <h2 className="text-base font-semibold">Pending Approvals</h2>
            <div className="text-xs bg-[var(--color-surface-elevated)] px-3 py-1 rounded-full border border-[var(--color-border)]">
              {pendingTopics.length} Pending
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {pendingTopics.length === 0 ? (
              <div className="text-center text-sm text-[var(--color-text-muted)] mt-10">No pending topics.</div>
            ) : (
              pendingTopics.map(topic => (
                <div key={topic._id} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold">{topic.programme?.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Team: {topic.team?.name}</div>
                      {topic.candidate && <div className="text-xs text-[var(--color-text-muted)]">Candidate: {topic.candidate.name}</div>}
                    </div>
                    <StatusBadge status={topic.status} />
                  </div>
                  
                  <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg text-sm font-medium border border-[var(--color-primary)]/20">
                    Topic: {topic.topic}
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="danger" onClick={() => reviewTopic(topic._id, 'rejected')}>
                      <XCircle size={14} /> Reject
                    </Button>
                    <Button variant="success" onClick={() => reviewTopic(topic._id, 'approved')}>
                      <CheckCircle size={14} /> Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
