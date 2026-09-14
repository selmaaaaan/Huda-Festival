const fs = require('fs');
const filePath = 'admin-hudafestival-main/src/pages/JurySlipsPage.jsx';
let code = fs.readFileSync(filePath, 'utf8');

const regexButtons = /<Button\s+onClick=\{handleGenerate\}\s+disabled=\{registrations\.length === 0\}\s+variant="primary".*?<\/Button>\s*<Button\s+onClick=\{handlePrint\}\s+disabled=\{shuffledList\.length === 0\}\s+variant="outline".*?<\/Button>/s;

const newButtons = `<Button 
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
                disabled={shuffledList.length === 0 && registrations.length === 0}
                variant="outline"
                className="gap-2 border-green-500 text-green-600 hover:bg-green-50"
              >
                <FileText size={16} />
                Export Excel
              </Button>
              <Button 
                onClick={handleExportAll} 
                variant="outline"
                className="gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
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

const newCode = code.replace(regexButtons, newButtons);
if (newCode === code) {
    console.error("Failed to inject buttons in JurySlipsPage.jsx");
    // fallback, inject before '</div>' that closes the buttons
    const regexFallback = /(<Button.*?onClick=\{handleGenerate\}.*?<\/Button>.*?<Button.*?onClick=\{handlePrint\}.*?<\/Button>)/s;
    const fallbackCode = code.replace(regexFallback, newButtons);
    if (fallbackCode !== code) {
        fs.writeFileSync(filePath, fallbackCode);
        console.log("Injected using fallback regex");
    } else {
        console.log("Fallback also failed");
    }
} else {
    fs.writeFileSync(filePath, newCode);
    console.log("Injected buttons successfully");
}
