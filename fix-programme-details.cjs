const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

// Refactor Programme Details Card
code = code.replace(
    /\{\/\* Programme Details Card \*\/\}[\s\S]*?\{\/\* Participants Table Card \*\/\}/,
    `{/* Programme Details Card */}
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
            </div>

            {/* Participants Table Card */}`
);

// Refactor Participants Table Header
code = code.replace(
    /<div className="flex justify-between items-start mb-6">[\s\S]*?<div className="bg-blue-50/,
    `<div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-3 text-blue-600">
                     <Users size={24} className="text-blue-500" />
                     <h2 className="text-lg font-bold text-[#1e3a8a]">Participants</h2>
                   </div>
                 <div className="bg-blue-50`
);

// Reduce padding on Participants Table Card
code = code.replace(
    /<div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden p-6">/,
    '<div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden p-4">'
);

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', code);
console.log('Patched Programme Details');
