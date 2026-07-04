const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an institutional email ID'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@nitjsr\.ac\.in$/, 'Please use a valid NIT Jamshedpur email ID']
  },
  password: {
    type: String,
    required: [true, 'Please provide a secure password']
  },
  role: {
    type: String,
    enum: ['Student', 'Alumni', 'Admin'],
    required: true
  },
  gradYear: {
    type: Number,
    required: true
  },
  branch: {
    type: String,
    required: true,
    uppercase: true
  },
  
  isProfileCompleted: {
    type: Boolean,
    default: false
  },
  
  fullName: { type: String, default: '' },
  currentCompany: { type: String, default: '' },
  jobRole: { type: String, default: '' },
  skills: [{ type: String }],
  contributionPoints: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);