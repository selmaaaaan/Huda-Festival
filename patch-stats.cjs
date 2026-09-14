const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

const derivedStatsOld = `  const approvedCount = useMemo(() => myRegistrations.filter(r => r.status === 'approved').length, [myRegistrations]);
  const pendingCount  = useMemo(() => myRegistrations.filter(r => r.status === 'pending').length, [myRegistrations]);`;

const derivedStatsNew = `  const approvedCount = useMemo(() => (activeTab === 'topics' ? myTopics : myRegistrations).filter(r => r.status === 'approved').length, [myRegistrations, myTopics, activeTab]);
  const pendingCount  = useMemo(() => (activeTab === 'topics' ? myTopics : myRegistrations).filter(r => r.status === 'pending').length, [myRegistrations, myTopics, activeTab]);`;

code = code.replace(derivedStatsOld, derivedStatsNew);

const statCardOld = `            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Team Members"    value={memberCount}                  accent={teamColor} />
              <StatCard label="Total Submitted" value={myRegistrations.length}       />
              <StatCard label="Approved"        value={approvedCount}                accent="#22c55e" />
              <StatCard label="Pending Review"  value={pendingCount}                 accent="#f59e0b" />
            </div>`;

const statCardNew = `            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Team Members"    value={memberCount}                  accent={teamColor} />
              <StatCard label={activeTab === 'topics' ? 'Total Topics' : 'Total Submitted'} value={activeTab === 'topics' ? myTopics.length : myRegistrations.length}       />
              <StatCard label="Approved"        value={approvedCount}                accent="#22c55e" />
              <StatCard label="Pending Review"  value={pendingCount}                 accent="#f59e0b" />
            </div>`;

code = code.replace(statCardOld, statCardNew);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', code);
console.log('Fixed StatCards in TeamLeaderDashboard');
