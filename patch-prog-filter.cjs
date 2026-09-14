const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

const oldProgFilter = `  const topicProgrammesInCategory = useMemo(() => 
    topicCategory
      ? topicEnabledProgrammes.filter(p => p.category === topicCategory)
      : [],
    [topicEnabledProgrammes, topicCategory]);`;

const newProgFilter = `  const topicProgrammesInCategory = useMemo(() => {
    if (!topicCategory) return [];
    // Only allow selecting programmes the team has actually registered for
    const registeredProgrammeIds = myRegistrations.map(r => r.programme._id || r.programme);
    return topicEnabledProgrammes.filter(p => 
      p.category === topicCategory && registeredProgrammeIds.includes(p._id)
    );
  }, [topicEnabledProgrammes, topicCategory, myRegistrations]);`;

code = code.replace(oldProgFilter, newProgFilter);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', code);
console.log('Patched topicProgrammesInCategory in TeamLeaderDashboard');
