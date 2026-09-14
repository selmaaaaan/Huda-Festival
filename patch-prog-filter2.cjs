const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

const regex = /const topicProgrammesInCategory = useMemo\(\(\) =>\s*topicCategory\s*\?\s*eligibleTopicProgrammes\.filter\(p => p\.category === topicCategory \|\| p\.category === 'KULLIYYAH'\)\s*:\s*\[\],\s*\[eligibleTopicProgrammes, topicCategory\]\);/s;

const newProgFilter = `const topicProgrammesInCategory = useMemo(() => {
    if (!topicCategory) return [];
    // Only allow selecting programmes the team has actually registered for
    const registeredProgrammeIds = myRegistrations.filter(r => r.status !== 'rejected').map(r => r.programme._id || r.programme);
    return eligibleTopicProgrammes.filter(p => 
      (p.category === topicCategory || p.category === 'KULLIYYAH') && registeredProgrammeIds.includes(p._id)
    );
  }, [eligibleTopicProgrammes, topicCategory, myRegistrations]);`;

const newCode = code.replace(regex, newProgFilter);
if (newCode === code) {
    console.error("Replacement failed.");
} else {
    fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', newCode);
    console.log("Replacement successful.");
}
