const fs = require('fs');
let txt = fs.readFileSync('src/pages/TeamLeaderDashboard.jsx', 'utf8');

const search = `  const handleCandidateToggle = id => {
    setForm(f => {`;
const replace = `  const handleCandidateToggle = id => {
    // Check individual candidate limits before adding
    const cand = candidates.find(c => c._id === id);
    if (cand && selectedProg && !form.candidateIds.includes(id)) {
        if (selectedProg.format !== 'Group' && selectedProg.category !== 'KULLIYYAH') {
            const isStage = selectedProg.stageType === 'stage';
            const baseCount = isStage ? cand.bylawStatus?.individualStageCount : cand.bylawStatus?.individualNonStageCount;
            const limit = isStage ? cand.bylawStatus?.limits?.stage : cand.bylawStatus?.limits?.nonStage;
            
            if (limit && baseCount >= limit) {
                setError(\`\${cand.name} reached max \${isStage ? 'STG' : 'NSTG'} quota (\${limit})\`);
                setTimeout(() => setError(''), 3000);
                return;
            }
        }
    }

    setForm(f => {`;
txt = txt.replace(search, replace);
fs.writeFileSync('src/pages/TeamLeaderDashboard.jsx', txt);
console.log('patched TeamLeaderDashboard.jsx');
