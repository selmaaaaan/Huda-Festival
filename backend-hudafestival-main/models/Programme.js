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
        enum: ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA', 'GENERAL'],
     },
    date: { 
        type: Date,
         required: true,
    },
    isResultPublished: { 
        type: Boolean,
        default: false,
    },
}, { timestamps: true })

const Programme = mongoose.model('Programme', programmeSchema);
module.exports = Programme;