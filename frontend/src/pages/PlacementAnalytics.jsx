import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Mock data matching your NIT Jamshedpur branch & company profiles for presentation safety
const branchData = [
  { name: 'CS Node', Placed: 88, Remaining: 12 },
  { name: 'ECE Node', Placed: 72, Remaining: 28 },
  { name: 'EE Node', Placed: 60, Remaining: 40 },
  { name: 'ME Node', Placed: 45, Remaining: 55 },
];

const companyData = [
  { name: 'Google', value: 12 },
  { name: 'Microsoft', value: 18 },
  { name: 'Accenture', value: 35 },
  { name: 'Amazon', value: 15 },
];

const COLORS = ['#22d3ee', '#34d399', '#f43f5e', '#a855f7'];

const PlacementAnalytics = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* HEADER MATRIX */}
      <div className="border-b border-slate-800/60 pb-5">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          📈 Institutional Placement Metrics <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest">Live Metrics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Real-time analytical visualization of corporate recruitment performance and branch metrics.</p>
      </div>

      {/* GRAPH PLATES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BAR CHART: BRANCH DISTRIBUTION */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-400 mb-4">Branch-Wise Recruitment Ratio</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="Placed" stackId="a" fill="#22d3ee" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Remaining" stackId="a" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: COMPANY DISTRIBUTION */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-400 mb-4">Enterprise Distribution Hub</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={companyData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* LEGEND LAYOUT */}
            <div className="space-y-2 pr-4">
              {companyData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-slate-400 font-medium">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlacementAnalytics;