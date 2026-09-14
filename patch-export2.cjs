const fs = require('fs');
const filePath = 'admin-hudafestival-main/src/pages/JurySlipsPage.jsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add xlsx import
if (!code.includes("import * as XLSX")) {
    code = code.replace("import Button from '../components/Button';", "import Button from '../components/Button';\nimport * as XLSX from 'xlsx';");
}

// 2. Add Export Functions
const exportFunctions = `  const handleExportCurrent = () => {
    if (shuffledList.length === 0 && registrations.length === 0) return;
    const listToExport = shuffledList.length > 0 ? shuffledList : registrations;

    const data = listToExport.map((reg, idx) => ({
      'SL.No': idx + 1,
      'Code Letter': reg.codeLetter || '',
      'Ad No': reg.candidates?.map(c => c.admissionNo).join(', ') || '-',
      'Name': reg.candidates?.map(c => c.name).join(', ') || '-',
      'Team': reg.team?.name || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    XLSX.writeFile(wb, \`\${selectedProgramme?.name || 'Programme'}_Participants.xlsx\`);
  };

  const handleExportAll = async () => {
    setLoading(true);
    try {
      const res = await api.get(\`/registrations?status=approved&limit=100000\`);
      const allRegs = res.data.registrations || res.data.data || [];
      if (allRegs.length === 0) { alert('No approved registrations found.'); return; }

      const wb = XLSX.utils.book_new();
      const grouped = {};
      allRegs.forEach(reg => {
        if (!reg.programme) return;
        const progName = reg.programme.name;
        if (!grouped[progName]) grouped[progName] = [];
        grouped[progName].push(reg);
      });

      Object.keys(grouped).forEach(progName => {
        let progRegs = grouped[progName];
        progRegs.sort((a, b) => {
          const teamA = a.team?.name || '';
          const teamB = b.team?.name || '';
          return teamA.localeCompare(teamB);
        });

        progRegs = progRegs.map((reg, index) => {
           let letter = '';
           let temp = index;
           while (temp >= 0) {
             letter = String.fromCharCode(65 + (temp % 26)) + letter;
             temp = Math.floor(temp / 26) - 1;
           }
           return { ...reg, codeLetter: letter };
        });

        const data = progRegs.map((reg, idx) => ({
          'SL.No': idx + 1,
          'Code Letter': reg.codeLetter || '',
          'Ad No': reg.candidates?.map(c => c.admissionNo).join(', ') || '-',
          'Name': reg.candidates?.map(c => c.name).join(', ') || '-',
          'Team': reg.team?.name || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        let safeSheetName = progName.substring(0, 31).replace(/[\\\\\/\?\*\\[\\]]/g, '');
        let uniqueName = safeSheetName;
        let counter = 1;
        while(wb.SheetNames.includes(uniqueName)) {
            uniqueName = safeSheetName.substring(0, 28) + '(' + counter + ')';
            counter++;
        }
        XLSX.utils.book_append_sheet(wb, ws, uniqueName);
      });
      XLSX.writeFile(wb, "All_Programmes_Participants.xlsx");
    } catch (err) {
      console.error(err);
      alert('Failed to export all programmes');
    } finally {
      setLoading(false);
    }
  };`;

if (!code.includes("handleExportAll")) {
    code = code.replace("const handleGenerate = () => {", exportFunctions + "\n\n  const handleGenerate = () => {");
}

// Replace the first set of buttons
code = code.replace(
  `<Button onClick={handleGenerate} variant="primary" className="mx-auto">
                <RefreshCw size={18} className="mr-2" /> Generate List
              </Button>`,
  `<div className="flex gap-3 justify-center mt-4 w-full">
                <Button onClick={handleGenerate} variant="primary">
                  <RefreshCw size={16} className="mr-2" /> Generate List
                </Button>
                <Button onClick={handleExportCurrent} variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  <FileText size={16} className="mr-2" /> Export Excel
                </Button>
                <Button onClick={handleExportAll} variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                  <BarChart2 size={16} className="mr-2" /> Export All
                </Button>
              </div>`
);

// Replace the second set of buttons
code = code.replace(
  `<div className="flex justify-end gap-3 mt-4">
              <Button onClick={handleGenerate} variant="outline">
                <RefreshCw size={16} className="mr-2" /> Refresh
              </Button>
              <Button onClick={handlePrint} variant="primary">
                <Printer size={16} className="mr-2" /> Print Participant List
              </Button>
            </div>`,
  `<div className="flex justify-end gap-3 mt-4 flex-wrap">
              <Button onClick={handleGenerate} variant="outline">
                <RefreshCw size={16} className="mr-2" /> Refresh
              </Button>
              <Button onClick={handleExportCurrent} variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                <FileText size={16} className="mr-2" /> Export Excel
              </Button>
              <Button onClick={handleExportAll} variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                <BarChart2 size={16} className="mr-2" /> Export All
              </Button>
              <Button onClick={handlePrint} variant="primary">
                <Printer size={16} className="mr-2" /> Print Participant List
              </Button>
            </div>`
);

// Replace the empty TD with codeLetter
const tdOld = `<td className="py-3 px-2 border border-slate-200 text-center font-bold text-blue-700 text-base"></td>`;
const tdNew = `<td className="py-3 px-2 border border-slate-200 text-center font-bold text-blue-700 text-base">{reg.codeLetter || ''}</td>`;
code = code.replace(tdOld, tdNew);

fs.writeFileSync(filePath, code);
console.log("Successfully patched JurySlipsPage.jsx without destroying it!");
