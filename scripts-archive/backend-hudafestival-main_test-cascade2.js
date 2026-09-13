const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PointAdjustment = require('./models/PointAdjustment');
const Team = require('./models/Team');
const Candidate = require('./models/Candidate');
const { getLeaderboards } = require('./controllers/leaderboardController');
dotenv.config();

async function testCascade() {
    await mongoose.connect(process.env.MONGO_URI);
    const candidate = await Candidate.findOne({}).populate('team');
    
    let lbData1;
    await getLeaderboards({}, { status: () => ({ json: (d) => { lbData1 = d; } }) });
    const c1 = lbData1.categoryTopStudents.find(c => c.category === candidate.category)?.candidates;
    console.log('Initial Toppers for', candidate.category, c1.slice(0, 3).map(c => c.name + ':' + c.totalPoints));
    
    const { createAdjustment, deleteAdjustment } = require('./controllers/pointAdjustmentController');
    const req = { body: { appliesTo: 'candidate', candidateId: candidate._id, type: 'add', points: 100, reason: 'test' }, user: { _id: new mongoose.Types.ObjectId() } };
    let adjResponse; 
    await createAdjustment(req, { status: () => ({ json: (data) => { adjResponse = data; } }) });
    
    let lbData2;
    await getLeaderboards({}, { status: () => ({ json: (d) => { lbData2 = d; } }) });
    const c2 = lbData2.categoryTopStudents.find(c => c.category === candidate.category)?.candidates;
    console.log('Final Toppers for', candidate.category, c2.slice(0, 3).map(c => c.name + ':' + c.totalPoints));
    
    await deleteAdjustment({ params: { id: adjResponse._id } }, { status: () => ({ json: () => {} }) });
    mongoose.disconnect();
}
testCascade();
