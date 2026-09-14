require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Registration = require('./models/Registration');
    const Programme = require('./models/Programme');
    const Team = require('./models/Team');

    const tahrir = await Team.findOne({ name: 'Tahrir' });
    const bidayaProgs = await Programme.find({ category: 'BIDĀYAH' });
    const bidayaIds = bidayaProgs.map(p => p._id);
    
    const regs = await Registration.find({ programme: { $in: bidayaIds } });
    
    if (tahrir) {
        const tahrirRegs = regs.filter(r => r.team.toString() === tahrir._id.toString());
        console.log('Tahrir BIDAYAH Reg Docs:', tahrirRegs.length);
        
        const uniqueProgs = new Set(tahrirRegs.map(r => r.programme.toString()));
        console.log('Tahrir BIDAYAH Unique Programmes:', uniqueProgs.size);
    }
    
    process.exit(0);
});
