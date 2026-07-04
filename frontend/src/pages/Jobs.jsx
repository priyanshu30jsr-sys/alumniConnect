import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Jobs = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [branchTarget, setBranchTarget] = useState('cs');
  const [description, setDescription] = useState('');

  const [activeJobModal, setActiveJobModal] = useState(null);
  const [atsScoreInput, setAtsScoreInput] = useState('');
  const [outreachMessage, setOutreachMessage] = useState('');
  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    fetchCoreDashboardData();
  }, [user]);

  const fetchCoreDashboardData = async () => {
    try {
      setLoading(true);
      console.log("📡 Console Sync: Fetching data clusters...");
      
      // FALLBACK ROUTING LAYER: Try the primary endpoint, fallback if it throws a 404
      let jobsData = [];
      try {
        const primaryRes = await axios.get('http://localhost:5000/api/jobs');
        jobsData = primaryRes.data;
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn("⚠️ Primary /api/jobs route 404ed. Attempting backend secondary fallback route...");
          const fallbackRes = await axios.get('http://localhost:5000/api/jobs/all');
          jobsData = fallbackRes.data;
        } else {
          throw err;
        }
      }
      
      console.log("📋 Verified Jobs Payload successfully attached:", jobsData);
      setJobs(Array.isArray(jobsData) ? jobsData : []);

      if (user?.role === 'Alumni') {
        const reqResponse = await axios.get(`http://localhost:5000/api/requests/alumni/${currentUserId}`);
        setRequests(Array.isArray(reqResponse.data) ? reqResponse.data : []);
      } else if (currentUserId) {
        const reqResponse = await axios.get(`http://localhost:5000/api/requests/student/${currentUserId}`);
        setRequests(Array.isArray(reqResponse.data) ? reqResponse.data : []);
      }
    } catch (error) {
      console.error("❌ Critical Telemetry Sync Fault:", error.message);
      // Fallback empty assignment to guarantee loops do not break layout state
      setJobs([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!title || !company || !location || !description) return;

    try {
      console.log("🔒 Injecting secure headers into outbound broadcast packet...");
      
      // 1. Safely extract our stored user parameters from state or LocalStorage
      const storedUserData = JSON.parse(localStorage.getItem('userToken'));
      const token = storedUserData?.token || storedUserData?._id; // Adjust based on your JWT setup

      // 2. Build the authorization payload configurations
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Sends your JWT token straight to your auth middleware
        }
      };

      // 3. Post to the backend router with headers included
      await axios.post('http://localhost:5000/api/jobs/create', {
        title,
        company,
        location,
        branchTarget,
        description,
        userId: currentUserId || storedUserData?.id || storedUserData?._id,
        postedBy: currentUserId || storedUserData?.id || storedUserData?._id
      }, config);

      setTitle(''); setCompany(''); setLocation(''); setDescription('');
      alert('✨ Job Node Broadcasted successfully! +50 points queued.');
      fetchCoreDashboardData();
    } catch (error) {
      console.error("❌ Error committing job:", error);
      if (error.response?.status === 403) {
        alert("🔒 Access Rejected (403): Please sign out and sign back into your Alumni profile to sync your security tokens.");
      }
    }
  };

  const handleApplyForReferral = async (e) => {
    e.preventDefault();
    if (!atsScoreInput || !outreachMessage) return;

    try {
      await axios.post('http://localhost:5000/api/requests/apply', {
        jobId: activeJobModal._id,
        studentId: currentUserId,
        alumniId: activeJobModal.postedBy?._id || activeJobModal.postedBy,
        atsScore: parseInt(atsScoreInput),
        resumeMessage: outreachMessage,
        resumeText: outreachMessage
      });
      setAtsScoreInput(''); setOutreachMessage(''); setActiveJobModal(null);
      alert('🚀 Referral request packet dispatched!');
      fetchCoreDashboardData();
    } catch (error) {
      console.error("❌ Application request failed:", error);
    }
  };

  const handleUpdateStatus = async (requestId, nextStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/requests/update/${requestId}`, { status: nextStatus });
      fetchCoreDashboardData();
    } catch (error) {
      console.error("❌ State transition update failure:", error);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      Referred: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return styles[status] || 'bg-slate-800 text-slate-400';
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      
      {/* ALUMNUS INTERFACE WORKSPACE */}
      {user?.role === 'Alumni' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-cyan-400">⚡ Broadcast Opportunity</h2>
              <p className="text-2xs text-slate-500 mt-0.5">Inject corporate open positions directly into the system terminal.</p>
            </div>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Corporate Position Title</label>
                <input type="text" required placeholder="Associate Developer" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Enterprise Name</label>
                  <input type="text" required placeholder="Google" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Location Context</label>
                  <input type="text" required placeholder="Bangalore" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Academic Branch</label>
                <select value={branchTarget} onChange={(e) => setBranchTarget(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/60">
                  <option value="cs">Computer Science (CS)</option>
                  <option value="me">Mechanical (ME)</option>
                  <option value="ee">Electrical (EE)</option>
                  <option value="ec">Electronics (EC)</option>
                  <option value="ce">Civil (CE)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Role Requirements Description</label>
                <textarea required rows={5} placeholder="Paste requirements details here..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/60 resize-none leading-relaxed" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-2xs uppercase tracking-widest transition-all">Broadcast Position</button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">📥 Active Applicant Ledger</h2>
              <p className="text-2xs text-slate-500 mt-0.5">Evaluate institutional applicant profiles and track credentials.</p>
            </div>
            {loading ? (
              <div className="text-xs font-mono text-slate-500 text-center py-12 uppercase">Syncing request matrices...</div>
            ) : requests.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500 font-mono">No pipeline requests mapping to your profile code.</div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req?._id} className="bg-slate-900/20 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">Target: {req?.jobId?.title || 'System Core Position'}</h4>
                        <p className="text-2xs text-indigo-400 font-mono mt-0.5">Applicant: {req?.studentId?.email || 'Unknown Node'} | Score: <span className="text-yellow-400 font-bold font-sans text-xs">⚡ {req?.atsScore}/100</span></p>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-md border ${getStatusBadgeStyle(req?.status)}`}>{req?.status}</span>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-900 p-3 rounded-lg text-xs font-sans text-slate-400 whitespace-pre-wrap leading-relaxed shadow-inner">{req?.resumeMessage}</div>
                    {req?.status === 'Pending' && (
                      <div className="flex gap-2 pt-1 justify-end">
                        <button onClick={() => handleUpdateStatus(req?._id, 'Rejected')} className="bg-slate-950 hover:bg-red-500/10 border border-slate-800 text-red-400 text-2xs px-3 py-1.5 rounded-lg transition-all">Reject</button>
                        <button onClick={() => handleUpdateStatus(req?._id, 'Referred')} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-2xs px-4 py-1.5 rounded-lg transition-all">Approve Referral</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENT INTERFACE WORKSPACE */}
      {user?.role === 'Student' && (
        <div className="space-y-10">
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-100">💼 Elite Placement Opportunity Board</h1>
              <p className="text-xs text-slate-400 mt-1">Acquire direct access routes to global enterprises backed by verified networks.</p>
            </div>
            {loading ? (
              <div className="text-xs font-mono text-slate-500 text-center py-12 uppercase">Querying active frameworks...</div>
            ) : jobs.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500 font-mono">No active corporate opportunities initialized on the network.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div key={job?._id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition-all group">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        {/* CRITICAL PATCH LOGIC TRIGGERED HERE FOR THE UPPERCASE FALLBACK ERR */}
                        <span className="bg-slate-950 px-2 py-0.5 border border-slate-800 rounded font-mono text-2xs text-cyan-400 uppercase">
                          {(job?.branchTarget || 'cs').toUpperCase()} TARGET
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Loc: {job?.location || 'N/A'}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors text-base">{job?.title || 'Untitled Node'}</h4>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">{job?.company || 'Unknown Enterprise'}</p>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed pt-1">{job?.description || 'No context profile layout available.'}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col gap-3">
                      <div className="text-2xs text-slate-500 font-mono">Posted By: <span className="text-indigo-400 font-medium">{job?.postedBy?.fullName || 'Verified Alumnus'}</span></div>
                      <button onClick={() => setActiveJobModal(job)} className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold py-2 px-4 rounded-xl text-2xs uppercase tracking-wide transition-all">Request Referral</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 pt-6 border-t border-slate-800/60">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">📡 Active Tracking Matrix</h2>
              <p className="text-2xs text-slate-500 mt-0.5">Real-time status tracking for your submitted referral data states.</p>
            </div>
            {requests.length > 0 && (
              <div className="w-full bg-slate-900/20 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-md">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800/80 text-slate-500 text-[10px] uppercase tracking-wider">
                      <th className="p-4">Target Position</th>
                      <th className="p-4">Enterprise Node</th>
                      <th className="p-4">Assigned Alumnus</th>
                      <th className="p-4">My ATS Score</th>
                      <th className="p-4 text-right">Pipeline Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {requests.map((r) => (
                      <tr key={r?._id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 font-bold text-slate-200">{r?.jobId?.title || 'System Package Position'}</td>
                        <td className="p-4 font-mono text-slate-400">{r?.jobId?.company || 'N/A'}</td>
                        <td className="p-4 text-indigo-400">{r?.alumniId?.fullName || r?.jobId?.postedBy?.fullName || 'Verified Contact'}</td>
                        <td className="p-4 font-mono text-yellow-400 font-bold">⚡ {r?.atsScore || 0}/100</td>
                        <td className="p-4 text-right"><span className={`text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(r?.status)}`}>{r?.status || 'Pending'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONFIG WINDOW */}
      {activeJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-slate-100">Initialize Referral Request</h3>
                <p className="text-2xs font-mono text-indigo-400 mt-0.5">Target Node: {activeJobModal?.title} @ {activeJobModal?.company}</p>
              </div>
              <button onClick={() => setActiveJobModal(null)} className="text-slate-500 hover:text-slate-300 font-mono text-sm">✕</button>
            </div>
            <form onSubmit={handleApplyForReferral} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Verified ATS Alignment Score (From Page 3 AI Scan)</label>
                <input type="number" required min="1" max="100" placeholder="e.g. 85" value={atsScoreInput} onChange={(e) => setAtsScoreInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Outreach Communications Payload (Paste Compiled AI Message)</label>
                <textarea required rows={6} placeholder="Paste the payload from Page 3 here..." value={outreachMessage} onChange={(e) => setOutreachMessage(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/60 resize-none leading-relaxed" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setActiveJobModal(null)} className="bg-slate-950 border border-slate-800 text-slate-400 text-2xs px-4 py-2 rounded-xl">Abort</button>
                <button type="submit" className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold text-2xs px-5 py-2 rounded-xl uppercase tracking-wider">Dispatch Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Jobs;