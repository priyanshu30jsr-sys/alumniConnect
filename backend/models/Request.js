const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alumnusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeText: {
    type: String,
    required: true
  },
  atsScore: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewing', 'Referred', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true // Allows alumni to sort incoming requests by oldest/newest
});

module.exports = mongoose.model('Request', RequestSchema);