const fs = require('fs');

// --- Patch registrationController.js ---
let regCtrl = fs.readFileSync('backend-hudafestival-main/controllers/registrationController.js', 'utf8');

// For createRegistration
regCtrl = regCtrl.replace(
    /const programme = await Programme\.findById\(programmeId\);\n\s*if \(!programme\) return res\.status\(404\)\.json\({ message: 'Programme not found' }\);/,
    `const programme = await Programme.findById(programmeId);
        if (!programme) return res.status(404).json({ message: 'Programme not found' });

        if (settings && settings.categoryRegistrationStatus) {
            const catStatus = settings.categoryRegistrationStatus.get(programme.category);
            if (catStatus === false) {
                return res.status(403).json({ message: \`Registration for category \${programme.category} is closed\` });
            }
        }`
);

// For updateRegistration, we should also enforce global AND category settings
regCtrl = regCtrl.replace(
    /const registration = await Registration\.findById\(req\.params\.id\)\.populate\('programme'\);\n\s*if \(!registration\) return res\.status\(404\)\.json\({ message: 'Registration not found' }\);/,
    `const registration = await Registration.findById(req.params.id).populate('programme');
        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        
        const settings = await Settings.findOne();
        if (settings && settings.isRegistrationOpen === false) {
            return res.status(403).json({ message: 'Registration is closed globally' });
        }
        if (settings && settings.categoryRegistrationStatus) {
            const catStatus = settings.categoryRegistrationStatus.get(registration.programme.category);
            if (catStatus === false) {
                return res.status(403).json({ message: \`Registration for category \${registration.programme.category} is closed\` });
            }
        }`
);

fs.writeFileSync('backend-hudafestival-main/controllers/registrationController.js', regCtrl);
console.log('Patched registrationController.js');

// --- Patch TeamLeaderDashboard.jsx ---
let tld = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

// Add openTopicForm function
if (!tld.includes('const openTopicForm = () => {')) {
    tld = tld.replace(
        /const openNewRegistration = \(\) => {/,
        `const openTopicForm = () => {
    setSuccess(false); setError('');
    setTopicForm({ programmeId: '', candidateId: '', topic: '' });
    setTopicCategory('');
    setShowTopicForm(true);
  };

  const openNewRegistration = () => {`
    );
}

// Fix the onClick handler for the button
tld = tld.replace(
    /<Button onClick={openNewRegistration} variant="primary" className="shadow-md">\s*<Plus size={15} \/>\s*\{activeTab === 'topics' \? 'Submit Topic' : 'New Registration'\}\s*<\/Button>/g,
    `<Button onClick={activeTab === 'topics' ? openTopicForm : openNewRegistration} variant="primary" className="shadow-md" disabled={activeTab !== 'topics' && isRegistrationOpen === false}>
                  <Plus size={15} />
                  {activeTab === 'topics' ? 'Submit Topic' : 'New Registration'}
                </Button>`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', tld);
console.log('Patched TeamLeaderDashboard.jsx');
