const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

// Replace titles
code = code.replace(/Jury Slips Generator/g, 'Participant List');
code = code.replace(/Print Jury Slip/g, 'Print Participant List');

// Replace table header
code = code.replace(
    /<thead>[\s\S]*?<\/thead>/,
    `<thead>
                     <tr className="bg-[#2563eb] text-white text-center font-bold">
                       <th className="py-3 px-2 border border-blue-400/30 w-12">SL.No</th>
                       <th className="py-3 px-2 border border-blue-400/30 w-24">CODE<br/>LETTER</th>
                       <th className="py-3 px-3 border border-blue-400/30 w-32">AD NO</th>
                       <th className="py-3 px-4 border border-blue-400/30 text-left">NAME</th>
                       <th className="py-3 px-3 border border-blue-400/30 w-48">TEAM</th>
                     </tr>
                   </thead>`
);

// Replace mapping row
code = code.replace(
    /\{\/\* Empty slots for Jury to fill \*\/\}[\s\S]*?<\/tr>/g,
    `</tr>`
);

// Replace empty rows mapping
code = code.replace(
    /<td className="py-4 px-2 border border-slate-200 text-center font-semibold text-slate-400">\{shuffledList\.length \+ i \+ 1\}<\/td>[\s\S]*?<\/tr>/g,
    `<td className="py-4 px-2 border border-slate-200 text-center font-semibold text-slate-400">{shuffledList.length + i + 1}</td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                       </tr>`
);

// Remove Note Section
code = code.replace(
    /\{\/\* Note Section \*\/\}[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/,
    ''
);

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', code);
console.log('Patched table in JurySlipsPage.jsx');
