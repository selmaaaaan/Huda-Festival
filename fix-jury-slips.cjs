const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

// Remove the Sports line
code = code.replace(
    /<div className="text-sm font-bold tracking-widest text-blue-600\/80 mb-2 uppercase">Sports.*?<\/div>/,
    ''
);

// Scale down the header slightly
code = code.replace(
    /<h1 className="text-5xl font-black text-\[#1e3a8a\] tracking-tight uppercase mb-6">/g,
    '<h1 className="text-4xl font-black text-[#1e3a8a] tracking-tight uppercase mb-4 mt-4">'
);

// Reduce padding in header
code = code.replace(
    /px-8 pt-10 pb-16/g,
    'px-8 pt-8 pb-10'
);

// Set max-width to A4 and add print scaling
code = code.replace(
    /mx-auto max-w-5xl/g,
    'mx-auto max-w-[210mm] print:w-[210mm] print:min-h-[297mm] print:m-0 print:p-0 print:bg-white bg-white'
);

// Ensure it respects page boundaries in print
code = code.replace(
    /print:absolute print:inset-0 print:bg-\[#f8fbff\] print:z-\[9999\] print:block print:w-full\s*bg-\[#f8fbff\] rounded-xl border border-blue-100 overflow-hidden text-slate-800 font-sans shadow-lg mx-auto/g,
    'print:absolute print:inset-0 print:z-[9999] print:block rounded-xl border border-blue-100 overflow-hidden text-slate-800 font-sans shadow-lg mx-auto'
);

// Ensure no dark mode text leaks in print
code = code.replace(
    /<table className="w-full text-left text-sm border-collapse">/,
    '<table className="w-full text-left text-xs md:text-sm border-collapse">'
);

// Fix height of empty rows to be smaller
code = code.replace(
    /className="py-6 px-2 border border-slate-200 text-center font-semibold text-slate-400"/g,
    'className="py-4 px-2 border border-slate-200 text-center font-semibold text-slate-400"'
);

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', code);
console.log('Patched JurySlipsPage.jsx');
