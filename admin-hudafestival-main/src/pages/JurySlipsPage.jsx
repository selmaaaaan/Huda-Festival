import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, AlertCircle, Search, Users, FileText, BarChart2, Info, Activity, Hash, Layers } from 'lucide-react';
import api from '../services/api';
import ProgrammeCodePicker from '../components/ProgrammeCodePicker';
import Button from '../components/Button';
import * as XLSX from 'xlsx';

const JurySlipsPage = () => {
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [shuffledList, setShuffledList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const res = await api.get('/programmes');
      setProgrammes(res.data || []);
    } catch (err) {
      setError('Failed to fetch programmes');
    }
  };

  const handleLoadRegistrations = async () => {
    if (!selectedProgramme) return;
    setLoading(true);
    setError('');
    setShuffledList([]);
    try {
      // Fetch only approved registrations
      const res = await api.get(`/registrations?programme=${selectedProgramme._id}&status=approved&limit=1000`);
      if (res.data && (res.data.registrations?.length > 0 || res.data.data?.length > 0)) {
        setRegistrations(res.data.registrations || res.data.data || []);
      } else {
        setRegistrations([]);
        setShowWarning(true);
      }
    } catch (err) {
      setError('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const generateCodeLetter = (index) => {
    let letter = '';
    let temp = index;
    while (temp >= 0) {
      letter = String.fromCharCode(65 + (temp % 26)) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

    const handleExportCurrent = () => {
    if (shuffledList.length === 0 && registrations.length === 0) return;
    const listToExport = shuffledList.length > 0 ? shuffledList : registrations;

    const data = listToExport.map((reg, idx) => ({
      'SL.No': idx + 1,
      'Code Letter': reg.codeLetter || '',
      'Ad No': reg.candidates?.map(c => c.admissionNo).join(', ') || '-',
      'Name': reg.candidates?.map(c => c.name).join(', ') || '-',
      'Team': reg.team?.name || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    XLSX.writeFile(wb, `${selectedProgramme?.name || 'Programme'}_Participants.xlsx`);
  };

  const handleExportAll = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/registrations?status=approved&limit=100000`);
      const allRegs = res.data.registrations || res.data.data || [];
      if (allRegs.length === 0) { alert('No approved registrations found.'); return; }

      const wb = XLSX.utils.book_new();
      const grouped = {};
      allRegs.forEach(reg => {
        if (!reg.programme) return;
        const progName = reg.programme.name;
        if (!grouped[progName]) grouped[progName] = [];
        grouped[progName].push(reg);
      });

      Object.keys(grouped).forEach(progName => {
        let progRegs = grouped[progName];
        progRegs.sort((a, b) => {
          const teamA = a.team?.name || '';
          const teamB = b.team?.name || '';
          return teamA.localeCompare(teamB);
        });

        progRegs = progRegs.map((reg, index) => {
           let letter = '';
           let temp = index;
           while (temp >= 0) {
             letter = String.fromCharCode(65 + (temp % 26)) + letter;
             temp = Math.floor(temp / 26) - 1;
           }
           return { ...reg, codeLetter: letter };
        });

        const data = progRegs.map((reg, idx) => ({
          'SL.No': idx + 1,
          'Code Letter': reg.codeLetter || '',
          'Ad No': reg.candidates?.map(c => c.admissionNo).join(', ') || '-',
          'Name': reg.candidates?.map(c => c.name).join(', ') || '-',
          'Team': reg.team?.name || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        let safeSheetName = progName.substring(0, 31).replace(/[\\/?*\[\]]/g, '');
        let uniqueName = safeSheetName;
        let counter = 1;
        while(wb.SheetNames.includes(uniqueName)) {
            uniqueName = safeSheetName.substring(0, 28) + '(' + counter + ')';
            counter++;
        }
        XLSX.utils.book_append_sheet(wb, ws, uniqueName);
      });
      XLSX.writeFile(wb, "All_Programmes_Participants.xlsx");
    } catch (err) {
      console.error(err);
      alert('Failed to export all programmes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (registrations.length === 0) return;
    // Shuffle the registrations
    const shuffled = [...registrations].sort((a, b) => {
      const teamA = a.team?.name || '';
      const teamB = b.team?.name || '';
      return teamA.localeCompare(teamB);
    });

    // Assign code letters
    const assigned = shuffled.map((reg, index) => ({
      ...reg,
      codeLetter: generateCodeLetter(index)
    }));

    // Sort alphabetically by code letter so the printed list is in order A, B, C...
    assigned.sort((a, b) => a.codeLetter.localeCompare(b.codeLetter));
    
    setShuffledList(assigned);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 w-full space-y-8">
      {/* Controls (Hidden on Print) */}
      <div className="print:hidden space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Participant List</h1>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">1. Select Programme</h2>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full max-w-md">
              <ProgrammeCodePicker 
                programmes={programmes}
                value={selectedProgramme?._id}
                onSelect={setSelectedProgramme}
              />
            </div>
            <Button onClick={handleLoadRegistrations} variant="primary" loading={loading}>
              <Search size={16} className="mr-2" /> Load Candidates
            </Button>
          </div>
        </div>

        {registrations.length > 0 && shuffledList.length === 0 && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-2">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-heading)]">{registrations.length} Approved Registrations Found</h3>
            <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
              Click the button below to generate the participant list grouped by team.
            </p>
            <Button onClick={handleGenerate} variant="primary" className="mx-auto">
              <RefreshCw size={18} className="mr-2" /> Generate List
            </Button>
          </div>
        )}

        {shuffledList.length > 0 && (
          <div className="flex justify-end gap-3 mt-4">
             <Button onClick={handleGenerate} variant="outline">
               <RefreshCw size={16} className="mr-2" /> Refresh
             </Button>
             <Button onClick={handlePrint} variant="primary">
               <Printer size={16} className="mr-2" /> Print Participant List
             </Button>
          </div>
        )}
      </div>

      {/* Printable Area */}
      {shuffledList.length > 0 && selectedProgramme && (
        <div className="print:absolute print:inset-0 print:z-[9999] print:block rounded-xl border border-blue-100 overflow-hidden text-slate-800 font-sans shadow-lg mx-auto max-w-[210mm] print:w-[210mm] print:min-h-[297mm] print:m-0 print:p-0 print:bg-white bg-white" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
          
          {/* Header Area */}
          <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-[#eef4fd] px-8 pt-8 pb-10 text-center border-b border-blue-200">
             {/* Decorative curves could go here via SVG if needed, keeping it clean for now */}
             
             <h1 className="text-4xl font-black text-[#1e3a8a] tracking-tight uppercase mb-4 mt-4">HUDA FESTIVAL {new Date().getFullYear()}</h1>
             
             <div className="inline-block bg-[#3b82f6] text-white font-bold text-2xl px-12 py-3 rounded-full shadow-md">
               Participants List
             </div>
             
             <div className="text-sm font-bold tracking-widest text-blue-600/80 mt-6 uppercase">ART BUILDS A BETTER TOMORROW</div>
          </div>

          <div className="px-8 -mt-8 relative z-10 space-y-6 pb-12">
            
            {/* Programme Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 flex gap-4">
                 <div className="flex-1 flex items-center bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-md mr-3 shrink-0">
                       <Activity size={18} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Programme</div>
                      <div className="font-bold text-[#1e3a8a] text-sm">{selectedProgramme.name}</div>
                    </div>
                 </div>
                 <div className="flex-1 flex items-center bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-md mr-3 shrink-0">
                       <Hash size={18} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Programme Code</div>
                      <div className="font-bold text-[#1e3a8a] text-sm">{selectedProgramme.code}</div>
                    </div>
                 </div>
                 <div className="flex-1 flex items-center bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-md mr-3 shrink-0">
                       <Layers size={18} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Category</div>
                      <div className="font-bold text-[#1e3a8a] text-sm uppercase">{selectedProgramme.category}</div>
                    </div>
                 </div>
            </div>

            {/* Blank Space Box */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 h-16 w-full"></div>

            {/* Participants Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden p-4">
               <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-3 text-blue-600">
                     <Users size={24} className="text-blue-500" />
                     <h2 className="text-lg font-bold text-[#1e3a8a]">Participants</h2>
                   </div>
                 <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 flex items-center gap-4">
                   <div className="bg-blue-100 text-blue-600 p-2 rounded-md"><Users size={20}/></div>
                   <div>
                     <div className="text-xs font-semibold text-blue-600 uppercase">Total Participants</div>
                     <div className="font-bold text-xl text-[#1e3a8a] leading-none mt-1">{shuffledList.length}</div>
                   </div>
                 </div>
               </div>

               <div className="overflow-x-auto rounded-lg border border-[#2563eb]">
                 <table className="w-full text-left text-xs md:text-sm border-collapse">
                   <thead>
                     <tr className="bg-[#2563eb] text-white text-center font-bold">
                       <th className="py-3 px-2 border border-blue-400/30 w-12">SL.No</th>
                       <th className="py-3 px-2 border border-blue-400/30 w-24">CODE<br/>LETTER</th>
                       <th className="py-3 px-3 border border-blue-400/30 w-32">AD NO</th>
                       <th className="py-3 px-4 border border-blue-400/30 text-left">NAME</th>
                       <th className="py-3 px-3 border border-blue-400/30 w-48">TEAM</th>
                     </tr>
                   </thead>
                   <tbody>
                     {shuffledList.map((reg, idx) => {
                       // Format candidates for display
                       const adNos = reg.candidates?.map(c => c.admissionNo).join(', ') || '-';
                       const names = reg.candidates?.map(c => c.name).join(', ') || '-';
                       
                       return (
                         <tr key={reg._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                           <td className="py-3 px-2 border border-slate-200 text-center font-semibold text-slate-700">{idx + 1}</td>
                           <td className="py-3 px-2 border border-slate-200 text-center font-bold text-blue-700 text-base">{reg.codeLetter || ''}</td>
                           <td className="py-3 px-3 border border-slate-200 text-slate-800 text-sm font-bold">{adNos}</td>
                           <td className="py-3 px-4 border border-slate-200 font-medium text-slate-800">{names}</td>
                           <td className="py-3 px-3 border border-slate-200 text-slate-600 font-semibold">{reg.team?.name || '-'}</td>
                           
                           </tr>
                       );
                     })}
                     
                     {/* Add a few empty rows at the bottom for extra space/aesthetics */}
                     {Array.from({ length: Math.max(0, 8 - shuffledList.length) }).map((_, i) => (
                       <tr key={`empty-${i}`} className={(shuffledList.length + i) % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                         <td className="py-4 px-2 border border-slate-200 text-center font-semibold text-slate-400">{shuffledList.length + i + 1}</td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

          </div>
          
          {/* Footer Text */}
          <div className="text-center pb-8 pt-4">
             <div className="text-sm font-bold tracking-[0.2em] text-[#1e3a8a] uppercase mb-1">HUDA FESTIVAL {new Date().getFullYear()}</div>
             <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
               <div className="h-px bg-slate-200 w-12"></div>
               More than art
               <div className="h-px bg-slate-200 w-12"></div>
             </div>
          </div>
          
        </div>
      )}

      {/* Warning Popup */}
      {showWarning && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Registration Incomplete</h3>
              <p className="text-sm text-slate-500 mb-6">
                Registration is not complete yet for this programme. No candidates found.
              </p>
              <Button onClick={() => setShowWarning(false)} variant="primary" className="w-full bg-slate-800 hover:bg-slate-700">
                Okay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JurySlipsPage;
