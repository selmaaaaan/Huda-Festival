const mongoose = require('mongoose');
require('dotenv').config();
const Programme = require('./models/Programme');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hudafestival').then(async () => {
    const p = await Programme.updateMany(
        { name: { $in: ['PADAPPATTU', 'PADAPATTU', 'NASHEED ARB', 'RJ TALK'] } },
        { $set: { topicMode: 'free-text' } }
    );
    console.log(p);
    process.exit(0);
});
