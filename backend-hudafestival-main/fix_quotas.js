require('mongoose').connect('mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0').then(async () => { 
    const mongoose = require('mongoose'); 
    const Programme = require('./models/Programme'); 
    const progs = await Programme.collection.find({}).toArray(); 
    for (let p of progs) { 
        if (p.participantsRaw) { 
            const num = parseInt(p.participantsRaw.toString().replace(/\*/g, '').trim()); 
            if (!isNaN(num)) { 
                await Programme.collection.updateOne({ _id: p._id }, { $set: { maxParticipants: num } }); 
            } 
        } 
    } 
    console.log('Updated maxParticipants using raw collection'); 
    process.exit(); 
})
