const mongoose = require('mongoose');
require('dotenv').config();

const Result = require('../models/Result');
const Team = require('../models/Team');
const Candidate = require('../models/Candidate');
const Programme = require('../models/Programme');

const clearAllResults = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        console.log('Deleting all Results...');
        await Result.deleteMany({});

        console.log('Resetting Team points...');
        await Team.updateMany({}, { $set: { totalPoints: 0 } });

        console.log('Resetting Candidate points...');
        await Candidate.updateMany({}, { $set: { totalPoints: 0 } });

        console.log('Resetting Programme isResultPublished flags...');
        await Programme.updateMany({}, { $set: { isResultPublished: false } });

        console.log('All results and points cleared successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing results:', error);
        process.exit(1);
    }
};

clearAllResults();
