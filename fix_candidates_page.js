const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/CandidatesPage.jsx', 'utf8');

if (!c.includes('isRegistrationOpen')) {
    // 1. Add state for isRegistrationOpen
    c = c.replace(/const isTeamLeader = userInfo\?\.role === 'team_leader';/, 
        `const isTeamLeader = userInfo?.role === 'team_leader';\n  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);`);
        
    // 2. Fetch settings
    c = c.replace(/const \[teamsRes, candidatesRes\] = await Promise\.all\(\[api\.get\('\/teams'\), api\.get\('\/candidates'\)\]\);/,
        `const [teamsRes, candidatesRes, settingsRes] = await Promise.all([api.get('/teams'), api.get('/candidates'), api.get('/settings').catch(() => ({ data: {} }))]);
        if (settingsRes.data?.isRegistrationOpen !== undefined) setIsRegistrationOpen(settingsRes.data.isRegistrationOpen);`);
        
    // 3. Hide Add Candidate button
    c = c.replace(/<Button onClick=\{\(\) => setModalOpen\(true\)\}/,
        `{(!isTeamLeader || isRegistrationOpen) && (<Button onClick={() => setModalOpen(true)}`);
    c = c.replace(/Add Candidate\s*<\/Button>/, `Add Candidate\n          </Button>)}`);
    
    // 4. Hide Edit / Delete buttons
    const rowActionStr = `<div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">`;
    c = c.replace(rowActionStr, `<div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      {(!isTeamLeader || isRegistrationOpen) && (
                        <>`);
                        
    c = c.replace(/<Trash2 size=\{18\} \/>\s*<\/button>\s*<\/div>/, `<Trash2 size={18} />
                        </button>
                        </>
                      )}
                    </div>`);
    
    fs.writeFileSync('admin-hudafestival-main/src/pages/CandidatesPage.jsx', c, 'utf8');
    console.log("Patched CandidatesPage.jsx");
} else {
    console.log("Already patched");
}