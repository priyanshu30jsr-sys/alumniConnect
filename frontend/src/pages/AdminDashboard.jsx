import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = ({ user }) => {
  const [metrics, setMetrics] = useState({ students: 0, alumni: 0, admins: 0, opportunities: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-8 pb-16 animate-fade-in">
      <div className="border-b border-slate-800/60 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-100">🛡️ Admin Control Center</h1>
        <p className="mt-1 text-sm text-slate-400">Monitor account distribution and terminate unstable records from a single secure panel.</p>
      </div>

      {loading ? (
        <div className="text-center text-xs font-mono uppercase tracking-widest text-slate-500 py-16">Synchronizing administrative telemetry...</div>
      ) : (
        <>
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

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">Managed User Ledger</h3>
                <p className="text-2xs text-slate-500 mt-0.5">Review account presence and remove flagged profiles instantly.</p>
              </div>
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                {users.length} Profiles
              </span>
            </div>

            <div className="space-y-3">
              {users.map((entry) => (
                <div key={entry._id} className="flex flex-col gap-3 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-100">{entry.fullName || entry.email?.split('@')[0] || 'Unnamed Profile'}</h4>
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
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
