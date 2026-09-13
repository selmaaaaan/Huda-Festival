require('mongoose').connect('mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0').then(async () => { 
    const Programme = require('./models/Programme'); 
    const result = await Programme.updateMany(
        { category: 'BIDĀYAH', name: { $nin: ['CONVERSATION MLM', 'GROUP SONG', 'SPEECH & SONG MLM'] } },
        { $set: { maxParticipants: 1 } }
    );
    console.log('Updated BIDĀYAH programmes:', result);
    process.exit(); 
});
