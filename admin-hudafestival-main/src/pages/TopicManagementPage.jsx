import { useAlert } from '../context/AlertContext';
import React, { useState, useEffect, useMemo } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, CheckCircle, XCircle, Edit2, X, Trash2 } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = ['All', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'];

export default function TopicManagementPage() {
  const confirmAction = useConfirm();
  const alertAction = useAlert();

  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  
  const [topicMode, setTopicMode] = useState('none');
  const [topicListRaw, setTopicListRaw] = useState('');
  
  const [programmeTopics, setProgrammeTopics] = useState([]);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editTopicText, setEditTopicText] = useState('');
  const [editTopicAttachment, setEditTopicAttachment] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [modalRegistrations, setModalRegistrations] = useState([]);
  const [newTopicForm, setNewTopicForm] = useState({ candidateId: '', teamId: '', topic: '', attachment: '' });

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

  const openRegisterModal = async () => {
    if (!selectedProgramme) return;
    try {
      const { data } = await api.get(`/registrations?programme=${selectedProgramme._id}&limit=1000`);
      setModalRegistrations(data.registrations || []);
      setNewTopicForm({ candidateId: '', teamId: '', topic: '', attachment: '' });
      setIsRegisterModalOpen(true);
    } catch(e) {
      alertAction('Failed to fetch registrations');
    }
  };

  const handleRegisterTopic = async () => {
    try {
      const payload = {
        programmeId: selectedProgramme._id,
        teamId: newTopicForm.teamId,
        topic: newTopicForm.topic,
        attachment: newTopicForm.attachment
      };
      if (selectedProgramme.format !== 'Group') {
        payload.candidateId = newTopicForm.candidateId;
      }
      await api.post('/topic-registrations', payload);
      alertAction('Topic registered successfully!');
      setIsRegisterModalOpen(false);
      fetchProgrammeTopics(selectedProgramme._id);
    } catch(e) {
      alertAction(e.response?.data?.message || 'Failed to register topic');
    }
  };
  
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
      alertAction('Settings saved!');
      await fetchProgrammes();
    } catch (e) {
      alertAction(e.response?.data?.message || 'Failed to save settings');
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
      alertAction(e.response?.data?.message || 'Failed to review topic');
    }
  };

  const startEditTopic = (topicObj) => {
    setEditingTopicId(topicObj._id);
    setEditTopicText(topicObj.topic);
    setEditTopicAttachment(topicObj.attachment || '');
  };

  const saveTopicText = async (id) => {
    try {
      await api.patch(`/topic-registrations/${id}`, { topic: editTopicText, attachment: editTopicAttachment });
      setEditingTopicId(null);
      if (selectedProgramme) fetchProgrammeTopics(selectedProgramme._id);
    } catch (e) {
      alertAction(e.response?.data?.message || 'Failed to update topic');
    }
  };

  const handleDeleteTopic = async (id) => {
    const confirmed = await confirmAction("Confirm", 'Are you sure you want to delete this topic registration?');
      if (!confirmed) return;
    try {
      await api.delete(`/topic-registrations/${id}`);
      if (selectedProgramme) fetchProgrammeTopics(selectedProgramme._id);
    } catch (e) {
      alertAction(e.response?.data?.message || 'Failed to delete topic');
    }
  };

  const filteredProgrammes = programmes.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchTopic = (p.topicMode && p.topicMode !== 'none') || (selectedProgramme && selectedProgramme._id === p._id);
    return matchCat && matchTopic;
  });

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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Programmes</h2>
              <select 
                onChange={(e) => {
                  const p = programmes.find(x => x._id === e.target.value);
                  if (p) selectProgramme(p);
                  e.target.value = "";
                }}
                className="text-xs px-2 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded outline-none w-32 text-[var(--color-text-heading)] focus:border-[var(--color-primary)] truncate"
                defaultValue=""
              >
                <option value="" disabled>+ Add Programme</option>
                {programmes
                  .filter(p => !p.topicMode || p.topicMode === 'none')
                  .sort((a,b) => (a.category + a.name).localeCompare(b.category + b.name))
                  .map(p => (
                    <option key={p._id} value={p._id}>{p.category} - {p.name}</option>
                  ))
                }
              </select>
            </div>
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
                className={`p-3 rounded-lg cursor-pointer border transition-colors group ${
                  selectedProgramme?._id === prog._id 
                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' 
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                }`}
              >
                <div className="flex justify-between items-start">
                    <div className="font-medium text-sm text-[var(--color-text-heading)]">{prog.name} <span className="opacity-50 text-xs ml-1">({prog.code})</span></div>
                    <button 
                        onClick={async (e) => {
                            e.stopPropagation();
                            const confirmed = await confirmAction('Confirm', 'Remove this programme from topic management?');
                            if (confirmed) {
                                api.patch(`/programmes/${prog._id}/topic-settings`, { topicMode: 'none', topicList: [] })
                                   .then(() => {
                                       fetchProgrammes();
                                       if (selectedProgramme?._id === prog._id) setSelectedProgramme(null);
                                   })
                                   .catch(err => alertAction(err.response?.data?.message || 'Failed'));
                            }
                        }}
                        className="text-[var(--color-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from Topic Management"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
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
                      <option value="fixed">Fixed / Shared</option>
                      <option value="exclusive">Exclusive</option>
                    </select>
                  </div>
                  
                  {(topicMode === 'fixed' || topicMode === 'exclusive') && (
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
                  <div className="flex items-center gap-3">
                    <button onClick={openRegisterModal} className="px-3 py-1 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-md hover:bg-[var(--color-primary-dark)] transition-colors">
                      + Register Topic
                    </button>
                    <div className="text-xs bg-[var(--color-surface-elevated)] px-3 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]">
                      {programmeTopics.length} Total
                    </div>
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
                            {topic.createdAt && <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Submitted: {new Date(topic.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>}
                          </div>
                          <StatusBadge status={topic.status} />
                        </div>
                        
                        <div className="p-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                          {editingTopicId === topic._id ? (
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-2 flex-1">
                                      <input 
                                        type="text" 
                                        className="px-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)]" 
                                        value={editTopicText} 
                                        onChange={e => setEditTopicText(e.target.value)} 
                                        placeholder="Topic Text"
                                      />
                                      <input 
                                        type="text" 
                                        className="px-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-primary)]" 
                                        value={editTopicAttachment} 
                                        onChange={e => setEditTopicAttachment(e.target.value)} 
                                        placeholder="Attachment URL"
                                      />
                                    </div>
                              <Button variant="primary" onClick={() => saveTopicText(topic._id)} className="py-1.5 px-3 text-xs">Save</Button>
                              <Button variant="ghost" onClick={() => setEditingTopicId(null)} className="py-1.5 px-3 text-xs text-red-500 hover:bg-red-500/10">Cancel</Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <div className="flex flex-col">
        <span className="text-sm font-medium text-[var(--color-primary)]">{topic.topic}</span>
        {topic.attachment && (
            <a href={topic.attachment} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 truncate max-w-xs">
                {topic.attachment}
            </a>
        )}
    </div>
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
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
          <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Register Topic for {selectedProgramme?.name}</h3>
              <button onClick={() => setIsRegisterModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              {selectedProgramme?.format === 'Group' ? (
                <div>
                  <label className="block text-xs font-bold mb-1">Select Team</label>
                  <select className="w-full p-2 border rounded" value={newTopicForm.teamId} onChange={e => setNewTopicForm({...newTopicForm, teamId: e.target.value})}>
                    <option value="">-- Select Team --</option>
                    {modalRegistrations.filter(r => r.status !== 'rejected').map(r => (
                      <option key={r._id} value={r.team?._id}>{r.team?.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold mb-1">Select Candidate</label>
                  <select className="w-full p-2 border rounded" value={newTopicForm.candidateId} onChange={e => {
                      const candId = e.target.value;
                      const reg = modalRegistrations.find(r => r.candidates?.some(c => c._id === candId));
                      setNewTopicForm({...newTopicForm, candidateId: candId, teamId: reg ? reg.team?._id : ''});
                  }}>
                    <option value="">-- Select Candidate --</option>
                    {modalRegistrations.filter(r => r.status !== 'rejected').flatMap(r => r.candidates || []).map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">Topic</label>
                {(topicMode === 'fixed' || topicMode === 'exclusive') ? (
                  <select className="w-full p-2 border rounded" value={newTopicForm.topic} onChange={e => setNewTopicForm({...newTopicForm, topic: e.target.value})}>
                    <option value="">-- Select Topic --</option>
                    {topicListRaw.split('\n').map(t => t.trim()).filter(Boolean).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" className="w-full p-2 border rounded" placeholder="Enter topic" value={newTopicForm.topic} onChange={e => setNewTopicForm({...newTopicForm, topic: e.target.value})} />
                )}
              </div>

              {topicMode === 'free-text' && (
                <div>
                  <label className="block text-xs font-bold mb-1">Attachment (URL)</label>
                  <input type="text" className="w-full p-2 border rounded" placeholder="https://..." value={newTopicForm.attachment} onChange={e => setNewTopicForm({...newTopicForm, attachment: e.target.value})} />
                </div>
              )}

              <Button onClick={handleRegisterTopic} className="w-full justify-center">Submit Topic</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}