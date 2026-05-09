const mongoose = require('mongoose');

const debateSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic:    { type: String, required: true },
    opponent: { type: String, default: 'AI Judge' },
    score:    { type: String },
    outcome:  { type: String, enum: ['VICTORY', 'DEFEAT', 'DRAW'], default: 'DRAW' },
    status:   { type: String, enum: ['active', 'completed'], default: 'completed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Debate', debateSchema);