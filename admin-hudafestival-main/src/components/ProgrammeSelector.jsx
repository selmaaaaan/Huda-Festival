import React, { useState } from 'react';
import { Search } from 'lucide-react';

const ProgrammeSelector = ({ programmes, value, onChange }) => {
    // value is the programmeId
    const selectedProgramme = programmes.find(p => p._id === value);
    const [searchCode, setSearchCode] = useState(selectedProgramme ? selectedProgramme.code : '');

    const handleSelect = (e) => {
        const selectedId = e.target.value;
        onChange(selectedId);
        const p = programmes.find(pr => pr._id === selectedId);
        setSearchCode(p ? p.code : '');
    };

    const handleCodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const p = programmes.find(pr => pr.code.toLowerCase() === searchCode.toLowerCase());
            if (p) {
                onChange(p._id);
                setSearchCode(p.code);
            } else {
                alert('Programme code not found');
            }
        }
    };

    const handleCodeBlur = () => {
        const p = programmes.find(pr => pr.code.toLowerCase() === searchCode.toLowerCase());
        if (p) {
            onChange(p._id);
            setSearchCode(p.code);
        } else if (searchCode !== '') {
            // Keep the text but maybe show error? Actually just leave it.
        } else {
            onChange('');
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                        Programme Code
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" size={16} />
                        <input
                            type="text"
                            placeholder="Type Code & Enter..."
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            onKeyDown={handleCodeKeyDown}
                            onBlur={handleCodeBlur}
                            className="w-full pl-9 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-heading)] transition-colors"
                        />
                        <select
                            value={value || ''}
                            onChange={handleSelect}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            title="Or select from list"
                        >
                            <option value="">Select Code...</option>
                            {programmes.sort((a,b)=>a.code.localeCompare(b.code)).map(p => (
                                <option key={p._id} value={p._id}>{p.code}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                            Programme Name
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={selectedProgramme ? selectedProgramme.name : ''}
                            placeholder="Auto-populated"
                            className="w-full px-4 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-muted)] cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                            Category
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={selectedProgramme ? selectedProgramme.category : ''}
                            placeholder="Auto-populated"
                            className="w-full px-4 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-muted)] cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgrammeSelector;
