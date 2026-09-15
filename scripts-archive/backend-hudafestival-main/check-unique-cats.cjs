require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Registration = require('./models/Registration');
    const Programme = require('./models/Programme');
    const Team = require('./models/Team');

    const tahrir = await Team.findOne({ name: 'Tahrir' });
    const regs = await Registration.find({ team: tahrir._id });
    const progs = await Programme.find({ _id: { $in: regs.map(r => r.programme) } });

    const catCounts = {};
    progs.forEach(p => {
        catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });

    console.log('Tahrir unique programmes registered per category:', catCounts);
    process.exit(0);
});
