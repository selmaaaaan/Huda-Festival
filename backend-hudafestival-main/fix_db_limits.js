require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('./models/Registration');
const Programme = require('./models/Programme');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const regs = await Registration.find().populate('programme');
    let fixed = 0;
    
    for (const r of regs) {
        if (!r.programme) continue;
        const max = r.programme.maxParticipants || Infinity;
        if (r.candidates.length > max) {
            console.log(`Fixing Registration ${r._id} for Programme ${r.programme.code}: Had ${r.candidates.length} candidates, limit is ${max}`);
            r.candidates = r.candidates.slice(0, max);
            await r.save();
            fixed++;
        }
    }
    
    console.log(`Fixed ${fixed} registrations.`);
    process.exit(0);
});