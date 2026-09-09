import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Upload, FileText, CheckCircle, AlertTriangle, FileOutput, Loader2 } from 'lucide-react';

const DataImportSection = () => {
    const [bylawUrl, setBylawUrl] = useState(null);
    const [bylawFile, setBylawFile] = useState(null);
    const [rosterFile, setRosterFile] = useState(null);
    const [stageFile, setStageFile] = useState(null);
    const [nonStageFile, setNonStageFile] = useState(null);

    const [uploading, setUploading] = useState({ bylaw: false, roster: false, programmes: false });
    const [results, setResults] = useState({ bylaw: null, roster: null, programmes: null });

    useEffect(() => {
        api.get('/admin/import/bylaw-document').then(res => {
            if (res.data.url) setBylawUrl(res.data.url);
        }).catch(() => {});
    }, []);

    const handleUploadBylaw = async () => {
        if (!bylawFile) return;
        setUploading(prev => ({ ...prev, bylaw: true }));
        const formData = new FormData();
        formData.append('bylaw', bylawFile);
        try {
            const res = await api.post('/admin/import/bylaw-document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setBylawUrl(res.data.url);
            setResults(prev => ({ ...prev, bylaw: { success: true, message: 'Bylaw uploaded successfully' } }));
            setBylawFile(null);
        } catch (err) {
            setResults(prev => ({ ...prev, bylaw: { success: false, message: 'Failed to upload bylaw' } }));
        } finally {
            setUploading(prev => ({ ...prev, bylaw: false }));
        }
    };

    const handleUploadRoster = async () => {
        if (!rosterFile) return;
        setUploading(prev => ({ ...prev, roster: true }));
        const formData = new FormData();
        formData.append('roster', rosterFile);
        try {
            const res = await api.post('/admin/import/roster', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResults(prev => ({ ...prev, roster: { success: true, data: res.data } }));
            setRosterFile(null);
        } catch (err) {
            setResults(prev => ({ ...prev, roster: { success: false, message: err.response?.data?.message || 'Failed to import roster' } }));
        } finally {
            setUploading(prev => ({ ...prev, roster: false }));
        }
    };

    const handleUploadProgrammes = async () => {
        if (!stageFile || !nonStageFile) return;
        setUploading(prev => ({ ...prev, programmes: true }));
        const formData = new FormData();
        formData.append('stage', stageFile);
        formData.append('nonstage', nonStageFile);
        try {
            const res = await api.post('/admin/import/programmes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResults(prev => ({ ...prev, programmes: { success: true, data: res.data } }));
            setStageFile(null);
            setNonStageFile(null);
        } catch (err) {
            setResults(prev => ({ ...prev, programmes: { success: false, message: err.response?.data?.message || 'Failed to import programmes' } }));
        } finally {
            setUploading(prev => ({ ...prev, programmes: false }));
        }
    };

    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-6">Data Import & Settings</h2>
            
            <div className="space-y-8">
                {/* Bylaw Document Upload */}
                <div className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="font-semibold text-[var(--color-text-heading)] mb-2 flex items-center gap-2">
                        <FileText size={18} /> Bylaw Document (PDF)
                    </h3>
                    {bylawUrl && (
                        <div className="mb-4 text-sm">
                            <span className="text-[var(--color-text-muted)]">Current Document: </span>
                            <a href={bylawUrl} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline font-medium">View PDF</a>
                        </div>
                    )}
                    <div className="flex gap-4 items-center">
                        <input type="file" accept="application/pdf" onChange={e => setBylawFile(e.target.files[0])} className="text-sm text-[var(--color-text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90" />
                        <button disabled={!bylawFile || uploading.bylaw} onClick={handleUploadBylaw} className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg disabled:opacity-50 flex items-center gap-2">
                            {uploading.bylaw ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} 
                            {bylawUrl ? 'Replace' : 'Upload'}
                        </button>
                    </div>
                    {results.bylaw && (
                        <div className={`mt-3 text-sm ${results.bylaw.success ? 'text-green-600' : 'text-red-500'}`}>
                            {results.bylaw.message}
                        </div>
                    )}
                </div>

                {/* Roster Upload */}
                <div className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="font-semibold text-[var(--color-text-heading)] mb-2 flex items-center gap-2">
                        <User size={18} /> Import Roster (CSV)
                    </h3>
                    <div className="flex gap-4 items-center mb-4">
                        <input type="file" accept=".csv" onChange={e => setRosterFile(e.target.files[0])} className="text-sm text-[var(--color-text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90" />
                        <button disabled={!rosterFile || uploading.roster} onClick={handleUploadRoster} className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg disabled:opacity-50 flex items-center gap-2">
                            {uploading.roster ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Import
                        </button>
                    </div>
                    {results.roster && results.roster.success && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                            <div className="font-bold mb-1 flex items-center gap-1"><CheckCircle size={16} /> Import Successful</div>
                            <ul className="list-disc list-inside">
                                <li>Teams Created: {results.roster.data.summary.teamsCreated}</li>
                                <li>Candidates Created: {results.roster.data.summary.candidatesCreated}</li>
                                <li>Candidates Updated: {results.roster.data.summary.candidatesUpdated}</li>
                            </ul>
                            {results.roster.data.warnings?.length > 0 && (
                                <div className="mt-2 text-yellow-700 bg-yellow-50 p-2 rounded">
                                    <span className="font-bold flex items-center gap-1"><AlertTriangle size={14} /> Warnings:</span>
                                    <ul className="list-disc list-inside text-xs mt-1 max-h-32 overflow-y-auto">
                                        {results.roster.data.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    {results.roster && !results.roster.success && (
                        <div className="mt-3 text-sm text-red-500">{results.roster.message}</div>
                    )}
                </div>

                {/* Programmes Upload */}
                <div className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="font-semibold text-[var(--color-text-heading)] mb-2 flex items-center gap-2">
                        <FileOutput size={18} /> Import Programmes (CSVs)
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Stage Programmes CSV</label>
                            <input type="file" accept=".csv" onChange={e => setStageFile(e.target.files[0])} className="text-sm text-[var(--color-text-muted)] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-surface)] file:text-[var(--color-text-heading)] hover:file:opacity-90" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Non-Stage Programmes CSV</label>
                            <input type="file" accept=".csv" onChange={e => setNonStageFile(e.target.files[0])} className="text-sm text-[var(--color-text-muted)] w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-surface)] file:text-[var(--color-text-heading)] hover:file:opacity-90" />
                        </div>
                    </div>
                    <button disabled={!stageFile || !nonStageFile || uploading.programmes} onClick={handleUploadProgrammes} className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg disabled:opacity-50 flex items-center gap-2">
                        {uploading.programmes ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Import Programmes
                    </button>

                    {results.programmes && results.programmes.success && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                            <div className="font-bold mb-1 flex items-center gap-1"><CheckCircle size={16} /> Import Successful</div>
                            <p>Total Programmes Processed: {results.programmes.data.totalProcessed}</p>
                            
                            {(results.programmes.data.warnings.missingStarred.length > 0 || results.programmes.data.warnings.missingRegistration.length > 0 || results.programmes.data.warnings.missingCurb.length > 0) && (
                                <div className="mt-2 text-yellow-700 bg-yellow-50 p-2 rounded">
                                    <span className="font-bold flex items-center gap-1"><AlertTriangle size={14} /> Unmatched Rules Warnings:</span>
                                    <div className="mt-1 text-xs max-h-40 overflow-y-auto space-y-2">
                                        {results.programmes.data.warnings.missingStarred.length > 0 && (
                                            <div><strong className="block">Missing Starred Items:</strong><ul className="list-disc list-inside">{results.programmes.data.warnings.missingStarred.map((w,i)=><li key={i}>{w}</li>)}</ul></div>
                                        )}
                                        {results.programmes.data.warnings.missingRegistration.length > 0 && (
                                            <div><strong className="block">Missing Registration Items:</strong><ul className="list-disc list-inside">{results.programmes.data.warnings.missingRegistration.map((w,i)=><li key={i}>{w}</li>)}</ul></div>
                                        )}
                                        {results.programmes.data.warnings.missingCurb.length > 0 && (
                                            <div><strong className="block">Missing Curb Group Items:</strong><ul className="list-disc list-inside">{results.programmes.data.warnings.missingCurb.map((w,i)=><li key={i}>{w}</li>)}</ul></div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {results.programmes && !results.programmes.success && (
                        <div className="mt-3 text-sm text-red-500">{results.programmes.message}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataImportSection;
