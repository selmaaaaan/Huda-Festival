const fs = require('fs');
let txt = fs.readFileSync('src/pages/TeamRegistrationListPage.jsx', 'utf8');

// 1. Add individual item draft calculation inside map
const mapStart = `                                {filteredCandidates.map((cand, idx) => {
                                    const isCompliant = cand.bylawStatus?.isCompliant;`;
const mapReplacement = `                                {filteredCandidates.map((cand, idx) => {
                                    const isCompliant = cand.bylawStatus?.isCompliant;
                                    
                                    const draftAddStage = Object.keys(pendingChanges).filter(k => k.startsWith(\`\${cand._id}-\`) && pendingChanges[k] === true && programmes.find(p => p._id === k.split('-')[1])?.stageType === 'stage' && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                                    const draftRemoveStage = Object.keys(pendingChanges).filter(k => k.startsWith(\`\${cand._id}-\`) && pendingChanges[k] === false && programmes.find(p => p._id === k.split('-')[1])?.stageType === 'stage' && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                                    const currentStage = (cand.bylawStatus?.individualStageCount || 0) + draftAddStage - draftRemoveStage;

                                    const draftAddNonStage = Object.keys(pendingChanges).filter(k => k.startsWith(\`\${cand._id}-\`) && pendingChanges[k] === true && programmes.find(p => p._id === k.split('-')[1])?.stageType === 'non-stage' && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                                    const draftRemoveNonStage = Object.keys(pendingChanges).filter(k => k.startsWith(\`\${cand._id}-\`) && pendingChanges[k] === false && programmes.find(p => p._id === k.split('-')[1])?.stageType === 'non-stage' && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                                    const currentNonStage = (cand.bylawStatus?.individualNonStageCount || 0) + draftAddNonStage - draftRemoveNonStage;
`;
txt = txt.replace(mapStart, mapReplacement);

// 2. Change limit text colors (Yellow if at limit, Red if over)
const limitUiSearch = `{cand.bylawStatus?.limits && (
                                                        <div className="flex gap-1.5 text-[9px] font-semibold tracking-wide">
                                                            <span className={cand.bylawStatus.individualStageCount >= cand.bylawStatus.limits.stage ? "text-red-500" : "text-[var(--color-primary)]"}>
                                                                {cand.bylawStatus.individualStageCount}/{cand.bylawStatus.limits.stage} STG
                                                            </span>
                                                            <span className="text-[var(--color-border)]">•</span>
                                                            <span className={cand.bylawStatus.individualNonStageCount >= cand.bylawStatus.limits.nonStage ? "text-red-500" : "text-amber-500"}>
                                                                {cand.bylawStatus.individualNonStageCount}/{cand.bylawStatus.limits.nonStage} NSTG
                                                            </span>
                                                        </div>
                                                    )}`;

const limitUiReplace = `{cand.bylawStatus?.limits && (
                                                        <div className="flex gap-1.5 text-[9px] font-semibold tracking-wide">
                                                            <span className={currentStage > cand.bylawStatus.limits.stage ? "text-red-500" : (currentStage === cand.bylawStatus.limits.stage ? "text-yellow-500" : "text-[var(--color-primary)]")}>
                                                                {currentStage}/{cand.bylawStatus.limits.stage} STG
                                                            </span>
                                                            <span className="text-[var(--color-border)]">•</span>
                                                            <span className={currentNonStage > cand.bylawStatus.limits.nonStage ? "text-red-500" : (currentNonStage === cand.bylawStatus.limits.nonStage ? "text-yellow-500" : "text-[var(--color-primary)]")}>
                                                                {currentNonStage}/{cand.bylawStatus.limits.nonStage} NSTG
                                                            </span>
                                                        </div>
                                                    )}`;
txt = txt.replace(limitUiSearch, limitUiReplace);

// 3. Add front-end individual limit block inside handleCellClick
const clickSearch = `if (willBeAdded) {
            // Check Quota before allowing the tick
            const savedCount = registrations.filter(r => r.programme?._id === prog._id).reduce((acc, r) => acc + (r.candidates?.length || 0), 0);
            const draftAddCount = Object.keys(pendingChanges).filter(k => k.endsWith(\`-\${prog._id}\`) && pendingChanges[k] === true).length;
            const draftRemoveCount = Object.keys(pendingChanges).filter(k => k.endsWith(\`-\${prog._id}\`) && pendingChanges[k] === false).length;
            
            const currentCount = savedCount + draftAddCount - draftRemoveCount;
            if (currentCount >= (prog.maxParticipants || 1)) {
                setCellError({ cellId, message: \`Quota full (\${prog.maxParticipants || 1} max)\` });
                setTimeout(() => setCellError({ cellId: null, message: '' }), 3000);
                return;
            }
        }`;

const clickReplace = `if (willBeAdded) {
            // Check Quota before allowing the tick
            const savedCount = registrations.filter(r => r.programme?._id === prog._id).reduce((acc, r) => acc + (r.candidates?.length || 0), 0);
            const draftAddCount = Object.keys(pendingChanges).filter(k => k.endsWith(\`-\${prog._id}\`) && pendingChanges[k] === true).length;
            const draftRemoveCount = Object.keys(pendingChanges).filter(k => k.endsWith(\`-\${prog._id}\`) && pendingChanges[k] === false).length;
            
            const currentCount = savedCount + draftAddCount - draftRemoveCount;
            if (currentCount >= (prog.maxParticipants || 1)) {
                setCellError({ cellId, message: \`Quota full (\${prog.maxParticipants || 1} max)\` });
                setTimeout(() => setCellError({ cellId: null, message: '' }), 3000);
                return;
            }

            // Check Individual Candidate limits (skip for Group/Kulliyyah)
            if (prog.format !== 'Group' && prog.category !== 'KULLIYYAH') {
                const draftAddIndiv = Object.keys(pendingChanges).filter(k => k.startsWith(\`\${cand._id}-\`) && pendingChanges[k] === true && programmes.find(p => p._id === k.split('-')[1])?.stageType === prog.stageType && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                const draftRemoveIndiv = Object.keys(pendingChanges).filter(k => k.startsWith(\`\${cand._id}-\`) && pendingChanges[k] === false && programmes.find(p => p._id === k.split('-')[1])?.stageType === prog.stageType && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                
                const baseCount = prog.stageType === 'stage' ? cand.bylawStatus?.individualStageCount : cand.bylawStatus?.individualNonStageCount;
                const limit = prog.stageType === 'stage' ? cand.bylawStatus?.limits?.stage : cand.bylawStatus?.limits?.nonStage;
                
                if (limit && (baseCount + draftAddIndiv - draftRemoveIndiv) >= limit) {
                    setCellError({ cellId, message: \`Limit reached: \${limit} \${prog.stageType === 'stage' ? 'STG' : 'NSTG'} items\` });
                    setTimeout(() => setCellError({ cellId: null, message: '' }), 3000);
                    return;
                }
            }
        }`;
txt = txt.replace(clickSearch, clickReplace);

fs.writeFileSync('src/pages/TeamRegistrationListPage.jsx', txt);
console.log('patched TeamRegistrationListPage');
