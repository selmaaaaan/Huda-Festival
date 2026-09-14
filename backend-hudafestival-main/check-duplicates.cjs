require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Registration = require('./models/Registration');
    const Programme = require('./models/Programme');
    const Team = require('./models/Team');

    const tahrir = await Team.findOne({ name: 'Tahrir' });
    const ulaProgs = await Programme.find({ category: 'ʾŪLĀ' });
    const ulaIds = ulaProgs.map(p => p._id);
    
    const regs = await Registration.find({ programme: { $in: ulaIds } });
    console.log('Total ULA Regs:', regs.length);
    
    if (tahrir) {
        const tahrirRegs = regs.filter(r => r.team.toString() === tahrir._id.toString());
        console.log('Tahrir ULA Regs:', tahrirRegs.length);
        
        // Count duplicates
        const progCounts = {};
        tahrirRegs.forEach(r => {
            progCounts[r.programme] = (progCounts[r.programme] || 0) + 1;
        });
        const duplicates = Object.values(progCounts).filter(c => c > 1);
        console.log('Programmes with multiple regs for Tahrir:', duplicates.length);
    }
    
    process.exit(0);
});
