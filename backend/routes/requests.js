const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const User = require('../models/User');

// ==========================================
// ENDPOINT 1: STUDENT SUBMITS A REFERRAL REQUEST
// ==========================================
router.post('/submit', async (req, res) => {
  try {
    const { jobId, studentId, alumnusId, resumeText, atsScore } = req.body;

    const existingRequest = await Request.findOne({ jobId, studentId });
    if (existingRequest) {
      return res.status(400).json({ message: 'You have already submitted a referral request for this position.' });
    }

    const newRequest = new Request({
      jobId,
      studentId,
      alumnusId,
      resumeText,
      atsScore
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Referral request dispatched straight to the alumnus dashboard!',
      request: newRequest
    });

  } catch (error) {
    res.status(500).json({ message: 'Server database request filing error', error: error.message });
  }
});

router.post('/apply', async (req, res) => {
  try {
    const {
      jobId,
      studentId,
      alumniId,
      alumnusId,
      resumeMessage,
      resumeText,
      atsScore
    } = req.body;

    if (!jobId || !studentId || !(alumniId || alumnusId)) {
      return res.status(400).json({ message: 'Missing referral request parameters.' });
    }

    const existingRequest = await Request.findOne({ jobId, studentId });
    if (existingRequest) {
      return res.status(400).json({ message: 'You have already submitted a referral request for this position.' });
    }

    const newRequest = new Request({
      jobId,
      studentId,
      alumnusId: alumniId || alumnusId,
      resumeText: resumeMessage || resumeText || '',
      atsScore: Number(atsScore) || 0
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Referral request dispatched straight to the alumnus dashboard!',
      request: newRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Server database request filing error', error: error.message });
  }
});

// ==========================================
// ENDPOINT 2: FETCH INCOMING REQUESTS FOR A SPECIFIC ALUMNUS
// ==========================================
router.get('/alumni/:alumnusId', async (req, res) => {
  try {
    const { alumnusId } = req.params;

    const requests = await Request.find({ alumnusId })
      .populate('studentId', 'email fullName branch gradYear')
      .populate('jobId', 'jobRole companyName description')
      .sort({ createdAt: -1 });

    const normalized = requests.map((request) => ({
      ...request.toObject(),
      jobId: request.jobId
        ? {
            ...request.jobId.toObject(),
            title: request.jobId.jobRole || request.jobId.title,
            company: request.jobId.companyName || request.jobId.company
          }
        : null
    }));

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Error pulling incoming data pipelines', error: error.message });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const requests = await Request.find({ studentId }).sort({ createdAt: -1 });

    const normalized = await Promise.all(
      requests.map(async (request) => {
        let alumniIdData = null;
        let jobIdData = null;

        if (request.alumnusId) {
          const alumniUser = await User.findById(request.alumnusId).select('email fullName branch gradYear').lean();
          alumniIdData = alumniUser
            ? {
                ...alumniUser,
                fullName: alumniUser.fullName || alumniUser.email?.split('@')[0] || 'Verified Contact'
              }
            : null;
        }

        if (request.jobId) {
          try {
            const Job = require('../models/Job');
            const jobDoc = await Job.findById(request.jobId).lean();
            jobIdData = jobDoc
              ? {
                  ...jobDoc,
                  title: jobDoc.jobRole || jobDoc.title,
                  company: jobDoc.companyName || jobDoc.company,
                  postedBy: jobDoc.postedBy
                }
              : null;
          } catch (jobError) {
            jobIdData = null;
          }
        }

        return {
          ...request.toObject(),
          alumniId: alumniIdData,
          jobId: jobIdData
        };
      })
    );

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Error pulling your referral pipeline', error: error.message });
  }
});

// ==========================================
// ENDPOINT 3: UPDATE REQUEST STATUS (REFERRED / REJECTED)
// ==========================================
router.put('/update/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // Expecting 'Reviewing', 'Referred', or 'Rejected'

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Target referral request entry not found.' });
    }

    request.status = status;
    await request.save();

    // Gamification bonus: If an alumnus successfully confirms they referred the student, award them an extra 100 points!
    if (status === 'Referred') {
      await User.findByIdAndUpdate(request.alumnusId, { $inc: { contributionPoints: 100 } });
    }

    res.json({
      success: true,
      message: `Status updated successfully to: ${status}`,
      request
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to update request milestone status', error: error.message });
  }
});

module.exports = router;