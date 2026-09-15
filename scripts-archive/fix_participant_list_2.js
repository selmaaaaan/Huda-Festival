const fs = require('fs');

let c = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

// Replace table header
c = c.replace(/<th className="py-3 px-3 border border-blue-400\/30 w-48">TEAM<\/th>/, `<th className="py-3 px-2 border border-blue-400/30 w-24">TEAM</th>
                       <th className="py-3 px-1 border border-blue-400/30 w-16">POSITION</th>
                       <th className="py-3 px-1 border border-blue-400/30 w-12">GRADE</th>
                       <th className="py-3 px-2 border border-blue-400/30 w-24">REMARKS</th>`);

// Replace cells
c = c.replace(/<td className="py-3 px-3 border border-slate-200 text-slate-600 font-semibold">\{reg\.team\?\.name \|\| '-'}<\/td>\r?\n\s+<\/tr>/g, `<td className="py-3 px-2 border border-slate-200 text-slate-600 font-semibold text-xs">{reg.team?.name || '-'}</td>
                           <td className="py-3 px-1 border border-slate-200"></td>
                           <td className="py-3 px-1 border border-slate-200"></td>
                           <td className="py-3 px-2 border border-slate-200"></td>
                         </tr>`);

// Replace empty cells
c = c.replace(/<td className="border border-slate-200"><\/td>\r?\n\s+<\/tr>/g, `<td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                       </tr>`);

// Blank the code letter in the JSX rendering
c = c.replace(/<td className="py-3 px-2 border border-slate-200 text-center font-bold text-blue-700 text-base">\{reg\.codeLetter \|\| ''}<\/td>/g, `<td className="py-3 px-1 border border-slate-200 text-center font-bold text-blue-700 text-base"></td>`);

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', c, 'utf8');
console.log("Fixed Participant List layout.");