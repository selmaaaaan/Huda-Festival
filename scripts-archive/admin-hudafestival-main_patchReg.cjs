const fs = require('fs');
let content = fs.readFileSync('../backend-hudafestival-main/controllers/registrationController.js', 'utf8');

const oldUpdate = `const updateRegistration = async (req, res) => {
    try {
        const { candidateIds } = req.body;
        const registration = await Registration.findById(req.params.id).populate('programme');
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        if (registration.status === 'approved') {
            return res.status(400).json({ message: 'Cannot update approved registration' });
        }

        if (candidateIds && Array.isArray(candidateIds)) {`;

const newUpdate = `const updateRegistration = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        if (settings && settings.isRegistrationOpen === false && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Registration is closed by Fest Admins' });
        }

        const { candidateIds } = req.body;
        const registration = await Registration.findById(req.params.id).populate('programme');
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        // Team leader ownership check
        if (req.user.role === 'team_leader' && registration.team.toString() !== req.user.team.toString()) {
            return res.status(403).json({ message: 'You can only update your own team\\'s registrations' });
        }

        if (registration.status === 'approved' && req.user.role !== 'admin') {
            return res.status(400).json({ message: 'Cannot update approved registration' });
        }

        if (candidateIds && Array.isArray(candidateIds)) {`;

content = content.replace(oldUpdate, newUpdate);
fs.writeFileSync('../backend-hudafestival-main/controllers/registrationController.js', content);
