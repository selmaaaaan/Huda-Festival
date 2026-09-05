const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    gradePoints: {
        type: Map, 
        of: Number,
        default: {
            'A': 5, 'B': 3
        }
    },
}, { timestamps: true })

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;