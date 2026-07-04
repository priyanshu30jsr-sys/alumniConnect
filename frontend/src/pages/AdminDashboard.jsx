import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PlacementAnalytics from './PlacementAnalytics';

const AdminDashboard = ({ user }) => {
  const [metrics, setMetrics] = useState({ students: 0, alumni: 0, admins: 0, opportunities: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview'); // Switch between 'overview' and 'analytics'

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/metrics');
        setMetrics(response.data?.metrics || { students: 0, alumni: 0, admins: 0, opportunities: 0 });
        setUsers(response.data?.users || []);
      } catch (error) {
        console.error('Admin metrics fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleTerminate = async (userId) => {
    const confirmed = window.confirm('Terminate this user profile permanently?');
    if (!confirmed) return;

    try {
      const response = await axios.post('http://localhost:5000/api/admin/user-control', {
        userId,
        action: 'delete'
      });

      if (response.data?.success) {
        setUsers((prev) => prev.filter((entry) => entry._id !== userId));
      }
    } catch (error) {
      console.error('Admin record deletion failed:', error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8 pb-20 animate-fade-in">
      
      {/* 1. TOP HEADER MATRIX CONTROLS */}
      <div className="border-b border-slate-800/60 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            🛡️ Admin Control Center
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitor account distribution, review telemetry, and manage platform users.
          </p>
        </div>

        {/* CONTROLS: TOP HORIZONTAL SWITCHER TO PREVENT SIDEBAR WRAPPER OVERLAPS */}
        <div className="flex bg-slate-900/60 border border-slate-800 p-1.5 rounded-xl self-start md:self-center">
          <button 
            onClick={() => setCurrentTab('overview')} 
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-150 ${currentTab === 'overview' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            ❖ SYSTEM OVERVIEW
          </button>
          <button 
            onClick={() => setCurrentTab('analytics')} 
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-150 ${currentTab === 'analytics' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            📈 PLACEMENT METRICS
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC CONTENT RENDERING LAYER */}
      {currentTab === 'analytics' ? (
        <PlacementAnalytics />
      ) : (
        /* CORE SYSTEM OVERVIEW TAB (Your exact logic & data loops) */
        <>
          {loading ? (
            <div className="text-center text-xs font-mono uppercase tracking-widest text-slate-500 py-16">
              Synchronizing administrative telemetry...
            </div>
          ) : (
            <>
              {/* METRIC NUMERICAL GRID CHIPS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Student Accounts</p>
                  <h2 className="mt-2 text-3xl font-black text-cyan-400">{metrics.students}</h2>
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Verified Alumni</p>
                  <h2 className="mt-2 text-3xl font-black text-emerald-400">{metrics.alumni}</h2>
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Opportunities</p>
                  <h2 className="mt-2 text-3xl font-black text-indigo-400">{metrics.opportunities}</h2>
                </div>
              </div>

              {/* CORE DATA TABLE LEDGER CONTAINER */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">Managed User Ledger</h3>
                    <p className="text-2xs text-slate-500 mt-0.5">Review account presence and remove flagged profiles instantly.</p>
                  </div>
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                    {users.length} Profiles
                  </span>
                </div>

                {/* THE MAPPED USER ITEM LOOP */}
                <div className="space-y-3">
                  {users.length === 0 ? (
                    <div className="text-center text-xs font-mono py-6 text-slate-500">No managed accounts found in this node.</div>
                  ) : (
                    users.map((entry) => (
                      <div key={entry._id} className="flex flex-col gap-3 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-100">
                              {entry.fullName || entry.email?.split('@')[0] || 'Unnamed Profile'}
                            </h4>
                            <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                              {entry.role}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{entry.email}</p>
                        </div>

                        <button
                          onClick={() => handleTerminate(entry._id)}
                          className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-400 transition-all hover:bg-red-500/20"
                        >
                          Terminate Record
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;