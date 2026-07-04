import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user }) => {
  const location = useLocation();

  const handleLogout = () => {
    // Clear out session details and refresh the page to kick the app router back to /login
    localStorage.removeItem('userToken');
    window.location.reload();
  };

  // Helper utility to apply active lighting styles to selected links
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-slate-900/40 border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand System Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            AlumniConnect
          </Link>
          {/* Dynamic Role Status Badge */}
          <span className={`text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-0.5 rounded-full border ${
            user.role === 'Alumni' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
          }`}>
            {user.role} Portal
          </span>
        </div>

        {/* Dynamic Nav Links Stream */}
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Directory Leaderboard
          </Link>

          {user.role === 'Admin' ? (
            <Link 
              to="/admin" 
              className={`text-sm font-medium transition-colors ${
                isActive('/admin') ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Hub
            </Link>
          ) : (
            <Link 
              to="/jobs" 
              className={`text-sm font-medium transition-colors ${
                isActive('/jobs') ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {user.role === 'Alumni' ? 'Manage Referrals' : 'Opportunity Board'}
            </Link>
          )}

          {/* Render the AI Assistant option exclusively for current student users */}
          {user.role === 'Student' && (
            <Link 
              to="/ai-brain" 
              className={`text-sm font-medium transition-colors ${
                isActive('/ai-brain') ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Resume Brain
            </Link>
          )}

          {/* Gamification Points Ledger (Visible to Alumni) */}
          {user.role === 'Alumni' && (
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-yellow-500">⚡</span>
              <span className="text-slate-400">Score:</span>
              <span className="text-yellow-400 font-bold">{user.contributionPoints} 150 pts</span>
            </div>
          )}

          <div className="h-4 w-px bg-slate-800" />

          {/* Terminate Session Control */}
          <button
            onClick={handleLogout}
            className="text-xs bg-slate-950 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg font-medium active:scale-95 transition-all"
          >
            Log Out
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;