const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    programme: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Programme',
        required: true,
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true,
    },
    rank: {
        type: Number,
        enum: [1,2,3,null],
        default: null,
    },
    grade: {
        type: String,
        enum: ['A', 'B', 'C', null],
        default: null
    },
    batchId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'pending'
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    pointsFromRank: { 
         type: Number,
         default: 0 
    },
    pointsFromGrade: { 
        type: Number, 
        default: 0,
    },
    totalPoints: { 
        type: Number, 
        default: 0,
    },
    remarks: {
        type: String,
        default: null,
        select: false   // NEVER included in query results by default
    }
}, {
    timestamps: true
})

resultSchema.index({ programme: 1, candidate: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;