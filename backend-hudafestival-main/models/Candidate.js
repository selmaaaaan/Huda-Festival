const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    admissionNo: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        url: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
        }
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA'],
    },
    totalPoints: {
        type: Number,
        default: 0,
    },
    minusPoints: {
        type: Number,
        default: 0,
    }
}, { timestamps: true })

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;