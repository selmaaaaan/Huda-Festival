const mongoose = require('mongoose');

const codeLetterSchema = new mongoose.Schema({
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
    letter: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

// One letter per candidate per programme
codeLetterSchema.index({ programme: 1, candidate: 1 }, { unique: true });
// No duplicate letters within one programme
codeLetterSchema.index({ programme: 1, letter: 1 }, { unique: true });

const CodeLetter = mongoose.model('CodeLetter', codeLetterSchema);
module.exports = CodeLetter;
