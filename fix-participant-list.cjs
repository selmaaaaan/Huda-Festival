const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

// 1. Change the shuffle logic to sort by team name
code = code.replace(
    /const shuffled = \[\.\.\.registrations\];\n\s*for \(let i = shuffled\.length - 1; i > 0; i--\) \{\n\s*const j = Math\.floor\(Math\.random\(\) \* \(i \+ 1\)\);\n\s*\[shuffled\[i\], shuffled\[j\]\] = \[shuffled\[j\], shuffled\[i\]\];\n\s*\}/g,
    `const shuffled = [...registrations].sort((a, b) => {
      const teamA = a.team?.name || '';
      const teamB = b.team?.name || '';
      return teamA.localeCompare(teamB);
    });`
);

// 2. Change the button text
code = code.replace(
    /Shuffle & Generate List/g,
    'Generate List'
);
code = code.replace(
    /Reshuffle/g,
    'Refresh'
);
code = code.replace(
    /Click the button below to randomly shuffle these candidates and assign sequential Code Letters \(A, B, C\.\.\.\) to hide their true entry order from the jury\./g,
    'Click the button below to generate the participant list grouped by team.'
);

// 3. Add blank rectangle
code = code.replace(
    /\{\/\* Participants Table Card \*\/\}/,
    `{/* Blank Space Box */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 h-16 w-full"></div>

            {/* Participants Table Card */}`
);

// 4. Leave code letter blank
code = code.replace(
    /<td className="py-3 px-2 border border-slate-200 text-center font-bold text-blue-700 text-base">\{reg\.codeLetter\}<\/td>/g,
    '<td className="py-3 px-2 border border-slate-200 text-center font-bold text-blue-700 text-base"></td>'
);

// 5. Make AD NO bold
code = code.replace(
    /<td className="py-3 px-3 border border-slate-200 text-slate-600 text-xs">\{adNos\}<\/td>/g,
    '<td className="py-3 px-3 border border-slate-200 text-slate-800 text-sm font-bold">{adNos}</td>'
);

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', code);
console.log('Patched Participant List page layout and logic');
