const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    gradePoints: {
        type: Map, 
        of: Number,
        default: {
            'A': 5, 'B': 3
        }
    },
    isRegistrationOpen: {
        type: Boolean,
        default: true
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    maintenanceMessage: {
        type: String,
        default: "We'll be back soon."
    },
    bylawUrl: {
        type: String,
        default: null
    }
}, { timestamps: true })

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;