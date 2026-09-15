require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Registration = require('./models/Registration');
    const Team = require('./models/Team');

    const tahrir = await Team.findOne({ name: 'Tahrir' });
    
    const regs = await Registration.find({});
    
    if (tahrir) {
        const tahrirRegs = regs.filter(r => r.team.toString() === tahrir._id.toString());
        console.log('Tahrir Total Reg Docs:', tahrirRegs.length);
        
        const uniqueProgs = new Set(tahrirRegs.map(r => r.programme.toString()));
        console.log('Tahrir Total Unique Programmes:', uniqueProgs.size);
    }
    
    process.exit(0);
});
