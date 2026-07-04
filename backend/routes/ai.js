const express = require('express');
const router = express.Router();
const axios = require('axios');

const buildLocalAnalysis = (resumeText, targetCompany, targetRole) => {
  const normalizedResume = (resumeText || '').toLowerCase();
  const normalizedRole = (targetRole || '').toLowerCase();

  const keywordBank = [
    ...(normalizedRole.includes('frontend') || normalizedRole.includes('ui') || normalizedRole.includes('web')
      ? ['react', 'javascript', 'typescript', 'css', 'html', 'tailwind', 'vite']
      : []),
    ...(normalizedRole.includes('backend') || normalizedRole.includes('server') || normalizedRole.includes('api')
      ? ['node.js', 'express', 'mongodb', 'sql', 'api', 'rest']
      : []),
    ...(normalizedRole.includes('full stack') || normalizedRole.includes('full-stack')
      ? ['react', 'node.js', 'express', 'mongodb', 'javascript', 'typescript', 'api']
      : []),
    ...(normalizedRole.includes('data') || normalizedRole.includes('analyst')
      ? ['python', 'pandas', 'sql', 'machine learning', 'numpy']
      : []),
    ...(normalizedRole.includes('devops') || normalizedRole.includes('cloud')
      ? ['docker', 'kubernetes', 'aws', 'ci/cd', 'linux']
      : [])
  ];

  const uniqueKeywords = [...new Set(keywordBank.length > 0 ? keywordBank : ['javascript', 'react', 'api', 'sql'])];
  const matchedKeywords = uniqueKeywords.filter((keyword) => normalizedResume.includes(keyword.toLowerCase()));
  const missingKeywords = uniqueKeywords.filter((keyword) => !matchedKeywords.includes(keyword));
  const atsScore = Math.min(95, Math.max(40, 55 + matchedKeywords.length * 6));

  return {
    atsScore,
    missingKeywords,
    referralMessage: `Hi ${targetCompany ? `I’m excited about the opportunity at ${targetCompany}` : 'there'}, I’d love to connect about the ${targetRole || 'role'} position. I’ve been strengthening my profile around the skills that align with this role, and I’d appreciate any guidance you might share on how to stand out for the team.`
  };
};

// ==========================================
// ENDPOINT: ANALYZE RESUME & GENERATE COLD COPY
// ==========================================
router.post('/analyze', async (req, res) => {
  try {
    const { resumeText, targetCompany, targetRole } = req.body;

    if (!resumeText || !targetCompany || !targetRole) {
      return res.status(400).json({ message: 'Missing mandatory fields for evaluation.' });
    }

    // Highly optimized prompt forcing OpenRouter/Gemini to reply with raw JSON only
    const systemPrompt = `You are an elite corporate Recruiter and an ATS (Applicant Tracking System) optimizer.
Analyze the following student's resume text considering their Target Company: "${targetCompany}" and Target Role: "${targetRole}".

Provide your evaluation strictly as a valid, single JSON object without any Markdown formatting, backticks, or wrapping text. The response must follow this exact schema:
{
  "atsScore": 75, 
  "missingKeywords": ["Redis", "Docker", "System Design"], 
  "referralMessage": "A concise, professional 3-sentence cold outreach message written from the perspective of an ambitious student to an alumnus working at the target company. Keep it highly tailored and respectful."
}

Resume Text to evaluate:
${resumeText}`;

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'google/gemini-2.5-flash',
            messages: [{ role: 'user', content: systemPrompt }],
            response_format: { type: 'json_object' },
            max_tokens: 400,
            temperature: 0.2
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'AlumniConnect NITJSR'
            }
          }
        );

        const aiContentRaw = response.data?.choices?.[0]?.message?.content;
        if (aiContentRaw) {
          const cleanJsonResult = JSON.parse(aiContentRaw);
          return res.json({ success: true, data: cleanJsonResult });
        }
      } catch (openRouterError) {
        console.warn('OpenRouter unavailable, using built-in fallback analysis:', openRouterError.response?.data || openRouterError.message);
      }
    }

    const fallbackResult = buildLocalAnalysis(resumeText, targetCompany, targetRole);
    return res.json({ success: true, data: fallbackResult });

  } catch (error) {
    console.error('AI analysis error:', error.message);
    const fallbackResult = buildLocalAnalysis(req.body?.resumeText, req.body?.targetCompany, req.body?.targetRole);
    res.json({ success: true, data: fallbackResult });
  }
});

module.exports = router;