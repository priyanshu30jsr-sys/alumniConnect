import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Directory = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time Interactive Filtering Hooks
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');

  useEffect(() => {
    fetchAlumniDirectory();
  }, []);

  const fetchAlumniDirectory = async () => {
    try {
      setLoading(true);
      console.log("📡 Querying backend alumni records registry...");
      
      const response = await axios.get('http://localhost:5000/api/auth/alumni-all');
      
      const rawAlumni = Array.isArray(response.data) ? response.data : response.data?.alumni || [];
      const sortedAlumni = [...rawAlumni].sort((a, b) => (b.points || b.contributionPoints || 0) - (a.points || a.contributionPoints || 0));
      
      console.log("🏆 Sorted Leaderboard Engine Payload Compiled:", sortedAlumni);
      setAlumniList(sortedAlumni);
    } catch (error) {
      console.error("❌ Directory Sync Fault:", error.message);
      setAlumniList([]);
    } finally {
      setLoading(false);
    }
  };

  // Processing Layer: Filters based on client context arrays simultaneously
  const filteredAlumniList = alumniList.filter(alumnus => {
    const nameMatches = (alumnus.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const companyMatches = (alumnus.company || alumnus.currentCompany || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailPrefixMatches = (alumnus.email || '').split('@')[0].toLowerCase().includes(searchQuery.toLowerCase());
    const queryMatches = nameMatches || companyMatches || emailPrefixMatches;

    const branchMatches = selectedBranch === 'all' || 
      (alumnus.branch || '').toLowerCase() === selectedBranch.toLowerCase();

    return queryMatches && branchMatches;
  });

  // Extract Top 3 for the Premium Highlight Podiums
  const podiumTopThree = filteredAlumniList.slice(0, 3);
  const remainderList = filteredAlumniList.slice(3);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      
      {/* HEADER NODE PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            🏆 Institutional Contribution Leaderboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking live verified support point arrays for the NIT Jamshedpur Global Network.
          </p>
        </div>

        {/* COMPACT REAL-TIME SEARCH TEXT FRAME */}
        <input 
          type="text"
          placeholder="Search by name, company, or roll node..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 w-full md:w-80 font-sans shadow-inner"
        />
      </div>

      {/* FILTER PILLS CONTROLLER SECTOR */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-wider">
        {['all', 'cs', 'me', 'ee', 'ec'].map((branch) => (
          <button
            key={branch}
            onClick={() => setSelectedBranch(branch)}
            className={`px-4 py-1.5 rounded-lg border transition-all ${
              selectedBranch === branch 
                ? 'bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border-cyan-500 text-cyan-400' 
                : 'bg-slate-950 border-slate-800/80 text-slate-500 hover:text-slate-300'
            }`}
          >
            {branch === 'all' ? 'All Branches' : `${branch.toUpperCase()} Node`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-xs font-mono text-slate-500 text-center py-20 uppercase tracking-widest">
          Synchronizing Ledger Framework Vectors...
        </div>
      ) : filteredAlumniList.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-3xl p-16 text-center text-xs text-slate-500 font-mono">
          No matching alumni metadata nodes mapping to current parameters.
        </div>
      ) : (
        <>
          {/* TOP PODIUM BLOCK DISPLAY */}
          {searchQuery === '' && selectedBranch === 'all' && podiumTopThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              
              {/* RANK #2 PODIUM DECK */}
              {podiumTopThree[1] && (
                <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-md relative flex flex-col justify-between h-48 order-2 md:order-1 hover:border-slate-700/80 transition-all">
                  <span className="absolute top-4 right-4 bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded-md">#2 RANK</span>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-200 text-base line-clamp-1">
                      {podiumTopThree[1].fullName && !podiumTopThree[1].fullName.includes('@') ? podiumTopThree[1].fullName : `Alumnus (${podiumTopThree[1].email?.split('@')[0]})`}
                    </h3>
                    <p className="text-2xs font-mono text-cyan-400 uppercase tracking-wider">{(podiumTopThree[1].company || podiumTopThree[1].currentCompany || 'Enterprise Verified Pending')}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800/40 flex justify-between items-center text-2xs font-mono text-slate-500">
                    <span>{(podiumTopThree[1].branch || 'cs').toUpperCase()} · {(podiumTopThree[1].passingYear || 'N/A')}</span>
                    <span className="text-yellow-400 font-bold font-sans text-xs">⚡ {podiumTopThree[1].points || 0} PTS</span>
                  </div>
                </div>
              )}

              {/* RANK #1 GOLD HIGHLIGHT PODIUM DECK */}
              {podiumTopThree[0] && (
                <div className="bg-gradient-to-b from-indigo-950/20 via-slate-900/40 to-slate-900/40 border-2 border-indigo-500/40 rounded-2xl p-6 backdrop-blur-md relative flex flex-col justify-between h-56 order-1 md:order-2 shadow-xl shadow-indigo-500/5 hover:border-indigo-400/50 transition-all">
                  <span className="absolute top-4 right-4 bg-indigo-500/20 border border-indigo-500/40 font-mono text-[10px] text-indigo-300 font-black px-2.5 py-0.5 rounded-md tracking-wider">👑 CHAMPION</span>
                  <div className="space-y-1.5">
                    <h3 className="font-black text-slate-100 text-lg line-clamp-1">
                      {podiumTopThree[0].fullName && !podiumTopThree[0].fullName.includes('@') ? podiumTopThree[0].fullName : `Alumnus (${podiumTopThree[0].email?.split('@')[0]})`}
                    </h3>
                    <p className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">{(podiumTopThree[0].company || podiumTopThree[0].currentCompany || 'Enterprise Verified Pending')}</p>
                    <p className="text-2xs text-slate-400 line-clamp-1">{(podiumTopThree[0].designation || podiumTopThree[0].jobRole || 'Technical Infrastructure Consultant')}</p>
                  </div>
                  <div className="pt-3 border-t border-indigo-500/10 flex justify-between items-center text-2xs font-mono text-slate-400">
                    <span>{(podiumTopThree[0].branch || 'cs').toUpperCase()} · {(podiumTopThree[0].passingYear || 'N/A')}</span>
                    <span className="text-yellow-400 font-extrabold font-sans text-sm tracking-wide">⚡ {podiumTopThree[0].points || 0} PTS</span>
                  </div>
                </div>
              )}

              {/* RANK #3 PODIUM DECK */}
              {podiumTopThree[2] && (
                <div className="bg-slate-900/20 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-md relative flex flex-col justify-between h-44 order-3 hover:border-slate-700/80 transition-all">
                  <span className="absolute top-4 right-4 bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded-md">#3 RANK</span>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-200 text-base line-clamp-1">
                      {podiumTopThree[2].fullName && !podiumTopThree[2].fullName.includes('@') ? podiumTopThree[2].fullName : `Alumnus (${podiumTopThree[2].email?.split('@')[0]})`}
                    </h3>
                    <p className="text-2xs font-mono text-cyan-400 uppercase tracking-wider">{(podiumTopThree[2].company || podiumTopThree[2].currentCompany || 'Enterprise Verified Pending')}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800/40 flex justify-between items-center text-2xs font-mono text-slate-500">
                    <span>{(podiumTopThree[2].branch || 'cs').toUpperCase()} · {(podiumTopThree[2].passingYear || 'N/A')}</span>
                    <span className="text-yellow-400 font-bold font-sans text-xs">⚡ {podiumTopThree[2].points || 0} PTS</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* MAIN MATRIX LEDGER LIST */}
          <div className="space-y-3 pt-4">
            {(searchQuery !== '' || selectedBranch !== 'all' ? filteredAlumniList : remainderList).map((alumnus, idx) => {
              const realRankIndex = searchQuery === '' && selectedBranch === 'all' ? idx + 4 : idx + 1;
              const hasCompleteMetadata = alumnus.company && alumnus.designation;

              return (
                <div 
                  key={alumnus._id} 
                  className={`w-full bg-slate-900/10 border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md group hover:bg-slate-900/20 transition-all ${
                    hasCompleteMetadata ? 'border-slate-800/70' : 'border-slate-900/60 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* POSITION TRACKER BADGE */}
                    <span className="w-8 font-mono text-2xs text-slate-600 font-bold text-center group-hover:text-cyan-500/70 transition-colors">
                      {String(realRankIndex).padStart(2, '0')}
                    </span>

                    {/* METADATA BLOCK WITH COMPREHENSIVE TEXT CRASH DEFENSES */}
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <h4 className="font-bold text-slate-200 text-sm group-hover:text-slate-100 transition-colors">
                          {alumnus.fullName && !alumnus.fullName.includes('@') 
                            ? alumnus.fullName 
                            : `Alumnus Node (${(alumnus.email || 'N/A').split('@')[0].toUpperCase()})`}
                        </h4>
                        <span className="text-[9px] uppercase font-mono tracking-widest bg-slate-950 px-2 py-0.5 rounded text-slate-500 border border-slate-900">
                          {(alumnus.branch || 'cs').toUpperCase()} NODE · {(alumnus.passingYear || '2019')}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 max-w-xl line-clamp-1">
                        <span className="text-slate-600 font-mono text-[9px] uppercase font-bold mr-1">Path:</span>
                        <span className={alumnus.designation || alumnus.jobRole ? "text-slate-300" : "text-slate-500 italic font-mono"}>
                          {alumnus.designation || alumnus.jobRole || 'Technical Consultant'}
                        </span>
                        <span className="text-slate-600 mx-1.5">@</span>
                        <span className={(alumnus.company || alumnus.currentCompany) ? "text-cyan-400 font-medium" : "text-slate-600 italic font-mono"}>
                          {alumnus.company || alumnus.currentCompany || 'Corporate Verification Pending'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* SCORE DISPLAY FLUID ALIGNMENT BLOCK */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pl-12 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900/40">
                    <span className="text-[10px] font-mono text-slate-500 lowercase line-clamp-1 sm:block hidden">
                      {alumnus.email}
                    </span>
                    <span className="text-yellow-400 font-bold font-sans text-sm tracking-wide bg-slate-950/80 px-3 py-1 border border-slate-900 rounded-xl min-w-[76px] text-center shadow-inner">
                      ⚡ {alumnus.points || alumnus.contributionPoints || 0} <span className="text-[9px] font-mono text-slate-500 font-normal uppercase">Pts</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Directory;