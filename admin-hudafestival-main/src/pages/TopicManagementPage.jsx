import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, CheckCircle, XCircle, Edit2, X, Trash2 } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = ['All', 'BIDAYAH', '?ULA', 'THANIYAH', 'THANAWIYYAH', '?ALIYAH', 'KULLIYYAH'];

export default function TopicManagementPage() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  
  const [topicMode, setTopicMode] = useState('none');
  const [topicListRaw, setTopicListRaw] = useState('');
  
  const [programmeTopics, setProgrammeTopics] = useState([]);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editTopicText, setEditTopicText] = useState('');

  const fetchProgrammes = async () => {
    try {
      const { data } = await api.get('/programmes');
      setProgrammes(data);
    } catch(e) {}
  };

  useEffect(() => {
    const load = async () => {
      await fetchProgrammes();
      setLoading(false);
    };
    load();
  }, []);

  const fetchProgrammeTopics = async (progId) => {
    try {
      const { data } = await api.get(`/topic-registrations/programme/${progId}`);
      setProgrammeTopics(data);
    } catch(e) {}
  };

  const selectProgramme = (prog) => {
    setSelectedProgramme(prog);
    setTopicMode(prog.topicMode || 'none');
    setTopicListRaw(prog.topicList ? prog.topicList.join('\n') : '');
    fetchProgrammeTopics(prog._id);
    setEditingTopicId(null);
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
      if (selectedProgramme) fetchProgrammeTopics(selectedProgramme._id);
    } catch (e) {
      alert('Failed to review topic');
    }
  };

  const startEditTopic = (topicObj) => {
    setEditingTopicId(topicObj._id);
    setEditTopicText(topicObj.topic);
  };

  const saveTopicText = async (id) => {
    try {
      await api.patch(`/topic-registrations/${id}`, { topic: editTopicText });
      setEditingTopicId(null);
      if (selectedProgramme) fetchProgrammeTopics(selectedProgramme._id);
    } catch (e) {
      alert('Failed to update topic');
    }
  };

  const handleDeleteTopic = async (id) => {
    if (!window.confirm('Are you sure you want to delete this topic registration?')) return;
    try {
      await api.delete(`/topic-registrations/${id}`);
      if (selectedProgramme) fetchProgrammeTopics(selectedProgramme._id);
    } catch (e) {
      alert('Failed to delete topic');
    }
  };

  const filteredProgrammes = programmes.filter(p => selectedCategory === 'All' || p.category === selectedCategory);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 h-full flex flex-col space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Topic Management</h1>
      </div>

      <div className="flex gap-6 h-[calc(100vh-140px)]">
        {/* Left Panel - Programmes */}
        <div className="w-1/3 flex flex-col bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <h2 className="text-sm font-semibold mb-3">Programmes</h2>
            <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 whitespace-nowrap rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-[var(--color-primary)] text-white' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredProgrammes.length === 0 && (
                <div className="text-sm text-[var(--color-text-muted)] text-center mt-4">No programmes found.</div>
            )}
            {filteredProgrammes.map(prog => (
              <div 
                key={prog._id}
                onClick={() => selectProgramme(prog)}
                className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                  selectedProgramme?._id === prog._id 
                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' 
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                }`}
              >
                <div className="font-medium text-sm text-[var(--color-text-heading)]">{prog.name}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1 flex justify-between">
                  <span>{prog.category}</span>
                  <span className="font-semibold uppercase">{prog.topicMode || 'none'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Settings and Submissions */}
        <div className="w-2/3 flex flex-col bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          {selectedProgramme ? (
            <>
              {/* Top Half: Topic Settings */}
              <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">{selectedProgramme.name} <span className="text-sm font-normal text-[var(--color-text-muted)]">({selectedProgramme.category})</span></h2>
                  <Button onClick={saveTopicSettings} variant="primary" className="py-1.5 px-4">
                    <Save size={16} className="mr-2" /> Save Settings
                  </Button>
                </div>
                
                <div className="flex gap-6">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium mb-2 text-[var(--color-text-muted)]">Topic Mode</label>
                    <select 
                      value={topicMode}
                      onChange={e => setTopicMode(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm focus:border-[var(--color-primary)] outline-none"
                    >
                      <option value="none">None</option>
                      <option value="free-text">Free Text</option>
                      <option value="fixed-list">Fixed List</option>
                    </select>
                  </div>
                  
                  {topicMode === 'fixed-list' && (
                    <div className="w-2/3">
                      <label className="block text-sm font-medium mb-2 text-[var(--color-text-muted)]">Allowed Topics (one per line)</label>
                      <textarea
                        rows={4}
                        value={topicListRaw}
                        onChange={e => setTopicListRaw(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm focus:border-[var(--color-primary)] outline-none resize-none"
                        placeholder="Topic A\nTopic B..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Half: Submitted Topics */}
              <div className="flex-1 flex flex-col min-h-0 bg-[var(--color-surface-elevated)]">
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface)]">
                  <h3 className="text-base font-semibold text-[var(--color-text-heading)]">Submitted Topics</h3>
                  <div className="text-xs bg-[var(--color-surface-elevated)] px-3 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]">
                    {programmeTopics.length} Total
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {programmeTopics.length === 0 ? (
                    <div className="text-center text-sm text-[var(--color-text-muted)] mt-10">No topics submitted for this programme yet.</div>
                  ) : (
                    programmeTopics.map(topic => (
                      <div key={topic._id} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-3 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-semibold text-[var(--color-text-heading)]">{topic.team?.name || 'Unknown Team'}</div>
                            {topic.candidate && <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Candidate: {topic.candidate.name}</div>}
                          </div>
                          <StatusBadge status={topic.status} />
                        </div>
                        
                        <div className="p-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                          {editingTopicId === topic._id ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="text"
                                value={editTopicText}
                                onChange={(e) => setEditTopicText(e.target.value)}
                                className="flex-1 px-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)]"
                              />
                              <Button variant="primary" onClick={() => saveTopicText(topic._id)} className="py-1.5 px-3 text-xs">Save</Button>
                              <Button variant="ghost" onClick={() => setEditingTopicId(null)} className="py-1.5 px-3 text-xs text-red-500 hover:bg-red-500/10">Cancel</Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <span className="text-sm font-medium text-[var(--color-primary)]">{topic.topic}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => startEditTopic(topic)}
                                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] p-1"
                                  title="Edit Topic Text"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteTopic(topic._id)}
                                  className="text-[var(--color-text-muted)] hover:text-red-500 p-1"
                                  title="Delete Topic"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {topic.status === 'pending' && (
                          <div className="flex gap-2 justify-end pt-2 border-t border-[var(--color-border)]">
                            <Button variant="danger" onClick={() => reviewTopic(topic._id, 'rejected')} className="py-1.5 px-3 text-xs">
                              <XCircle size={14} className="mr-1.5" /> Reject
                            </Button>
                            <Button variant="success" onClick={() => reviewTopic(topic._id, 'approved')} className="py-1.5 px-3 text-xs">
                              <CheckCircle size={14} className="mr-1.5" /> Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)] p-8 text-center">
              <Settings size={48} className="mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-1">Select a Programme</h3>
              <p className="text-sm">Choose a programme from the list to configure its topic settings and review submitted topics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
