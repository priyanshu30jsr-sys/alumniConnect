const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');

// ==========================================
// ENDPOINT 1: POST A NEW JOB/REFERRAL OPENING
// ==========================================
router.post('/create', async (req, res) => {
  try {
    const userId = req.body.userId || req.body.postedBy || req.body.postedById;
    const companyName = req.body.companyName || req.body.company || '';
    const jobRole = req.body.jobRole || req.body.title || '';
    const description = req.body.description || '';
    const applicationUrl = req.body.applicationUrl || '#';

    if (!userId) {
      return res.status(400).json({ message: 'Missing user identity while posting opportunity.' });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'Alumni') {
      return res.status(403).json({ message: 'Unauthorized. Only verified alumni can post opportunities.' });
    }

    const newJob = new Job({
      postedBy: userId,
      alumnusName: user.fullName || user.email.split('@')[0],
      companyName,
      jobRole,
      description,
      applicationUrl
    });

    await newJob.save();

    // 3. Award 50 Contribution Points to the Alumnus for boosting user engagement
    user.contributionPoints += 50;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Job opening broadcasted successfully! Earned +50 points.',
      job: newJob
    });

  } catch (error) {
    res.status(500).json({ message: 'Server database posting failure', error: error.message });
  }
});

// ==========================================
// ENDPOINT 2: GET ALL ACTIVE JOB POSTINGS
// ==========================================
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'fullName email').sort({ createdAt: -1 });
    const normalized = jobs.map((job) => ({
      ...job.toObject(),
      title: job.jobRole || job.title,
      company: job.companyName || job.company,
      postedBy: job.postedBy
        ? {
            ...job.postedBy.toObject(),
            fullName: job.postedBy.fullName || job.postedBy.email?.split('@')[0] || 'Verified Alumnus'
          }
        : null
    }));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving open opportunities', error: error.message });
  }
});

module.exports = router;