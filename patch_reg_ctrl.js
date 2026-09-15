const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/registrationController.js', 'utf8');

c = c.replace(/if \(settings && settings\.isRegistrationOpen === false\) \{/g, 
    `if (settings && settings.isRegistrationOpen === false && req.user.role !== 'admin' && req.user.role !== 'super_admin') {`);

fs.writeFileSync('backend-hudafestival-main/controllers/registrationController.js', c);
console.log('Patched');