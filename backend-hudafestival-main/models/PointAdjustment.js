const mongoose = require('mongoose');

const pointAdjustmentSchema = new mongoose.Schema({
    appliesTo: {
        type: String,
        enum: ['team', 'candidate'],
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
    },
    type: {
        type: String,
        enum: ['add', 'deduct'],
        required: true
    },
    points: {
        type: Number,
        required: true,
        min: 1
    },
    reason: {
        type: String,
        required: true
    },
    remarks: {
        type: String,
        default: ''
    },
    adjustedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, { timestamps: true });

// Validation to ensure the correct reference is provided
pointAdjustmentSchema.pre('validate', function(next) {
    if (this.appliesTo === 'team' && !this.team) {
        this.invalidate('team', 'Team reference is required when appliesTo is team');
    }
    if (this.appliesTo === 'candidate' && !this.candidate) {
        this.invalidate('candidate', 'Candidate reference is required when appliesTo is candidate');
    }
    next();
});

module.exports = mongoose.model('PointAdjustment', pointAdjustmentSchema);
