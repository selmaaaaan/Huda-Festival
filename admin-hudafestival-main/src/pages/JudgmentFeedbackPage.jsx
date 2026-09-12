import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { FileSpreadsheet, AlertTriangle, Download } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';

const JudgmentFeedbackPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/results/judgment-feedback');
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch judgment feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) return;

    // Format data for export
    const exportData = results.map(r => ({
      'Programme Name': r.programme?.name || 'N/A',
      'Programme Code': r.programme?.code || 'N/A',
      'Candidate Name': r.candidate?.name || 'N/A',
      'Team': r.candidate?.team?.name || 'N/A',
      'Code Letter': r.codeLetter || 'N/A',
      'Judge': r.submittedBy?.name || 'Admin',
      'Position': r.rank || '',
      'Grade': r.grade || '',
      'Remarks': r.remarks || '',
      'Status': r.status || ''
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Programme Name
      { wch: 15 }, // Programme Code
      { wch: 30 }, // Candidate Name
      { wch: 20 }, // Team
      { wch: 12 }, // Code Letter
      { wch: 20 }, // Judge
      { wch: 10 }, // Position
      { wch: 10 }, // Grade
      { wch: 50 }, // Remarks
      { wch: 12 }, // Status
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Judgment Feedback');

    // Download file
    XLSX.writeFile(wb, `Judgment_Feedback_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return <div className="p-8 text-[var(--color-text-body)]">Loading feedback...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Judgment Feedback</h1>
          </div>
          <p className="text-[var(--color-text-body)]">Review judge remarks and scoring details for all candidates.</p>
        </div>
        <Button 
          onClick={handleExport} 
          disabled={results.length === 0}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download size={18} />
          Export to Excel
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-2">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {results.length === 0 ? (
        <EmptyState 
          icon={FileSpreadsheet} 
          title="No feedback available" 
          description="There are no judged results with feedback to display." 
        />
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--color-surface-elevated)] sticky top-0 z-10 border-b border-[var(--color-border)] shadow-sm">
                <tr className="text-[var(--color-text-muted)] font-medium">
                  <th className="px-6 py-4">Programme</th>
                  <th className="px-6 py-4">Candidate & Team</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Code Letter</th>
                  <th className="px-6 py-4">Judge</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Pos / Grd</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {results.map((r, i) => (
                  <tr key={r._id || i} className="hover:bg-[var(--color-surface-elevated)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--color-text-heading)]">{r.programme?.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-1">{r.programme?.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--color-text-heading)]">{r.candidate?.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-1">{r.candidate?.team?.name}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2.5 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md font-bold text-[var(--color-text-heading)]">
                        {r.codeLetter || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--color-text-body)]">{r.submittedBy?.name || 'Admin'}</div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {r.rank && (
                        <span className="inline-block bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold px-2 py-1 rounded text-xs mr-2">
                          P{r.rank}
                        </span>
                      )}
                      {r.grade && (
                        <span className="inline-block bg-emerald-500/10 text-emerald-600 font-bold px-2 py-1 rounded text-xs">
                          {r.grade}
                        </span>
                      )}
                      {!r.rank && !r.grade && <span className="text-[var(--color-text-muted)]">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      {r.remarks ? (
                        <div className="text-[var(--color-text-body)] italic line-clamp-3" title={r.remarks}>
                          "{r.remarks}"
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JudgmentFeedbackPage;
