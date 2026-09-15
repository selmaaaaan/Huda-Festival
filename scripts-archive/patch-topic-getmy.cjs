const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', 'utf8');

const getMyOld = `const getMyTopicSubmissions = async (req, res) => {
    try {
        // Assuming team leader's team is linked or they query by their ID
        const topics = await TopicRegistration.find({ submittedBy: req.user._id })`;

const getMyNew = `const getMyTopicSubmissions = async (req, res) => {
    try {
        const query = req.user.role === 'team_leader' ? { team: req.user.team } : { submittedBy: req.user._id };
        const topics = await TopicRegistration.find(query)`;

code = code.replace(getMyOld, getMyNew);

fs.writeFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', code);
console.log('Patched getMyTopicSubmissions');
