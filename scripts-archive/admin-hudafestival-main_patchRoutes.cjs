const fs = require('fs');
let content = fs.readFileSync('../backend-hudafestival-main/routes/registrationRoutes.js', 'utf8');

content = content.replace(
  `router.route('/:id')\r\n  .patch(protect, authorize('admin', 'judge'), updateRegistration)\r\n  .delete(protect, authorize('admin', 'judge'), deleteRegistration);`,
  `router.route('/:id')\r\n  .patch(protect, authorize('admin', 'judge', 'team_leader'), updateRegistration)\r\n  .delete(protect, authorize('admin', 'judge', 'team_leader'), deleteRegistration);`
);

content = content.replace(
  `router.route('/:id')\n  .patch(protect, authorize('admin', 'judge'), updateRegistration)\n  .delete(protect, authorize('admin', 'judge'), deleteRegistration);`,
  `router.route('/:id')\n  .patch(protect, authorize('admin', 'judge', 'team_leader'), updateRegistration)\n  .delete(protect, authorize('admin', 'judge', 'team_leader'), deleteRegistration);`
);

fs.writeFileSync('../backend-hudafestival-main/routes/registrationRoutes.js', content);
