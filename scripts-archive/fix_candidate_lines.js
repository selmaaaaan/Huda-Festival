const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

const search = `                       {shuffledList.map((reg, idx) => {
                         // Format candidates for display
                         const adNos = reg.candidates?.map(c => c.admissionNo).join(', ') || '-';
                         const names = reg.candidates?.map(c => c.name).join(', ') || '-';
                         
                         return (
                           <tr key={reg._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                             <td className="py-3 px-1 border border-slate-200 text-center font-semibold text-slate-700">{idx + 1}</td>
                             <td className="py-3 px-1 border border-slate-200 text-center font-bold text-blue-700 text-base"></td>
                             <td className="py-3 px-2 border border-slate-200 text-slate-800 text-xs font-bold">{adNos}</td>
                             <td className="py-3 px-3 border border-slate-200 font-medium text-slate-800 text-xs">{names}</td>`;

const replace = `                       {shuffledList.map((reg, idx) => {
                         return (
                           <tr key={reg._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                             <td className="py-3 px-1 border border-slate-200 text-center font-semibold text-slate-700 align-top">{idx + 1}</td>
                             <td className="py-3 px-1 border border-slate-200 text-center font-bold text-blue-700 text-base align-top"></td>
                             <td className="py-3 px-2 border border-slate-200 text-slate-800 text-[11px] font-bold align-top">
                               {reg.candidates?.length ? reg.candidates.map(c => <div key={c._id} className="whitespace-nowrap">{c.admissionNo}</div>) : '-'}
                             </td>
                             <td className="py-3 px-3 border border-slate-200 font-medium text-slate-800 text-[11px] align-top">
                               {reg.candidates?.length ? reg.candidates.map(c => <div key={c._id} className="whitespace-nowrap">{c.name}</div>) : '-'}
                             </td>`;

c = c.replace(search, replace);

// Fix other td's to have align-top so they don't look weird when multiple names are present
c = c.replace(/<td className="py-3 px-2 border border-slate-200 text-slate-600 font-semibold text-xs">/g, '<td className="py-3 px-2 border border-slate-200 text-slate-600 font-semibold text-[11px] align-top">');

c = c.replace(/<td className="py-3 px-1 border border-slate-200"><\/td>/g, '<td className="py-3 px-1 border border-slate-200 align-top"></td>');
c = c.replace(/<td className="py-3 px-2 border border-slate-200"><\/td>/g, '<td className="py-3 px-2 border border-slate-200 align-top"></td>');

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', c, 'utf8');
console.log("Done");