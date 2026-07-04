import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import our core feature pages
import Login from './pages/Login';
import Directory from './pages/Directory';
import AiBrain from './pages/AiBrain';
import Jobs from './pages/Jobs';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a valid session token exists in local storage
    const loggedInUser = localStorage.getItem('userToken');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setLoading(false);
  }, []);

  // Show a clean dark-themed loading flash while pulling session states
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono tracking-widest text-xs">
        INITIALIZING CORE MODULES...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        
        {/* Render Navbar globally only if a valid user session is active */}
        {user && <Navbar user={user} />}

        {/* Content Viewport Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          <Routes>
            {/* Unprotected Route: Auth Panel */}
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" />} 
            />

            {/* Protected Route: Main Dashboard (Alumni Directory) */}
            <Route 
              path="/" 
              element={user ? (user.role === 'Admin' ? <Navigate to="/admin" /> : <Directory user={user} />) : <Navigate to="/login" />} 
            />

            {/* Protected Route: Administrator Control Center */}
            <Route 
              path="/admin" 
              element={user && user.role === 'Admin' ? <AdminDashboard user={user} /> : <Navigate to="/login" />} 
            />

            {/* Protected Route: AI Resume Brain Optimization Hub */}
            <Route 
              path="/ai-brain" 
              element={user ? <AiBrain user={user} /> : <Navigate to="/login" />} 
            />

            {/* Protected Route: Placement/Referral Job Board */}
            <Route 
              path="/jobs" 
              element={user ? <Jobs user={user} /> : <Navigate to="/login" />} 
            />

            {/* Catch-all Fallback Route redirecting users to Dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;