const mongoose = require('mongoose');

const programmeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    type: {
        type: String,
        required: true,
        enum: ['Stage', 'Non-Stage', 'Starred', 'Group', 'General', 'Special'],
     },
     category: {
        type: String,
        required: true,
        enum: ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA', 'GENERAL', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'],
     },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    stageType: {
        type: String,
        required: true,
        enum: ['stage', 'non-stage'],
    },
    participantsRaw: {
        type: String,
        required: true,
    },
    isStarred: {
        type: Boolean,
        default: false,
    },
    requiresRegistration: {
        type: Boolean,
        default: false,
    },
    curbGroup: {
        type: String,
        default: null,
    },
    curbLimit: {
        type: Number,
        default: null,
    },
    date: { 
        type: Date,
         required: false,
    },
    startTime: {
        type: Date,
        required: false,
    },
    venue: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['upcoming', 'live', 'completed', 'postponed'],
        default: 'upcoming',
    },
    isResultPublished: { 
        type: Boolean,
        default: false,
    },
    format: {
        type: String,
        enum: ['Individual', 'Group'],
        default: 'Individual',
    },
    groupSize: {
        type: Number,
        default: 1,
    },
    maxParticipants: {
        type: Number,
        default: Infinity,
    },
    topicMode: { 
        type: String, 
        enum: ['none', 'free-text', 'fixed-list'], 
        default: 'none' 
    },
    topicList: [String],
    conceptNote: {
        type: String,
        default: null
    }
}, { timestamps: true })

const Programme = mongoose.model('Programme', programmeSchema);
module.exports = Programme;