'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Save, Trash2, Edit2 } from 'lucide-react';

type Topic = {
  id: number;
  label: string;
  isActive: boolean;
  maxUses: number | null;
};

type Program = {
  id: number;
  code: string;
  name: string;
  topicMode: string;
  topics: Topic[];
};

export default function TopicManager({ initialPrograms }: { initialPrograms: Program[] }) {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [expandedProgId, setExpandedProgId] = useState<number | null>(null);
  
  const [newTopicLabel, setNewTopicLabel] = useState('');
  const [newTopicMaxUses, setNewTopicMaxUses] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState<number | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateTopicMode = async (programId: number, mode: string) => {
    try {
      const res = await fetch(`/api/programs/${programId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicMode: mode }),
      });
      if (!res.ok) throw new Error('Failed to update topic mode');
      
      setPrograms(prev => prev.map(p => p.id === programId ? { ...p, topicMode: mode } : p));
      showToast('Topic mode updated', 'success');
      
      if (mode !== 'NONE') setExpandedProgId(programId);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const addTopic = async (programId: number) => {
    if (!newTopicLabel.trim()) return;
    
    try {
      const res = await fetch(`/api/programs/${programId}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          label: newTopicLabel.trim(), 
          maxUses: newTopicMaxUses ? parseInt(newTopicMaxUses) : null 
        }),
      });
      if (!res.ok) throw new Error('Failed to add topic');
      
      const { topic } = await res.json();
      setPrograms(prev => prev.map(p => p.id === programId ? { ...p, topics: [...p.topics, topic] } : p));
      
      setNewTopicLabel('');
      setNewTopicMaxUses('');
      setIsAddingTopic(null);
      showToast('Topic added', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const toggleTopicStatus = async (programId: number, topicId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/programs/${programId}/topics`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update topic');
      
      setPrograms(prev => prev.map(p => {
        if (p.id !== programId) return p;
        return {
          ...p,
          topics: p.topics.map(t => t.id === topicId ? { ...t, isActive: !currentStatus } : t)
        };
      }));
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Filter programs to only those that have a topicMode, or show all if search/filter is needed.
  // For admin efficiency, let's show programs that HAVE topics first, or just a simple list.
  const activeTopicPrograms = programs.filter(p => p.topicMode !== 'NONE');
  const inactiveTopicPrograms = programs.filter(p => p.topicMode === 'NONE');

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-3 rounded shadow-lg z-50 flex items-center gap-2 text-white ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}

      {/* Programs with Topics Enabled */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Programs with Topic Requirements</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {activeTopicPrograms.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No programs currently require topics.</div>
          ) : (
            activeTopicPrograms.map(prog => (
              <div key={prog.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-2 cursor-pointer flex-1"
                    onClick={() => setExpandedProgId(expandedProgId === prog.id ? null : prog.id)}
                  >
                    {expandedProgId === prog.id ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                    <div>
                      <span className="font-bold text-gray-900 mr-2">{prog.code}</span>
                      <span className="text-gray-600">{prog.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <select 
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
                      value={prog.topicMode}
                      onChange={(e) => updateTopicMode(prog.id, e.target.value)}
                    >
                      <option value="NONE">None</option>
                      <option value="FIXED_LIST">Fixed List</option>
                      <option value="FREE_TEXT">Free Text</option>
                    </select>
                  </div>
                </div>

                {expandedProgId === prog.id && (
                  <div className="mt-4 ml-7 pl-4 border-l-2 border-gray-100">
                    {prog.topicMode === 'FREE_TEXT' && (
                      <div className="text-sm text-gray-500 mb-2 italic">
                        This program accepts free-text topic submissions from Team Leaders. Fixed list topics below are ignored.
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {prog.topics.map(topic => (
                        <div key={topic.id} className={`flex items-center justify-between p-3 rounded border ${topic.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleTopicStatus(prog.id, topic.id, topic.isActive)}
                              className={`w-10 h-5 rounded-full relative transition-colors ${topic.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            >
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${topic.isActive ? 'left-[22px]' : 'left-0.5'}`}></div>
                            </button>
                            <span className={`font-medium ${!topic.isActive && 'line-through text-gray-500'}`}>{topic.label}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Limit: {topic.maxUses === null ? 'Unlimited' : topic.maxUses}
                          </div>
                        </div>
                      ))}
                    </div>

                    {isAddingTopic === prog.id ? (
                      <div className="mt-3 p-4 bg-gray-50 rounded border border-gray-200 flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Topic Label</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            value={newTopicLabel}
                            onChange={e => setNewTopicLabel(e.target.value)}
                            placeholder="e.g. Impact of AI on Society"
                            autoFocus
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Max Uses (optional)</label>
                          <input 
                            type="number" 
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            value={newTopicMaxUses}
                            onChange={e => setNewTopicMaxUses(e.target.value)}
                            placeholder="Unlimited"
                            min="1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => addTopic(prog.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                            Save
                          </button>
                          <button onClick={() => setIsAddingTopic(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm font-medium transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsAddingTopic(prog.id)}
                        className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        <Plus size={16} /> Add Topic
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Enable Topics for Other Programs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Enable Topics for Other Programs</h2>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2 text-right">Enable Mode</th>
              </tr>
            </thead>
            <tbody>
              {inactiveTopicPrograms.map(prog => (
                <tr key={prog.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{prog.code}</td>
                  <td className="px-4 py-3 text-gray-600">{prog.name}</td>
                  <td className="px-4 py-3 text-right">
                    <select 
                      className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                      value={prog.topicMode}
                      onChange={(e) => updateTopicMode(prog.id, e.target.value)}
                    >
                      <option value="NONE">None</option>
                      <option value="FIXED_LIST">Fixed List</option>
                      <option value="FREE_TEXT">Free Text</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
