const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

// 1. Add style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} to the print container
code = code.replace(
    /<div className="print:absolute print:inset-0 print:z-\[9999\] print:block rounded-xl border border-blue-100 overflow-hidden text-slate-800 font-sans shadow-lg mx-auto max-w-\[210mm\] print:w-\[210mm\] print:min-h-\[297mm\] print:m-0 print:p-0 print:bg-white bg-white">/,
    `<div className="print:absolute print:inset-0 print:z-[9999] print:block rounded-xl border border-blue-100 overflow-hidden text-slate-800 font-sans shadow-lg mx-auto max-w-[210mm] print:w-[210mm] print:min-h-[297mm] print:m-0 print:p-0 print:bg-white bg-white" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>`
);

// 2. Add Hash, Layers, Activity to lucide-react import
code = code.replace(
    /import \{ Printer, RefreshCw, AlertCircle, Search, Users, FileText, BarChart2, Info \} from 'lucide-react';/,
    `import { Printer, RefreshCw, AlertCircle, Search, Users, FileText, BarChart2, Info, Activity, Hash, Layers } from 'lucide-react';`
);

// 3. Replace the Programme Details Card
const oldCard = `{/* Programme Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 flex gap-4">
                 <div className="flex-1 flex flex-col justify-center items-center bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="text-slate-500 font-semibold mb-1 text-[10px] uppercase tracking-wider">Programme</div>
                    <div className="font-bold text-[#1e3a8a] text-sm text-center">{selectedProgramme.name}</div>
                 </div>
                 <div className="flex-1 flex flex-col justify-center items-center bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="text-slate-500 font-semibold mb-1 text-[10px] uppercase tracking-wider">Programme Code</div>
                    <div className="font-bold text-[#1e3a8a] text-sm">{selectedProgramme.code}</div>
                 </div>
                 <div className="flex-1 flex flex-col justify-center items-center bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="text-slate-500 font-semibold mb-1 text-[10px] uppercase tracking-wider">Category</div>
                    <div className="font-bold text-[#1e3a8a] text-sm uppercase">{selectedProgramme.category}</div>
                 </div>
            </div>`;

const newCard = `{/* Programme Details Card */}
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
            </div>`;

if (code.includes('text-center">{selectedProgramme.name}')) {
    code = code.replace(oldCard, newCard);
} else {
    console.log("Could not find the old card exactly as written. Using fallback regex.");
    code = code.replace(
        /\{\/\* Programme Details Card \*\/\}[\s\S]*?\{\/\* Blank Space Box \*\/\}/,
        newCard + '\n\n            {/* Blank Space Box */}'
    );
}

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', code);
console.log('Successfully added icons and fixed print colors.');
