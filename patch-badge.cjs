const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf8');

// The badge HTML
const badgeOld = `<div className={\`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold \${isCompliant ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}\`}>
                                                    {isCompliant ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                                                    {isCompliant ? 'Compliant' : 'Pending'}
                                                </div>`;

const badgeNew = `                                                <div className={\`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold \${
                                                    cand.bylawStatus?.status === 'compliant' ? 'bg-green-500/10 text-green-600' :
                                                    cand.bylawStatus?.status === 'violated' ? 'bg-red-500/10 text-red-600' :
                                                    'bg-orange-500/10 text-orange-600'
                                                }\`}>
                                                    {cand.bylawStatus?.status === 'compliant' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                                                    {cand.bylawStatus?.status === 'compliant' ? 'Compliant' : cand.bylawStatus?.status === 'violated' ? 'Violated' : 'Pending'}
                                                </div>`;
code = code.replace(badgeOld, badgeNew);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', code);
console.log('Patched frontend status colors');
