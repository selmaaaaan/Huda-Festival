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
      // Fetch all approved registrations
      const res = await api.get(\`/registrations?status=approved&limit=100000\`);
      const allRegs = res.data.registrations || res.data.data || [];
      
      if (allRegs.length === 0) {
        alert('No approved registrations found.');
        return;
      }

      const wb = XLSX.utils.book_new();
      
      // Group by programme
      const grouped = {};
      allRegs.forEach(reg => {
        if (!reg.programme) return;
        const progName = reg.programme.name;
        if (!grouped[progName]) grouped[progName] = [];
        grouped[progName].push(reg);
      });

      // For each programme, sort by team, generate code letter, create sheet
      Object.keys(grouped).forEach(progName => {
        let progRegs = grouped[progName];
        
        // Sort by team
        progRegs.sort((a, b) => {
          const teamA = a.team?.name || '';
          const teamB = b.team?.name || '';
          return teamA.localeCompare(teamB);
        });

        // Generate code letters
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
        
        // Sheet names max 31 chars
        let safeSheetName = progName.substring(0, 31).replace(/[\\\\\/\?\*\\[\\]]/g, '');
        // Handle duplicate sheet names
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

// 3. Add Export Buttons to UI
const buttonsOld = `<Button 
                onClick={handleGenerate} 
                disabled={registrations.length === 0}
                variant="primary"
                className="gap-2"
              >
                <RefreshCw size={16} />
                Generate List
              </Button>
              <Button 
                onClick={handlePrint} 
                disabled={shuffledList.length === 0}
                variant="outline"
                className="gap-2"
              >
                <Printer size={16} />
                Print List
              </Button>`;

const buttonsNew = `<Button 
                onClick={handleGenerate} 
                disabled={registrations.length === 0}
                variant="primary"
                className="gap-2"
              >
                <RefreshCw size={16} />
                Generate List
              </Button>
              <Button 
                onClick={handleExportCurrent} 
                disabled={registrations.length === 0}
                variant="outline"
                className="gap-2"
              >
                <FileText size={16} />
                Export Excel
              </Button>
              <Button 
                onClick={handleExportAll} 
                variant="outline"
                className="gap-2 border-green-500 text-green-600 hover:bg-green-50"
              >
                <BarChart2 size={16} />
                Export All (Excel)
              </Button>
              <Button 
                onClick={handlePrint} 
                disabled={shuffledList.length === 0}
                variant="outline"
                className="gap-2"
              >
                <Printer size={16} />
                Print List
              </Button>`;

code = code.replace(buttonsOld, buttonsNew);

// Make sure code letters are rendered in the HTML table even if they are missing
// Wait, the original code had:
// <td className="py-3 px-2 border border-slate-200 text-center font-bold text-blue-700 text-base"></td>
// I should inject the actual codeLetter!
const tdOld = `<td className="py-3 px-2 border border-slate-200 text-center font-bold text-blue-700 text-base"></td>`;
const tdNew = `<td className="py-3 px-2 border border-slate-200 text-center font-bold text-blue-700 text-base">{reg.codeLetter || ''}</td>`;
code = code.replace(tdOld, tdNew);

fs.writeFileSync(filePath, code);
