const fs = require('fs');
let content = fs.readFileSync('../backend-hudafestival-main/routes/authRoutes.js', 'utf8');

content = content.replace(
    'getAllTeamLeaders\n}',
    'getAllTeamLeaders,\n    updateTeamLeader\n}'
);

content = content.replace(
    `router.get('/team-leaders', protect, authorize('admin'), getAllTeamLeaders);`,
    `router.get('/team-leaders', protect, authorize('admin'), getAllTeamLeaders);\nrouter.patch('/team-leaders/:id', protect, authorize('admin'), updateTeamLeader);`
);

fs.writeFileSync('../backend-hudafestival-main/routes/authRoutes.js', content);
