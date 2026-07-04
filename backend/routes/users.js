const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ==========================================
// ENDPOINT 1: FETCH ALUMNI DIRECTORY (WITH LIVE FILTERS)
// ==========================================
router.get('/alumni', async (req, res) => {
  try {
    const { branch, company } = req.query;
    let queryPayload = { role: 'Alumni' };

    // If frontend sends branch filter (e.g., ?branch=cs)
    if (branch) {
      queryPayload.branch = branch.toLowerCase();
    }

    // If frontend sends company filter (e.g., ?company=Google)
    if (company) {
      // Uses a case-insensitive regular expression match for flexible search queries
      queryPayload.currentCompany = { $regex: company, $options: 'i' };
    }

    // Fetch matching profiles, sorting by highest contribution points (Gamification leaderboard)
    const alumniDirectory = await User.find(queryPayload)
      .select('-password') // Strictly exclude hashed password strings for safety
      .sort({ contributionPoints: -1 });

    res.json(alumniDirectory);
  } catch (error) {
    res.status(500).json({ message: 'Error compiling alumni index stream', error: error.message });
  }
});

// ==========================================
// ENDPOINT 2: COMPLETE PROFILE ONBOARDING
// ==========================================
router.put('/onboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, currentCompany, jobRole, skills } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        currentCompany,
        jobRole,
        skills,
        isProfileCompleted: true
      },
      { new: true } // Return the freshly updated document configuration
    ).select('-password');

    res.json({
      success: true,
      message: 'Onboarding profile saved successfully!',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to commit onboarding details', error: error.message });
  }
});

module.exports = router;