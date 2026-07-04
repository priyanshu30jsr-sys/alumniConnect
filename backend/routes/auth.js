const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ==========================================
// CONTROLLER 1: USER REGISTRATION (SIGNUP)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already registered with this institutional ID' });
    }

    // 2. Automated Parsing Engine (Extract Branch, Batch Year, and Role)
    // Format: 2025ugme098@nitjsr.ac.in
    const prefix = email.split('@')[0]; // "2025ugme098"
    const gradYear = parseInt(prefix.slice(0, 4)); // 2025
    const branch = prefix.slice(6, 8); // "me"
    const requestedRole = (req.body.role || '').trim();

    // Honor the user's selected role, while defaulting to the batch-based rule when no role is supplied.
    const role = requestedRole === 'Student' || requestedRole === 'Alumni'
      ? requestedRole
      : (gradYear >= 2025 ? 'Student' : 'Alumni');

    // 3. Encrypt Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Save User Document
    user = new User({
      email,
      password: hashedPassword,
      role,
      gradYear,
      branch,
      fullName: fullName || ''
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        gradYear: user.gradYear,
        branch: user.branch
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server registration fault', error: error.message });
  }
});

// ==========================================
// CONTROLLER 2: USER LOGIN
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Locate User by Email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid institutional credentials' });
    }

    // 2. Validate Hashed Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid institutional credentials' });
    }

    // 3. Return Core Payload for LocalStorage Tracking
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isProfileCompleted: user.isProfileCompleted
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server authentication fault', error: error.message });
  }
});

// ==========================================
// CONTROLLER 3: INSTANT PASSWORD RESET (SANDBOX BYPASS)
// ==========================================
router.put('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this institutional ID' });
    }

    // Encrypt the new password string
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated instantly in database! Try logging in now.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server reset fault', error: error.message });
  }
});
router.get('/alumni-all', async (req, res) => {
  try {
    const alumni = await User.find({ role: 'Alumni' })
      .select('-password')
      .sort({ contributionPoints: -1 });

    const normalized = alumni.map((user) => ({
      ...user.toObject(),
      fullName: user.fullName || user.email.split('@')[0],
      company: user.currentCompany || '',
      designation: user.jobRole || '',
      branch: (user.branch || '').toLowerCase(),
      passingYear: user.gradYear,
      points: user.contributionPoints || 0
    }));

    res.json(normalized);
  } catch (error) {
    console.error('Alumni directory fetch error:', error);
    res.status(500).json({ success: false, message: 'Database operational failure.' });
  }
});

// PUT: Onboard Alumni Metadata Parameters
router.put('/onboard-alumni', async (req, res) => {
  try {
    const { userId, company, designation, branch, passingYear, points } = req.body;

    const parsedYear = parseInt(passingYear, 10);

    const updateData = {
      currentCompany: company || '',
      jobRole: designation || '',
      branch: (branch || '').toUpperCase(),
      gradYear: Number.isNaN(parsedYear) ? 0 : parsedYear,
      contributionPoints: Number(points) || 0,
      isProfileCompleted: true
    };

    if (req.body.fullName && req.body.fullName.trim()) {
      updateData.fullName = req.body.fullName.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User record node not found.' });
    }

    const responseUser = {
      ...updatedUser.toObject(),
      company: updatedUser.currentCompany || '',
      designation: updatedUser.jobRole || '',
      passingYear: updatedUser.gradYear,
      points: updatedUser.contributionPoints || 0,
      branch: (updatedUser.branch || '').toLowerCase()
    };

    res.status(205).json({ success: true, message: 'Profile parameters committed safely.', user: responseUser });
  } catch (error) {
    console.error('Onboarding Error:', error);
    res.status(500).json({ success: false, message: 'Database operational failure.' });
  }
});

module.exports = router;