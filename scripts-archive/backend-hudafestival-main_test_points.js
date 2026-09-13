const mongoose = require('mongoose');
require('dotenv').config();

const Programme = require('./models/Programme');
const Candidate = require('./models/Candidate');
const Team = require('./models/Team');
const Result = require('./models/Result');
const { approveForProgramme } = require('./controllers/resultController');

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const team = new Team({ name: 'Test Team', code: 'TT1' });
    await team.save();

    const cand = new Candidate({ name: 'Test Candidate', admissionNo: 'TEST1234', team: team._id, gender: 'male', category: 'BIDAYAH' });
    await cand.save();

    const tiers = [
        { name: 'Individual', format: 'Individual', isStarred: false, category: 'BIDAYAH' },
        { name: 'Starred', format: 'Individual', isStarred: true, category: 'BIDAYAH' },
        { name: 'Group', format: 'Group', isStarred: false, category: 'BIDAYAH' },
        { name: 'Kulliyyah', format: 'Individual', isStarred: false, category: 'KULLIYYAH' }
    ];

    for (const tier of tiers) {
        const prog = new Programme({ name: 'Test ' + tier.name, code: 'T_' + tier.name, type: 'Stage', category: tier.category, format: tier.format, isStarred: tier.isStarred, participantsRaw: '1' });
        await prog.save();

        const result = new Result({
            programme: prog._id,
            candidate: cand._id,
            rank: 1,
            grade: 'A',
            status: 'pending'
        });
        await result.save();

        await approveForProgramme(prog._id, { _id: cand._id, role: 'admin' });

        const updatedResult = await Result.findById(result._id);
        console.log('Tier ' + tier.name + ' - Rank 1, Grade A: ' + updatedResult.totalPoints + ' points');

        await Programme.findByIdAndDelete(prog._id);
        await Result.findByIdAndDelete(result._id);
    }
    await Team.findByIdAndDelete(team._id);
    await Candidate.findByIdAndDelete(cand._id);
    process.exit(0);
}
run().catch(console.error);
