const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        unique: true,
    },
    totalPoints: {
        type: Number,
        default: 0,
    },
    color: {
        type: String,
        default: '#6B7280',
    },
    motto: {
        type: String,
        required: false,
    }
}, { timestamps: true })

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;