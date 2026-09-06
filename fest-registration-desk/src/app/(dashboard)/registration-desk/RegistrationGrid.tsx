"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Check, X } from "lucide-react";

type Student = {
  id: number;
  adNo: number;
  name: string;
  category: string;
  registrations: { id: number; programId: number; programCode: string; topic?: string | null }[];
  bylawStatus: string;
};

type Program = {
  id: number;
  code: string;
  name: string;
  category: string;
  type: string;
  format: string;
  topicMode: "NONE" | "FIXED_LIST" | "FREE_TEXT";
};

type Topic = {
  id: number;
  label: string;
  isActive: boolean;
  maxUses: number | null;
  usageCount: number;
};

const CATEGORIES = ["Sub Junior", "Junior", "Senior", "Super Senior", "General"];
const PROGRAM_TYPES = ["All Programs", "Stage", "Non-Stage", "Sports"];

export default function RegistrationGrid({ canEdit }: { canEdit: boolean }) {
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [programType, setProgramType] = useState(PROGRAM_TYPES[0]);
  const [search, setSearch] = useState("");
  
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Topic Popup State
  const [activePopup, setActivePopup] = useState<{ studentId: number; programId: number } | null>(null);
  const [topicsCache, setTopicsCache] = useState<Record<number, Topic[]>>({});
  const [topicInput, setTopicInput] = useState("");
  const [topicsLoading, setTopicsLoading] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, programsRes] = await Promise.all([
        fetch(`/api/students?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`),
        fetch(`/api/programs?category=${encodeURIComponent(category)}&type=${encodeURIComponent(programType)}`)
      ]);

      const studentsData = await studentsRes.json();
      const programsData = await programsRes.json();

      if (studentsRes.ok) setStudents(studentsData.students || []);
      if (programsRes.ok) setPrograms(programsData.programs || []);
    } catch (err) {
      showToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [category, programType, search]);

  const loadTopics = async (programId: number) => {
    if (topicsCache[programId]) return;
    setTopicsLoading(true);
    try {
      const res = await fetch(`/api/programs/${programId}/topics`);
      const data = await res.json();
      if (res.ok) {
        setTopicsCache(prev => ({ ...prev, [programId]: data.topics || [] }));
      }
    } catch (err) {
      showToast("Failed to load topics", "error");
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleCellClick = (studentId: number, prog: Program, isRegistered: boolean) => {
    if (!canEdit) {
      showToast("You do not have permission to edit registrations", "error");
      return;
    }

    if (isRegistered) {
      // Unregistering is always a single click
      toggleRegistration(studentId, prog.id, true);
    } else {
      if (prog.topicMode === "NONE") {
        toggleRegistration(studentId, prog.id, false);
      } else {
        // Open popup
        setActivePopup({ studentId, programId: prog.id });
        setTopicInput("");
        if (prog.topicMode === "FIXED_LIST") {
          loadTopics(prog.id);
        }
      }
    }
  };

  const toggleRegistration = async (studentId: number, programId: number, isRegistered: boolean, topic?: string) => {
    const action = isRegistered ? "UNREGISTER" : "REGISTER";
    
    setActivePopup(null);
    setTopicInput("");

    // Optimistic update
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const newRegs = isRegistered 
        ? s.registrations.filter(r => r.programId !== programId)
        : [...s.registrations, { id: -1, programId, programCode: "", topic }];
      return { ...s, registrations: newRegs };
    }));

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, programId, action, topic }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update registration");
      }
      
      // Update cache if we used a topic
      if (action === "REGISTER" && topic && topicsCache[programId]) {
        setTopicsCache(prev => ({
          ...prev,
          [programId]: prev[programId].map(t => 
            t.label === topic ? { ...t, usageCount: t.usageCount + 1 } : t
          )
        }));
      } else if (action === "UNREGISTER") {
         // Optionally decrement count, but easiest is just let it be slightly stale or refetch.
      }
      
    } catch (err: any) {
      showToast(err.message, "error");
      fetchData(); // Revert
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`absolute top-6 right-6 px-4 py-3 rounded shadow-lg z-50 flex items-center gap-2 text-white ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          {toast.type === "success" ? <Check size={18} /> : <X size={18} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center bg-gray-50">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
          <select 
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Program Type</label>
          <select 
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
            value={programType}
            onChange={e => setProgramType(e.target.value)}
          >
            {PROGRAM_TYPES.map(pt => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-gray-500 uppercase">Search Student</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or admission no..." 
              className="w-full border border-gray-300 rounded pl-9 pr-3 py-1.5 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto relative" onClick={(e) => {
        // Close popup if clicking outside
        if (activePopup && (e.target as HTMLElement).closest('.topic-popup') === null && (e.target as HTMLElement).closest('td.registration-cell') === null) {
          setActivePopup(null);
        }
      }}>
        {loading && students.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-20 bg-gray-100 shadow-sm">
              <tr>
                <th className="sticky left-0 z-30 bg-gray-100 border-b border-r border-gray-200 p-3 text-left font-semibold w-64 min-w-[250px]">
                  Student
                </th>
                {programs.map(prog => (
                  <th key={prog.id} className="border-b border-r border-gray-200 p-2 text-center min-w-[120px] max-w-[150px]">
                    <div className="font-bold text-gray-800" title={prog.name}>{prog.code}</div>
                    <div className="text-[10px] text-gray-500 truncate">{prog.type.charAt(0)} • {prog.format.charAt(0)}</div>
                    {prog.topicMode !== 'NONE' && (
                      <div className="text-[9px] uppercase tracking-wider text-purple-600 font-semibold bg-purple-100 rounded inline-block px-1 mt-0.5">Topic Req</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={programs.length + 1} className="p-8 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={student.id} className={`hover:bg-blue-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="sticky left-0 z-10 bg-white border-b border-r border-gray-200 p-3">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>Ad No: {student.adNo}</span>
                        <span className={
                          student.bylawStatus === 'Compliant' ? 'text-emerald-600' : 
                          student.bylawStatus.includes('Min') ? 'text-amber-600' : 'text-gray-400'
                        }>
                          {student.bylawStatus === 'Compliant' ? '✓ OK' : '! Req'}
                        </span>
                      </div>
                    </td>
                    
                    {programs.map(prog => {
                      const reg = student.registrations.find(r => r.programId === prog.id);
                      const isRegistered = !!reg;
                      const isPopupActive = activePopup?.studentId === student.id && activePopup?.programId === prog.id;

                      return (
                        <td 
                          key={prog.id} 
                          className="registration-cell relative border-b border-r border-gray-200 text-center p-0 align-middle"
                        >
                          <button
                            onClick={() => handleCellClick(student.id, prog, isRegistered)}
                            className={`w-full min-h-[48px] h-full flex flex-col items-center justify-center transition-colors cursor-pointer p-1 ${
                              isRegistered 
                                ? 'bg-blue-100 hover:bg-blue-200 text-blue-600' 
                                : 'hover:bg-gray-100 text-transparent hover:text-gray-300'
                            }`}
                          >
                            {isRegistered ? (
                              <>
                                <Check size={20} className="text-blue-600 mb-0.5" />
                                {reg.topic && (
                                  <span className="text-[10px] text-blue-800 leading-tight w-full truncate px-1" title={reg.topic}>
                                    {reg.topic}
                                  </span>
                                )}
                              </>
                            ) : (
                              <div className="w-5 h-5 rounded border-2 border-dashed border-gray-300"></div>
                            )}
                          </button>

                          {/* Popover */}
                          {isPopupActive && (
                            <div className="topic-popup absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-3 text-left before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-white">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-gray-700">Select Topic</span>
                                <button onClick={() => setActivePopup(null)} className="text-gray-400 hover:text-gray-600">
                                  <X size={14} />
                                </button>
                              </div>

                              {prog.topicMode === "FIXED_LIST" ? (
                                topicsLoading && !topicsCache[prog.id] ? (
                                  <div className="text-xs text-gray-500 py-2 text-center">Loading...</div>
                                ) : (
                                  <div className="max-h-48 overflow-y-auto space-y-1">
                                    {(topicsCache[prog.id] || []).filter(t => t.isActive).map(t => {
                                      const isFull = t.maxUses !== null && t.usageCount >= t.maxUses;
                                      return (
                                        <button
                                          key={t.id}
                                          disabled={isFull}
                                          onClick={() => toggleRegistration(student.id, prog.id, false, t.label)}
                                          className={`w-full text-left text-xs p-2 rounded ${isFull ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50 text-gray-800'}`}
                                        >
                                          <div className="font-medium truncate" title={t.label}>{t.label}</div>
                                          {t.maxUses !== null && (
                                            <div className="text-[10px] mt-0.5 opacity-80">
                                              {t.usageCount}/{t.maxUses} taken
                                            </div>
                                          )}
                                        </button>
                                      );
                                    })}
                                    {(topicsCache[prog.id] || []).filter(t => t.isActive).length === 0 && (
                                      <div className="text-xs text-gray-500 py-2 text-center">No active topics available</div>
                                    )}
                                  </div>
                                )
                              ) : (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    autoFocus
                                    placeholder="Enter topic..."
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
                                    value={topicInput}
                                    onChange={e => setTopicInput(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter' && topicInput.trim()) {
                                        toggleRegistration(student.id, prog.id, false, topicInput.trim());
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => topicInput.trim() && toggleRegistration(student.id, prog.id, false, topicInput.trim())}
                                    disabled={!topicInput.trim()}
                                    className="w-full bg-blue-600 text-white text-xs py-1.5 rounded disabled:opacity-50"
                                  >
                                    Confirm
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

