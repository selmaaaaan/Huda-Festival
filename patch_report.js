const fs = require('fs');

// 1. Controller
const controllerPath = 'backend-hudafestival-main/controllers/registrationController.js';
let ctrlContent = fs.readFileSync(controllerPath, 'utf-8');

const reportLogic = `
const getParticipantReport = async (req, res) => {
    try {
        const Registration = require('../models/Registration');
        const TopicRegistration = require('../models/TopicRegistration');
        
        // Fetch all approved/pending registrations (exclude rejected?)
        // The prompt says "Lists all participants across all programs". Let's just exclude rejected.
        const registrations = await Registration.find({ status: { $ne: 'rejected' } })
            .populate('team', 'name')
            .populate('programme', 'name code type stageType category format')
            .populate('candidates', 'name admissionNo classLevel')
            .lean();
            
        // Fetch topics
        const topics = await TopicRegistration.find().lean();
        
        const report = [];
        
        registrations.forEach(reg => {
            if (!reg.programme || !reg.team || !reg.candidates) return;
            
            reg.candidates.forEach(cand => {
                let candTopic = null;
                // Group format topic is saved without candidateId
                if (reg.programme.format === 'Group') {
                    const t = topics.find(t => t.programme?.toString() === reg.programme._id.toString() && t.team?.toString() === reg.team._id.toString());
                    if (t) candTopic = t.topic;
                } else {
                    const t = topics.find(t => t.programme?.toString() === reg.programme._id.toString() && t.team?.toString() === reg.team._id.toString() && t.candidate?.toString() === cand._id.toString());
                    if (t) candTopic = t.topic;
                }
                
                report.push({
                    teamName: reg.team.name,
                    candidateName: cand.name,
                    admissionNo: cand.admissionNo || '',
                    category: cand.classLevel || reg.programme.category, // fallback to prog category
                    programmeName: reg.programme.name,
                    programmeCode: reg.programme.code || '',
                    programmeFormat: reg.programme.format || 'Individual',
                    stageType: reg.programme.stageType === 'stage' ? 'Stage' : 'Non-Stage',
                    topic: candTopic || 'N/A',
                    status: reg.status
                });
            });
        });
        
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
};
`;

ctrlContent = ctrlContent.replace('module.exports = {', reportLogic + '\nmodule.exports = {');
ctrlContent = ctrlContent.replace('getRegistrations,', 'getRegistrations,\n    getParticipantReport,');
fs.writeFileSync(controllerPath, ctrlContent, 'utf-8');

// 2. Routes
const routePath = 'backend-hudafestival-main/routes/registrationRoutes.js';
let routeContent = fs.readFileSync(routePath, 'utf-8');
routeContent = routeContent.replace('const {', 'const {\n  getParticipantReport,');
routeContent = routeContent.replace("router.route('/')", "router.get('/report/participant-list', protect, authorize('admin'), getParticipantReport);\n\nrouter.route('/')");
fs.writeFileSync(routePath, routeContent, 'utf-8');

console.log('Report backend complete');