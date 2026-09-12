const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PointAdjustment = require('./models/PointAdjustment');
const Team = require('./models/Team');
const Candidate = require('./models/Candidate');
dotenv.config();

async function testCascade() {
    await mongoose.connect(process.env.MONGO_URI);
    const candidate = await Candidate.findOne({}).populate('team');
    if(!candidate) { console.log('No candidate found'); return process.exit(0); }
    
    console.log('Initial Candidate:', candidate.totalPoints);
    console.log('Initial Team:', candidate.team.totalPoints);
    
    const { createAdjustment, deleteAdjustment } = require('./controllers/pointAdjustmentController');
    const req = { body: { appliesTo: 'candidate', candidateId: candidate._id, type: 'deduct', points: 5, reason: 'test' }, user: { _id: new mongoose.Types.ObjectId() } };
    
    let adjResponse; 
    const mockRes2 = { status: () => ({ json: (data) => { adjResponse = data; return data; } }) };
    
    await createAdjustment(req, mockRes2);
    
    const updated = await Candidate.findById(candidate._id).populate('team');
    console.log('Updated Candidate:', updated.totalPoints);
    console.log('Updated Team:', updated.team.totalPoints);
    
    await deleteAdjustment({ params: { id: adjResponse._id } }, { status: () => ({ json: () => {} }) });
    mongoose.disconnect();
}
testCascade();
