import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  // Authentication View States: 'login', 'register', 'forgot', or 'onboarding'
  const [mode, setMode] = useState('login');
  
  // Base Authentication Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Student');
  
  // Alumnus Onboarding Detail Fields
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [branch, setBranch] = useState('cs');
  const [passingYear, setPassingYear] = useState('');
  const [tempUserId, setTempUserId] = useState('');

  // Status Alerts Feedback Channels
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // PRIMARY REQ TRANSMISSION ENGINE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Strict Institutional Access Limit
    if (mode === 'register' && !email.toLowerCase().endsWith('@nitjsr.ac.in')) {
      setError('Access Denied: Registration parameters are strictly exclusive to verified @nitjsr.ac.in accounts.');
      setLoading(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    let endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    let payload = mode === 'register' ? { fullName, email: normalizedEmail, password, role } : { email: normalizedEmail, password };
    
    if (mode === 'forgot') {
      endpoint = '/api/auth/forgot-password';
      payload = { email: normalizedEmail, newPassword: password };
    }

    try {
      const url = `http://localhost:5000${endpoint}`;
      const response = mode === 'forgot' ? await axios.put(url, payload) : await axios.post(url, payload);

      if (response.data.success || response.status === 200 || response.status === 201) {
        if (mode === 'login') {
          setSuccess('Signature Authenticated. Loading dashboard environment...');
          localStorage.setItem('userToken', JSON.stringify(response.data.user));
          setTimeout(() => { window.location.reload(); }, 1200);
        } else if (mode === 'register') {
          // 💻 PATIENT LOG ANALYSIS: Deep check every single potential location for the MongoDB Object ID
          console.log("📋 Registration Payload Received:", response.data);

          const extractedId = response.data?.user?._id || 
                              response.data?.user?.id ||
                              response.data?.userId || 
                              response.data?._id || 
                              response.data?.id ||
                              response.data?.savedUser?._id ||
                              response.data?.savedUser?.id ||
                              response.data?.data?._id ||
                              response.data?.data?.id;

          // If registering as Alumni, intercept and direct to onboarding phase
          if (role === 'Alumni') {
            if (!extractedId) {
              console.error("❌ Key Extraction Failure. Full object dumped:", response.data);
              setError("System synchronization delay: Stored ID token missing from server response. Try logging in directly.");
              setLoading(false);
              return;
            }

            console.log("🎯 Extracted Target ID successfully assigned:", extractedId);
            setSuccess('Base account verified! Please compile your profile metadata parameters.');
            setTempUserId(extractedId); // This string tracks directly to MongoDB User Reference updates
            setTimeout(() => { setMode('onboarding'); setSuccess(''); }, 1000);
          } else {
            setSuccess('Student account initialized successfully! Switching to sign in portal...');
            setTimeout(() => { setMode('login'); setPassword(''); setSuccess(''); }, 2000);
          }
        } else {
          setSuccess('Database variable updated cleanly.');
          setTimeout(() => { setMode('login'); setSuccess(''); }, 2000);
        }
      }
    } catch (err) {
      console.error("❌ Form Submission Failure:", err);
      setError(err.response?.data?.message || 'Connection fault. Server cluster is unresponsive.');
    } finally {
      setLoading(false);
    }
  };

  // SUBMISSION CONTROLLER: Commits structural profile data parameters to DB
  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log("📡 Shipping onboarding parameters to target ID string node:", tempUserId);

    if (!tempUserId) {
      setError("Critical Session Sync Break: Temporary User identification string went missing. Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
      // Connects directly to our directory record synchronization routes
      await axios.put(`http://localhost:5000/api/auth/onboard-alumni`, {
        userId: tempUserId,
        fullName: fullName.trim(),
        company,
        designation,
        branch,
        passingYear: parseInt(passingYear),
        points: 0 // Explicitly sets baseline gamification criteria
      });

      setSuccess('Profile configuration committed safely! Proceeding to network framework...');
      
      // Clean up fields and switch context back to clear sign in validation
      setTimeout(() => {
        setMode('login');
        setEmail('');
        setPassword('');
        setFullName('');
        setCompany('');
        setDesignation('');
        setPassingYear('');
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error("❌ Onboarding network error stack trace:", err);
      setError(err.response?.data?.message || 'Onboarding compilation rejected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] w-full grid grid-cols-1 lg:grid-cols-12 gap-0 border border-slate-800/60 bg-slate-900/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl my-4 animate-fade-in">
      
      {/* LEFT COLUMN: BRAND DECK LAYER */}
      <div className="lg:col-span-7 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 p-12 flex flex-col justify-between relative overflow-hidden border-r border-slate-800/40">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-lg shadow-cyan-500/20">AC</div>
          <span className="font-mono text-xs tracking-widest text-slate-400 uppercase font-bold">NIT Jamshedpur Network</span>
        </div>

        <div className="relative z-10 my-16 space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-cyan-500/5 border border-cyan-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-mono font-bold text-cyan-400 tracking-wider">⚡ Identity Portal Node</div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-slate-100">
            Unifying the Alumni <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Ecosystem</span>
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">Securely interface with automated resume analysis engines, browse placement matrices, and connect across the platform.</p>
        </div>

        <div className="relative z-10 border-t border-slate-800/60 pt-6 grid grid-cols-2 gap-4 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
          <div>
            <p className="text-slate-600">Secure Protocol</p>
            <p className="text-slate-300 font-bold mt-0.5">SHA-256 SECURE</p>
          </div>
          <div>
            <p className="text-slate-600">Environment Profile</p>
            <p className="text-cyan-400 font-bold mt-0.5">ONBOARDING ENABLED</p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: REACTION FORMS SYSTEM LAYER */}
      <div className="lg:col-span-5 bg-slate-950/60 p-10 flex flex-col justify-center backdrop-blur-xl relative">
        <div className="w-full max-w-sm mx-auto space-y-6">
          
          {/* INTERACTIVE STATE CONDITIONAL RENDERING */}
          {mode === 'onboarding' ? (
            // DYNAMIC INJECTED SECTION: ALUMNI METADATA DATA DECK
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-cyan-400">🎓 Alumni Corporate Verification</h2>
                <p className="text-xs text-slate-500 mt-1">Provide your professional engineering coordinates to activate leaderboard visibility rankings.</p>
              </div>

              {error && <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-medium">⚠️ {error}</div>}
              {success && <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-medium">✅ {success}</div>}

              <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Enterprise Employer</label>
                    <input type="text" required placeholder="e.g. Microsoft" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Professional Title</label>
                    <input type="text" required placeholder="e.g. Senior SDE" value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Academic Branch</label>
                    <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/60">
                      <option value="cs">Computer Science (CS)</option>
                      <option value="me">Mechanical (ME)</option>
                      <option value="ee">Electrical (EE)</option>
                      <option value="ec">Electronics (EC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Graduation Year</label>
                    <input type="number" required min="1960" max="2026" placeholder="e.g. 2018" value={passingYear} onChange={(e) => setPassingYear(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/10 mt-2">
                  {loading ? 'Committing Onboarding State...' : 'Complete Profile Setup'}
                </button>
              </form>
            </div>
          ) : (
            // STANDARD MODE FLOW: SIGN IN / ACCOUNT INITIALIZATION SWITCHER
            <>
              <div>
                <h2 className="text-xl font-black text-slate-100">{mode === 'forgot' ? '🔑 Database Reset Override' : 'Welcome to AlumniConnect'}</h2>
                <p className="text-xs text-slate-500 mt-1">Interface with secure records using verified access credentials.</p>
              </div>

              {mode !== 'forgot' && (
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/60">
                  <button onClick={() => setMode('login')} className={`flex-1 py-2 text-xs font-bold rounded-lg tracking-wide transition-all ${mode === 'login' ? 'bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-indigo-500/20 text-cyan-400' : 'text-slate-500'}`}>Sign In</button>
                  <button onClick={() => setMode('register')} className={`flex-1 py-2 text-xs font-bold rounded-lg tracking-wide transition-all ${mode === 'register' ? 'bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-indigo-500/20 text-cyan-400' : 'text-slate-500'}`}>Register</button>
                </div>
              )}

              {error && <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-medium">⚠️ {error}</div>}
              {success && <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-medium">✅ {success}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Full Legal Name</label>
                    <input type="text" required placeholder="e.g. Rahul Kumar" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60" />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Institutional Email Terminal</label>
                  <input type="email" required placeholder="name@nitjsr.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Authorization Password</label>
                  <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60" />
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Network Authorization Role Tier</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/60">
                      <option value="Student">Student Matrix</option>
                      <option value="Alumni">Alumni Profile Node</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-between items-center pt-1 text-[11px]">
                  {mode === 'forgot' ? (
                    <button type="button" onClick={() => setMode('login')} className="text-slate-400 hover:text-slate-200">← Return to Security Sign In</button>
                  ) : (
                    <>
                      <span />
                      <button type="button" onClick={() => setMode('forgot')} className="text-slate-600 hover:text-cyan-400">Forgot Password?</button>
                    </>
                  )}
                </div>

                <button type="submit" disabled={loading} className="w-full font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 shadow-lg shadow-indigo-500/10 mt-2">
                  {loading ? 'Processing Cryptographic Sequence...' : mode === 'login' ? 'Execute Gateway Access' : mode === 'register' ? 'Initialize Account Node' : 'Force Record Manipulation'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>

    </div>
  );
};

export default Login;