const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

c = c.replace(/const adNos = reg\.candidates\?\.map\(c => c\.admissionNo\)\.join\(\', \'\) \|\| \'-\';\r?\n\s+const names = reg\.candidates\?\.map\(c => c\.name\)\.join\(\', \'\) \|\| \'-\';/, '');

c = c.replace(/<td className="py-3 px-3 border border-slate-200 text-slate-800 text-sm font-bold">\{adNos\}<\/td>\r?\n\s+<td className="py-3 px-4 border border-slate-200 font-medium text-slate-800">\{names\}<\/td>/, `<td className="py-2 px-2 border border-slate-200 text-slate-800 text-[11px] font-bold align-top">
                               {reg.candidates?.length ? reg.candidates.map((c, i) => <div key={c._id} className={i !== 0 ? "mt-1" : ""}>{c.admissionNo}</div>) : '-'}
                             </td>
                             <td className="py-2 px-3 border border-slate-200 font-medium text-slate-800 text-[11px] align-top leading-tight">
                               {reg.candidates?.length ? reg.candidates.map((c, i) => <div key={c._id} className={i !== 0 ? "mt-1" : ""}>{c.name}</div>) : '-'}
                             </td>`);

c = c.replace(/<td className="py-3 px-2 border border-slate-200 text-center font-semibold text-slate-700">\{idx \+ 1\}<\/td>\r?\n\s+<td className="py-3 px-1 border border-slate-200 text-center font-bold text-blue-700 text-base"><\/td>/, `<td className="py-2 px-2 border border-slate-200 text-center font-semibold text-slate-700 align-top">{idx + 1}</td>
                           <td className="py-2 px-1 border border-slate-200 text-center font-bold text-blue-700 text-base align-top"></td>`);

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', c, 'utf8');
console.log("Done");