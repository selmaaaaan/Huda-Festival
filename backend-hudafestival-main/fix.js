require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    await db.collection('programmes').updateOne(
        { _id: new mongoose.Types.ObjectId('6aa5a74e566a9aff72a94e02') },
        { $set: { groupSize: 4 } }
    );
    console.log('Updated!');
    process.exit(0);
});
