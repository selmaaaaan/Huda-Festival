const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/registrationController.js', 'utf8');

const updateMatch = `const updateRegistration = async (req, res) => {
    try {`;
const updateReplace = `const updateRegistration = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        if (settings && settings.isRegistrationOpen === false && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Registration is closed by Fest Admins' });
        }`;

c = c.replace(updateMatch, updateReplace);

const deleteMatch = `const deleteRegistration = async (req, res) => {
    try {`;
const deleteReplace = `const deleteRegistration = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        if (settings && settings.isRegistrationOpen === false && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Registration is closed by Fest Admins' });
        }`;

c = c.replace(deleteMatch, deleteReplace);

fs.writeFileSync('backend-hudafestival-main/controllers/registrationController.js', c, 'utf8');