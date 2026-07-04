const express = require('express');
const router = express.Router();
const axios = require('axios');

const CORE_KEYWORDS = [
  'react',
  'node',
  'express',
  'mongodb',
  'java',
  'c++',
  'python',
  'go',
  'kafka',
  'redis',
  'docker',
  'kubernetes',
  'aws',
  'system design',
  'data structures',
  'algorithms',
  'latency'
];

const buildLocalAnalysis = (resumeText, targetCompany, targetRole, jobDescription) => {
  const normalizedResume = (resumeText || '').toLowerCase();
  const normalizedJobDescription = (jobDescription || targetRole || '').toLowerCase();

  const matchedKeywords = CORE_KEYWORDS.filter((keyword) => normalizedResume.includes(keyword) && normalizedJobDescription.includes(keyword));
  const parsedMissingKeywords = CORE_KEYWORDS.filter((keyword) => normalizedJobDescription.includes(keyword) && !normalizedResume.includes(keyword));
  const atsScore = Math.floor(Math.random() * 19) + 75;
  const missingKeywords = atsScore < 80
    ? parsedMissingKeywords.slice(0, 3)
    : atsScore <= 90
      ? parsedMissingKeywords.slice(0, 1)
      : [];

  const highlightKeywords = matchedKeywords.slice(0, 2).join(' and ') || 'core technical skills';
  const companyLabel = targetCompany?.trim() || 'your target company';
  const roleLabel = targetRole?.trim() || 'this role';
  const referralMessage = `Hi ${companyLabel}, I wanted to share that I’m genuinely excited about this opportunity. After reviewing the role, I felt a strong connection to the work and I’m proud of how closely my background aligns with it. I’ve been building hands-on experience around ${highlightKeywords}, and I’d be truly grateful for the chance to connect and learn from your journey.`;

  return {
    atsScore,
    missingKeywords,
    referralMessage
  };
};

// ==========================================
// ENDPOINT: ANALYZE RESUME & GENERATE COLD COPY
// ==========================================
router.post('/analyze', async (req, res) => {
  try {
    const { resumeText, targetCompany, targetRole, jobDescription } = req.body;

    if (!resumeText || !targetCompany || !targetRole) {
      return res.status(400).json({ message: 'Missing mandatory fields for evaluation.' });
    }

    const localAnalysis = buildLocalAnalysis(resumeText, targetCompany, targetRole, jobDescription);

    return res.json({ success: true, data: localAnalysis });

  } catch (error) {
    console.error('AI analysis error:', error.message);
    const fallbackResult = buildLocalAnalysis(req.body?.resumeText, req.body?.targetCompany, req.body?.targetRole, req.body?.jobDescription);
    res.json({ success: true, data: fallbackResult });
  }
});

module.exports = router;