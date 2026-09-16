import { useAlert } from '../context/AlertContext';
import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, AlertCircle, Search, Users, FileText, BarChart2, Info, Activity, Hash, Layers } from 'lucide-react';
import api from '../services/api';
import ProgrammeCodePicker from '../components/ProgrammeCodePicker';
import Button from '../components/Button';
import * as XLSX from 'xlsx';

const JurySlipsPage = () => {
  const alertAction = useAlert();

  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [shuffledList, setShuffledList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const [mode, setMode] = useState('programme');
  const [candidateQuery, setCandidateQuery] = useState('');
  const [candidateSuggestions, setCandidateSuggestions] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateRegistrations, setCandidateRegistrations] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (mode !== 'participant') return;
    const delayDebounceFn = setTimeout(async () => {
      if (candidateQuery.length >= 2) {
        setSearchLoading(true);
        try {
          const res = await api.get(`/candidates/lookup?search=${encodeURIComponent(candidateQuery)}`);
          setCandidateSuggestions(res.data);
        } catch (e) {
          console.error(e);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setCandidateSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [candidateQuery, mode]);

  const selectCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateQuery('');
    setCandidateSuggestions([]);
    setLoading(true);
    try {
      const res = await api.get(`/candidates/${candidate._id}/registrations`);
      setCandidateRegistrations(res.data);
    } catch (e) {
      alertAction('Failed to fetch candidate registrations');
    } finally {
      setLoading(false);
    }
  };


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

    // Flatten: one row per candidate
    let slNo = 0;
    const data = listToExport.flatMap((reg) =>
      (reg.candidates?.length ? reg.candidates : [{}]).map((c) => ({
        'SL.No': ++slNo,
        'Code Letter': '',
        'Ad No': c.admissionNo || '-',
        'Name': c.name || '-',
        'Team': reg.team?.name || '-',
        'Position': '',
        'Grade': '',
        'Remarks': ''
      }))
    );

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
      if (allRegs.length === 0) { alertAction('No approved registrations found.'); return; }

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

        let slNoAll = 0;
        const data = progRegs.flatMap((reg) =>
          (reg.candidates?.length ? reg.candidates : [{}]).map((c) => ({
            'SL.No': ++slNoAll,
            'Code Letter': '',
            'Ad No': c.admissionNo || '-',
            'Name': c.name || '-',
            'Team': reg.team?.name || '-',
            'Position': '',
            'Grade': '',
            'Remarks': ''
          }))
        );

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
      alertAction('Failed to export all programmes');
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
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Participant Directory</h1>
          </div>

          <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1 w-fit">
            <button
              onClick={() => setMode('programme')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'programme' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            >
              Search by Programme
            </button>
            <button
              onClick={() => setMode('participant')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'participant' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            >
              Search by Participant
            </button>
          </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {mode === 'programme' ? (
<>
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
            <h3 className="text-xl font-bold text-[var(--color-text-heading)]">{registrations.reduce((s, r) => s + (r.candidates?.length || 1), 0)} Candidates Found ({registrations.length} registrations)</h3>
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
</>

          ) : (
             <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4 relative">
               <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Search Participant</h2>
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" size={20} />
                 <input
                   type="text"
                   placeholder="Type name or admission number..."
                   className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                   value={candidateQuery}
                   onChange={e => setCandidateQuery(e.target.value)}
                 />
                 {searchLoading && <RefreshCw size={16} className="absolute right-3 top-2.5 animate-spin text-[var(--color-text-muted)]" />}
                 
                 {candidateSuggestions.length > 0 && candidateQuery.length >= 2 && (
                   <div className="absolute top-full mt-1 left-0 right-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                     {candidateSuggestions.map(cand => (
                       <button
                         key={cand._id}
                         onClick={() => selectCandidate(cand)}
                         className="w-full text-left px-4 py-3 hover:bg-[var(--color-surface-elevated)] border-b border-[var(--color-border-subtle)] last:border-0 flex justify-between items-center"
                       >
                         <div>
                           <div className="font-bold text-[var(--color-text-heading)]">{cand.name}</div>
                           <div className="text-xs text-[var(--color-text-muted)]">Ad No: {cand.admissionNo} &bull; {cand.category} &bull; Class: {cand.classLevel}</div>
                         </div>
                         <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                           {cand.team?.name}
                         </div>
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          )}

        </div>

{/* Printable Area */}
      {mode === 'programme' && shuffledList.length > 0 && selectedProgramme && (
        <div className="print:absolute print:inset-0 print:z-[9999] print:block rounded-xl border border-blue-100 overflow-hidden text-[var(--color-text-heading)] font-sans shadow-lg mx-auto max-w-[210mm] print:w-[210mm] print:min-h-[297mm] print:m-0 print:p-0 print:bg-white bg-[var(--color-surface)]" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
          
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
            <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-blue-100 p-4 flex gap-4">
                 <div className="flex-1 flex items-center bg-[var(--color-surface-elevated)] rounded-lg p-3 border border-[var(--color-border-subtle)]">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-md mr-3 shrink-0">
                       <Activity size={18} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-[var(--color-text-muted)] font-semibold text-[10px] uppercase tracking-wider">Programme</div>
                      <div className="font-bold text-[#1e3a8a] text-sm">{selectedProgramme.name}</div>
                    </div>
                 </div>
                 <div className="flex-1 flex items-center bg-[var(--color-surface-elevated)] rounded-lg p-3 border border-[var(--color-border-subtle)]">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-md mr-3 shrink-0">
                       <Hash size={18} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-[var(--color-text-muted)] font-semibold text-[10px] uppercase tracking-wider">Programme Code</div>
                      <div className="font-bold text-[#1e3a8a] text-sm">{selectedProgramme.code}</div>
                    </div>
                 </div>
                 <div className="flex-1 flex items-center bg-[var(--color-surface-elevated)] rounded-lg p-3 border border-[var(--color-border-subtle)]">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-md mr-3 shrink-0">
                       <Layers size={18} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-[var(--color-text-muted)] font-semibold text-[10px] uppercase tracking-wider">Category</div>
                      <div className="font-bold text-[#1e3a8a] text-sm uppercase">{selectedProgramme.category}</div>
                    </div>
                 </div>
            </div>

            {/* Blank Space Box */}
            <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-blue-100 h-16 w-full"></div>

            {/* Participants Table Card */}
            <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-blue-100 overflow-hidden p-4">
               <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-3 text-blue-600">
                     <Users size={24} className="text-blue-500" />
                     <h2 className="text-lg font-bold text-[#1e3a8a]">Participants</h2>
                   </div>
                 <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 flex items-center gap-4">
                   <div className="bg-blue-100 text-blue-600 p-2 rounded-md"><Users size={20}/></div>
                   <div>
                     <div className="text-xs font-semibold text-blue-600 uppercase">Total Participants</div>
                     <div className="font-bold text-xl text-[#1e3a8a] leading-none mt-1">{shuffledList.reduce((s, r) => s + (r.candidates?.length || 0), 0)}</div>
                   </div>
                 </div>
               </div>

               <div className="overflow-x-auto rounded-lg border border-[#2563eb]">
                 <table className="w-full text-left text-xs md:text-sm border-collapse">
                   <thead>
                     <tr className="bg-[#2563eb] text-white text-center font-bold">
                       <th className="py-3 px-2 border border-blue-400/30 w-12">SL.No</th>
                       <th className="py-3 px-2 border border-blue-400/30 w-16 text-center">CODE<br/>LETTER</th>
                       <th className="py-3 px-3 border border-blue-400/30 w-16 text-left">AD NO</th>
                       <th className="py-3 px-4 border border-blue-400/30 text-left">NAME</th>
                       <th className="py-3 px-2 border border-blue-400/30 w-24 text-left">TEAM</th>
                       <th className="py-3 px-1 border border-blue-400/30 w-16">POSITION</th>
                       <th className="py-3 px-1 border border-blue-400/30 w-12">GRADE</th>
                       <th className="py-3 px-2 border border-blue-400/30 w-48">REMARKS</th>
                     </tr>
                   </thead>
                   <tbody>
                      {(() => {
                        // Flatten: one row per candidate
                        const rows = [];
                        shuffledList.forEach((reg) => {
                          const cands = reg.candidates?.length ? reg.candidates : [{}];
                          cands.forEach((c) => rows.push({ c, reg }));
                        });
                        return rows.map(({ c, reg }, idx) => (
                          <tr key={(c._id || reg._id) + '-' + idx} className={idx % 2 === 0 ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-surface-elevated)]'}>
                            <td className="py-3 px-2 border border-[var(--color-border)] text-center font-semibold text-[var(--color-text-body)] align-middle">{idx + 1}</td>
                            <td className="py-3 px-1 border border-[var(--color-border)] align-middle"></td>
                            <td className="py-3 px-3 border border-[var(--color-border)] text-[var(--color-text-heading)] text-[12px] font-bold align-middle text-left">{c.admissionNo || '-'}</td>
                            <td className="py-3 px-3 border border-[var(--color-border)] font-bold text-[var(--color-text-heading)] text-[12px] align-middle leading-tight">{c.name || '-'}</td>
                            <td className="py-3 px-2 border border-[var(--color-border)] text-[var(--color-text-body)] font-bold text-[12px] align-middle">{reg.team?.name || '-'}</td>
                            <td className="py-3 px-1 border border-[var(--color-border)] align-middle"></td>
                            <td className="py-3 px-1 border border-[var(--color-border)] align-middle"></td>
                            <td className="py-3 px-2 border border-[var(--color-border)] align-middle"></td>
                          </tr>
                        ));
                      })()}

                      {/* Filler rows based on total candidate count */}
                      {(() => {
                        const totalCands = shuffledList.reduce((s, r) => s + (r.candidates?.length || 0), 0);
                        return Array.from({ length: Math.max(0, 8 - totalCands) }).map((_, i) => (
                          <tr key={`empty-${i}`} className={(totalCands + i) % 2 === 0 ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-surface-elevated)]'}>
                            <td className="py-4 px-2 border border-[var(--color-border)] text-center font-semibold text-[var(--color-text-muted)]">{totalCands + i + 1}</td>
                            <td className="border border-[var(--color-border)]"></td>
                            <td className="border border-[var(--color-border)]"></td>
                            <td className="border border-[var(--color-border)]"></td>
                            <td className="border border-[var(--color-border)]"></td>
                            <td className="border border-[var(--color-border)]"></td>
                            <td className="border border-[var(--color-border)]"></td>
                            <td className="border border-[var(--color-border)]"></td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                 </table>
               </div>
            </div>

          </div>
          
          
      {mode === 'participant' && selectedCandidate && (
         <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden text-[var(--color-text-heading)] p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-[var(--color-border-subtle)] pb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1e3a8a]">{selectedCandidate.name}</h2>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">Ad No: {selectedCandidate.admissionNo} &bull; Class: {selectedCandidate.classLevel}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-[var(--color-text-body)] uppercase tracking-wider">{selectedCandidate.category}</div>
                <div className="text-sm font-semibold text-blue-600 mt-1">{selectedCandidate.team?.name}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-heading)] mb-4 flex items-center gap-2"><Layers size={20} className="text-blue-500"/> Registered Programmes</h3>
              {loading ? (
                <div className="py-8 text-center text-[var(--color-text-muted)] flex flex-col items-center gap-2">
                  <RefreshCw className="animate-spin" size={24} />
                  Loading programmes...
                </div>
              ) : candidateRegistrations.length === 0 ? (
                <div className="py-8 text-center text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border-subtle)]">
                  This participant is not registered for any programmes.
                </div>
              ) : (
                <div className="space-y-4">
                  {candidateRegistrations.map(reg => (
                    <div key={reg._id} className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{reg.category}</span>
                           <span className="text-[10px] font-semibold bg-[var(--color-border)] text-[var(--color-text-body)] px-2 py-0.5 rounded">{reg.type}</span>
                         </div>
                         <div className="font-bold text-[var(--color-text-heading)]">{reg.programmeCode} - {reg.programmeName}</div>
                         {reg.topic && (
                           <div className="text-sm text-[var(--color-text-body)] mt-2 bg-[var(--color-surface)] px-3 py-2 border border-[var(--color-border-subtle)] rounded">
                             <span className="font-semibold text-[var(--color-text-muted)] text-xs uppercase tracking-wider mr-2">Topic:</span>
                             {reg.topic}
                             {reg.topicStatus && (
                               <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${reg.topicStatus === 'approved' ? 'bg-green-100 text-green-700' : reg.topicStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{reg.topicStatus}</span>
                             )}
                           </div>
                         )}
                       </div>
                       <div>
                         <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${reg.status === 'approved' ? 'bg-green-100 text-green-700' : reg.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{reg.status}</span>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
         </div>
      )}

          {/* Footer Text */}
          <div className="text-center pb-8 pt-4">
             <div className="text-sm font-bold tracking-[0.2em] text-[#1e3a8a] uppercase mb-1">HUDA FESTIVAL {new Date().getFullYear()}</div>
             <div className="flex items-center justify-center gap-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
               <div className="h-px bg-[var(--color-border)] w-12"></div>
               More than art
               <div className="h-px bg-[var(--color-border)] w-12"></div>
             </div>
          </div>
          
        </div>
      )}

      {/* Warning Popup */}
      {showWarning && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border-subtle)] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text-heading)] mb-2">Registration Incomplete</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
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
