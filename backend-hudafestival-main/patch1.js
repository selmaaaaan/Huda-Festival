const fs = require('fs');
let txt = fs.readFileSync('controllers/registrationController.js', 'utf8');

txt = txt.replace(
`        if (settings && settings.isRegistrationOpen === false) {
            return res.status(403).json({ message: 'Registration is closed by Fest Admins' });
        }`,
    ''
);

const checkStr = `        const programme = await Programme.findById(programmeId);
        if (!programme) return res.status(404).json({ message: 'Programme not found' });`;

const newCheckStr = `${checkStr}

        if (settings) {
            if (settings.isRegistrationOpen === false) {
                return res.status(403).json({ message: 'Registration is closed globally by Fest Admins' });
            }
            if (settings.categoryRegistrationStatus && settings.categoryRegistrationStatus.get(programme.category) === false) {
                return res.status(403).json({ message: \`Registration is closed for \${programme.category} category\` });
            }
        }`;

txt = txt.replace(checkStr, newCheckStr);
fs.writeFileSync('controllers/registrationController.js', txt);
