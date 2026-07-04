const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alumnusName: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  jobRole: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  applicationUrl: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true // Tracks exactly when the job opening was dropped
});

module.exports = mongoose.model('Job', JobSchema);