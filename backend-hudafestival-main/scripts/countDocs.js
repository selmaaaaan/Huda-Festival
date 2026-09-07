const mongoose = require('mongoose');
require('dotenv').config();

const Team = require('../models/Team');
const Candidate = require('../models/Candidate');
const Programme = require('../models/Programme');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('MongoDB connected successfully for counting.');
        try {
            const teamCount = await Team.countDocuments();
            const candidateCount = await Candidate.countDocuments();
            const programmeCount = await Programme.countDocuments();
            
            console.log(`\n--- Database Document Counts ---`);
            console.log(`Teams: ${teamCount}`);
            console.log(`Candidates: ${candidateCount}`);
            console.log(`Programmes: ${programmeCount}`);
            console.log(`--------------------------------\n`);
        } catch (err) {
            console.error('Error counting documents:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
