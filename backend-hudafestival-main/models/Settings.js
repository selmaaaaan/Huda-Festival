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
    categoryRegistrationStatus: {
        type: Map,
        of: Boolean,
        default: {
            'BIDĀYAH': true,
            'ʾŪLĀ': true,
            'THĀNIYAH': true,
            'THĀNAWIYYAH': true,
            'ʿĀLIYAH': true,
            'KULLIYYAH': true
        }
    },
    topicRegistrationEnabled: {
        type: Boolean,
        default: true
    },
    categoryTopicRegistrationStatus: {
        type: Map,
        of: Boolean,
        default: {}
    },
    categoryItemLimits: {
        type: Map,
        of: new mongoose.Schema({
            total: { type: Number, default: 9 },
            stage: { type: Number, default: 4 },
            nonStage: { type: Number, default: 5 }
        }, { _id: false }),
        default: {
            'BIDĀYAH': { total: 9, stage: 4, nonStage: 5 },
            'E_ŪLĀ': { total: 9, stage: 4, nonStage: 5 },
            'THĀNIYAH': { total: 9, stage: 4, nonStage: 5 },
            'THĀNAWIYYAH': { total: 11, stage: 5, nonStage: 6 },
            'EĀLIYAH': { total: 9, stage: 4, nonStage: 5 }
        }
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
    },
    venues: [{
        type: String
    }]
}, { timestamps: true })

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;