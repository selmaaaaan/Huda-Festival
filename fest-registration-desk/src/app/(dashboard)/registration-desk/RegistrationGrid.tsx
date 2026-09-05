"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Check, X } from "lucide-react";

type Student = {
  id: number;
  adNo: number;
  name: string;
  category: string;
  registrations: { id: number; programId: number; programCode: string }[];
  bylawStatus: string;
};

type Program = {
  id: number;
  code: string;
  name: string;
  category: string;
  type: string;
  format: string;
};

const CATEGORIES = ["Sub Junior", "Junior", "Senior", "Super Senior", "General"];
const PROGRAM_TYPES = ["All Programs", "Stage", "Non-Stage", "Sports"];

export default function RegistrationGrid({ canEdit }: { canEdit: boolean }) {
  const [category, setCategory] = useState(CATEGORIES[1]); // Default Junior
  const [programType, setProgramType] = useState(PROGRAM_TYPES[0]);
  const [search, setSearch] = useState("");
  
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [category, programType, search]);

  const toggleRegistration = async (studentId: number, programId: number, isRegistered: boolean) => {
    if (!canEdit) {
      showToast("You do not have permission to edit registrations", "error");
      return;
    }

    const action = isRegistered ? "UNREGISTER" : "REGISTER";
    
    // Optimistic update
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const newRegs = isRegistered 
        ? s.registrations.filter(r => r.programId !== programId)
        : [...s.registrations, { id: -1, programId, programCode: "" }]; // Temp object
      return { ...s, registrations: newRegs };
    }));

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, programId, action }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update registration");
      }
      
      if (action === "REGISTER" && data.registration) {
        // Update temp object with real ID if needed, or just refetch silently
        // For simplicity and to update bylaw statuses accurately, a silent refetch is good,
        // but we'll rely on optimistic state for fast UI.
      }
      
      // showToast(`${action === 'REGISTER' ? 'Registered' : 'Unregistered'} successfully`, "success");
    } catch (err: any) {
      showToast(err.message, "error");
      // Revert optimistic update by refetching
      fetchData();
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
      <div className="flex-1 overflow-auto relative">
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
                      const isRegistered = student.registrations.some(r => r.programId === prog.id);
                      return (
                        <td 
                          key={prog.id} 
                          className="border-b border-r border-gray-200 text-center p-0"
                        >
                          <button
                            onClick={() => toggleRegistration(student.id, prog.id, isRegistered)}
                            className={`w-full h-12 flex items-center justify-center transition-colors cursor-pointer ${
                              isRegistered 
                                ? 'bg-blue-100 hover:bg-blue-200 text-blue-600' 
                                : 'hover:bg-gray-100 text-transparent hover:text-gray-300'
                            }`}
                          >
                            {isRegistered ? <Check size={20} className="text-blue-600" /> : <div className="w-5 h-5 rounded border-2 border-dashed border-gray-300"></div>}
                          </button>
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
