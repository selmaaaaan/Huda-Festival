const fs = require('fs');
let content = fs.readFileSync('../backend-hudafestival-main/routes/topicRegistrationRoutes.js', 'utf8');

content = content.replace(
    'reviewTopic,',
    'reviewTopic,\n    updateTopic,'
);

content = content.replace(
    `router.patch('/:id/review', protect, authorize('admin'), reviewTopic);`,
    `router.patch('/:id/review', protect, authorize('admin'), reviewTopic);\nrouter.patch('/:id', protect, authorize('admin', 'judge', 'team_leader'), updateTopic);`
);

fs.writeFileSync('../backend-hudafestival-main/routes/topicRegistrationRoutes.js', content);
