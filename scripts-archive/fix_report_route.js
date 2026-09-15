const fs = require('fs');
let routeContent = fs.readFileSync('backend-hudafestival-main/routes/registrationRoutes.js', 'utf-8');

routeContent = routeContent.replace(
  "getParticipantReport, protect, authorize } = require('../middlewares/authMiddleware');",
  "protect, authorize } = require('../middlewares/authMiddleware');"
);

routeContent = routeContent.replace(
  "createRegistration, getRegistrations,",
  "getParticipantReport, createRegistration, getRegistrations,"
);

fs.writeFileSync('backend-hudafestival-main/routes/registrationRoutes.js', routeContent, 'utf-8');
console.log('Fixed');