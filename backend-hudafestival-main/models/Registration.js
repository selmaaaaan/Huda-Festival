const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  programme: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: null },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// A team can't register the same candidate for the same programme twice
registrationSchema.index({ team: 1, programme: 1, candidates: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
