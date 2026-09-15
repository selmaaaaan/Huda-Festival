const fs = require('fs');

let c = fs.readFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', 'utf8');

const tableHeader = `                     <tr className="bg-[#2563eb] text-white text-center font-bold">
                       <th className="py-3 px-2 border border-blue-400/30 w-12">SL.No</th>
                       <th className="py-3 px-2 border border-blue-400/30 w-24">CODE<br/>LETTER</th>
                       <th className="py-3 px-3 border border-blue-400/30 w-32">AD NO</th>
                       <th className="py-3 px-4 border border-blue-400/30 text-left">NAME</th>
                       <th className="py-3 px-3 border border-blue-400/30 w-48">TEAM</th>
                     </tr>`;

const tableHeaderNew = `                     <tr className="bg-[#2563eb] text-white text-center font-bold text-[11px]">
                       <th className="py-3 px-1 border border-blue-400/30 w-8">SL.No</th>
                       <th className="py-3 px-1 border border-blue-400/30 w-16">CODE<br/>LETTER</th>
                       <th className="py-3 px-2 border border-blue-400/30 w-20">AD NO</th>
                       <th className="py-3 px-3 border border-blue-400/30 text-left">NAME</th>
                       <th className="py-3 px-2 border border-blue-400/30 w-24">TEAM</th>
                       <th className="py-3 px-1 border border-blue-400/30 w-16">POSITION</th>
                       <th className="py-3 px-1 border border-blue-400/30 w-12">GRADE</th>
                       <th className="py-3 px-2 border border-blue-400/30 w-24">REMARKS</th>
                     </tr>`;

c = c.replace(tableHeader, tableHeaderNew);

const tableRow = `                       return (
                         <tr key={reg._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                           <td className="py-3 px-2 border border-slate-200 text-center font-semibold text-slate-700">{idx + 1}</td>
                           <td className="py-3 px-2 border border-slate-200 text-center font-bold text-blue-700 text-base">{reg.codeLetter || ''}</td>
                           <td className="py-3 px-3 border border-slate-200 text-slate-800 text-sm font-bold">{adNos}</td>
                           <td className="py-3 px-4 border border-slate-200 font-medium text-slate-800">{names}</td>
                           <td className="py-3 px-3 border border-slate-200 text-slate-600 font-semibold">{reg.team?.name || '-'}</td>
                           
                           </tr>
                       );`;

const tableRowNew = `                       return (
                         <tr key={reg._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                           <td className="py-3 px-1 border border-slate-200 text-center font-semibold text-slate-700">{idx + 1}</td>
                           <td className="py-3 px-1 border border-slate-200 text-center font-bold text-blue-700 text-base"></td>
                           <td className="py-3 px-2 border border-slate-200 text-slate-800 text-xs font-bold">{adNos}</td>
                           <td className="py-3 px-3 border border-slate-200 font-medium text-slate-800 text-xs">{names}</td>
                           <td className="py-3 px-2 border border-slate-200 text-slate-600 font-semibold text-xs">{reg.team?.name || '-'}</td>
                           <td className="py-3 px-1 border border-slate-200"></td>
                           <td className="py-3 px-1 border border-slate-200"></td>
                           <td className="py-3 px-2 border border-slate-200"></td>
                         </tr>
                       );`;

c = c.replace(tableRow, tableRowNew);

const emptyRow = `                       <tr key={\`empty-\${i}\`} className={(shuffledList.length + i) % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                         <td className="py-4 px-2 border border-slate-200 text-center font-semibold text-slate-400">{shuffledList.length + i + 1}</td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                       </tr>`;

const emptyRowNew = `                       <tr key={\`empty-\${i}\`} className={(shuffledList.length + i) % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                         <td className="py-4 px-1 border border-slate-200 text-center font-semibold text-slate-400">{shuffledList.length + i + 1}</td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                         <td className="border border-slate-200"></td>
                       </tr>`;

c = c.replace(emptyRow, emptyRowNew);

// Also remove from Excel export?
// The user just said "LEAVE THIS PLACE AS BLANK I SO DONT NEED FOR CODE LETTER HERE AND ADD THREE COLOUMN NEXT TO TEAM ONE FOR POSITION ONE FOR GRADE ONE FOR REMARKS"
c = c.replace(/'Code Letter': reg.codeLetter \|\| '',/g, "'Code Letter': '',");
c = c.replace(/'Team': reg.team\?\.name \|\| '-'/g, "'Team': reg.team?.name || '-',\n        'Position': '',\n        'Grade': '',\n        'Remarks': ''");

fs.writeFileSync('admin-hudafestival-main/src/pages/JurySlipsPage.jsx', c, 'utf8');
console.log("Fixed Participant List layout.");