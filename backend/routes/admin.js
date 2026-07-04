const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/metrics', async (req, res) => {
  try {
    const [students, alumni, admins, allUsers] = await Promise.all([
      User.countDocuments({ role: 'Student' }),
      User.countDocuments({ role: 'Alumni' }),
      User.countDocuments({ role: 'Admin' }),
      User.find({}).select('-password').sort({ createdAt: -1 }).lean()
    ]);

    res.json({
      success: true,
      metrics: {
        students,
        alumni,
        admins,
        opportunities: 12
      },
      users: allUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch admin metrics.', error: error.message });
  }
});

router.post('/user-control', async (req, res) => {
  try {
    const { userId, action } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing user identity.' });
    }

    if (action === 'delete') {
      const deleted = await User.findByIdAndDelete(userId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Target profile not found.' });
      }

      return res.json({ success: true, message: 'Profile terminated securely.' });
    }

    res.status(400).json({ success: false, message: 'Unsupported control action.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process admin control action.', error: error.message });
  }
});

module.exports = router;
