const mongoose = require('mongoose');

const topicRegistrationSchema = new mongoose.Schema({
  programme: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  topic: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote: String
}, { timestamps: true });

const TopicRegistration = mongoose.model('TopicRegistration', topicRegistrationSchema);
module.exports = TopicRegistration;
