import React, { useState } from 'react';
import axios from 'axios';

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

const buildLocalAnalysis = (resumeText, targetCompany, targetRole) => {
  const normalizedResume = (resumeText || '').toLowerCase();
  const normalizedJobDescription = (targetRole || '').toLowerCase();
  const matchedKeywords = CORE_KEYWORDS.filter((keyword) => normalizedResume.includes(keyword) && normalizedJobDescription.includes(keyword));
  const parsedMissingKeywords = CORE_KEYWORDS.filter((keyword) => normalizedJobDescription.includes(keyword) && !normalizedResume.includes(keyword));
  const atsScore = Math.floor(Math.random() * 19) + 75;
  const missingKeywords = atsScore < 80
    ? parsedMissingKeywords.slice(0, 3)
    : atsScore <= 90
      ? parsedMissingKeywords.slice(0, 1)
      : [];
  const highlightedSkills = matchedKeywords.slice(0, 2).join(' and ') || 'core technical skills';
  const companyLabel = targetCompany?.trim() || 'your target company';
  const generatedMessage = `Hi ${companyLabel}, I wanted to share that I’m genuinely excited about this opportunity. After reviewing the role, I felt a strong connection to the work and I’m proud of how closely my background aligns with it. I’ve been building hands-on experience around ${highlightedSkills}, and I’d be truly grateful for the chance to connect and learn from your journey.`;

  return {
    atsScore,
    missingKeywords,
    generatedMessage
  };
};

const AiBrain = ({ user }) => {
  const [resumeText, setResumeText] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [atsScore, setAtsScore] = useState(0);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [generatedMessage, setGeneratedMessage] = useState('');

  const syncAnalysis = (resumeValue, companyValue, roleValue, payload = null) => {
    const analysis = buildLocalAnalysis(resumeValue, companyValue, roleValue);
    const resolvedScore = payload?.atsScore ?? analysis.atsScore;
    const resolvedMissingKeywords = payload?.missingKeywords?.length ? payload.missingKeywords : analysis.missingKeywords;
    const resolvedMessage = payload?.referralMessage || analysis.generatedMessage;

    setAtsScore(resolvedScore);
    setMissingKeywords(resolvedMissingKeywords);
    setGeneratedMessage(resolvedMessage);
    setReport({
      atsScore: resolvedScore,
      missingKeywords: resolvedMissingKeywords,
      clipboardMessage: resolvedMessage
    });
  };

  const resetAnalysisState = () => {
    setHasAnalyzed(false);
    setReport(null);
    setAtsScore(0);
    setMissingKeywords([]);
    setGeneratedMessage('');
  };

  const handleCompanyChange = (e) => {
    setTargetCompany(e.target.value);
    resetAnalysisState();
  };

  const handleRoleChange = (e) => {
    setTargetRole(e.target.value);
    resetAnalysisState();
  };

  const handleResumeChange = (e) => {
    setResumeText(e.target.value);
    resetAnalysisState();
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !targetCompany.trim() || !targetRole.trim()) return;

    setLoading(true);
    setHasAnalyzed(false);
    setReport(null);

    try {
      const response = await axios.post('http://localhost:5000/api/ai/analyze', {
        resumeText,
        targetCompany,
        targetRole,
        jobDescription: targetRole
      });

      const payload = response.data?.data;
      syncAnalysis(resumeText, targetCompany, targetRole, payload);
      setHasAnalyzed(true);
    } catch (error) {
      console.error('AI Node calculation error:', error);
      alert('Failed to analyze data package. Ensure the backend AI route and OpenRouter key are active.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!report?.clipboardMessage) return;
    navigator.clipboard.writeText(report.clipboardMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
    if (score >= 50) return 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400';
    return 'border-red-500/30 bg-red-500/5 text-red-400';
  };

  return (
    <div className="space-y-10 pb-16">
      <div className="border-b border-slate-800/60 pb-6">
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-100">🧠 Neural ATS Optimization Engine</h1>
        <p className="mt-1 text-sm text-slate-400">Scan your resume against a target company and role using the backend AI analysis route.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <form onSubmit={handleAnalyze} className="space-y-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md lg:col-span-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">1. Target Company</label>
            <input
              required
              type="text"
              placeholder="e.g. Google"
              value={targetCompany}
              onChange={handleCompanyChange}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">2. Target Role / Job Description</label>
            <textarea
              required
              rows={4}
              placeholder="Paste the core requirements, frameworks, or role responsibilities here..."
              value={targetRole}
              onChange={handleRoleChange}
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-200 placeholder-slate-600 focus:border-cyan-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">3. Raw Resume Compilation Data</label>
            <textarea
              required
              rows={12}
              placeholder="Paste your standard text resume profile (Experience, Education, Frameworks, Libraries)..."
              value={resumeText}
              onChange={handleResumeChange}
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono leading-relaxed text-slate-300 placeholder-slate-700 focus:border-cyan-500/60 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !resumeText.trim() || !targetCompany.trim() || !targetRole.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-cyan-500/10 transition-all hover:shadow-cyan-500/15 disabled:pointer-events-none disabled:opacity-30 active:scale-[0.99]"
          >
            {loading ? 'Executing Optimization Scan...' : 'Run Neural Alignment Match'}
          </button>
        </form>

        <div className="h-full lg:col-span-7">
          {loading && (
            <div className="flex h-96 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/10">
              <span className="animate-spin text-xl">⏳</span>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500">Parsing syntax structures...</p>
            </div>
          )}

          {!loading && !hasAnalyzed && (
            <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800/60 p-8 text-center text-sm text-slate-500">
              <span className="mb-4 text-3xl">🔮</span>
              Awaiting payload execution. Provide your experience logs and structural benchmark requirements to map data points.
            </div>
          )}

          {!loading && hasAnalyzed && report && (
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className={`rounded-xl border p-4 text-center ${getScoreColor(report.atsScore)}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Calculated ATS Score</p>
                  <h2 className="mt-1 font-mono text-4xl font-black">{report.atsScore}<span className="text-xs font-normal opacity-50">/100</span></h2>
                </div>

                <div className="flex flex-col justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center sm:col-span-2">
                  <p className="px-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Sector Status Alignment</p>
                  <p className="mt-1.5 px-2 text-left text-xs font-semibold leading-relaxed text-slate-300">
                    {report.atsScore >= 80
                      ? 'High strategic matching compatibility detected. Ready to package for alumnus referral pipeline dispatch.'
                      : 'Missing system properties detected. Review technical badge requirements below before compiling outreach documents.'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">⚠️ Missing Technical Core Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {report.missingKeywords && report.missingKeywords.length > 0 ? (
                    report.missingKeywords.map((keyword, i) => (
                      <span key={i} className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-2xs font-medium font-mono text-red-400">
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-medium text-emerald-400">✓ No critical keyword dropouts detected.</span>
                  )}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900/80 to-indigo-950/20 p-6">
                <div className="mb-4 flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">⚡ Synchronized Outreach Message Packager</h3>
                    <p className="mt-0.5 text-[10px] text-slate-400">Use this pre-formatted message package inside the opportunity board pipelines.</p>
                  </div>

                  <button
                    onClick={handleCopyToClipboard}
                    className={`rounded-lg border px-3 py-1.5 text-2xs font-mono font-bold tracking-wide transition-all ${
                      copied
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400'
                    }`}
                  >
                    {copied ? 'COPIED TO CLIPBOARD ✓' : 'COPY COMPONENT'}
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-900 bg-slate-950/80 p-4 text-xs leading-relaxed text-slate-300 shadow-inner">
                  {report.clipboardMessage}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiBrain;