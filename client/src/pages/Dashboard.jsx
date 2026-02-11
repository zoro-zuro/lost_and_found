import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import DashboardSkeleton from '../components/DashboardSkeleton';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [recentLostItems, setRecentLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchRecentLostItems();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await API.get('/api/auth/me');
      setUser(res.data.data.user);
    } catch (err) {
      // Don't reset user state on rate limiting (429) errors
      if (err.response?.status === 401) {
        setError('Failed to fetch user data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (err.response?.status !== 429) {
        setError('Failed to fetch user data');
      }
    }
    // Don't set loading to false here - let fetchRecentLostItems handle it
  };

  const fetchRecentLostItems = async () => {
    try {
      const res = await API.get('/api/lost/mine?limit=5');
      setRecentLostItems(res.data.data);
    } catch (err) {
      // Don't show error for rate limiting (429) errors
      if (err.response?.status !== 429) {
        console.error('Error fetching recent lost items:', err);
      }
    } finally {
      // Set loading to false when both operations are complete
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-orange-50 text-orange-600 border border-orange-100';
      case 'MATCHED': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'CLOSED': return 'bg-green-50 text-green-600 border border-green-100';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading && !user) {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      setLoading(false);
    } else {
      return <DashboardSkeleton />;
    }
  }

  if (error) return (
    <div className="mesh-bg-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[1140px] mx-auto">
        <div className="max-w-md mx-auto glass-panel rounded-[40px] p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-[20px] mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Authentication Refused</h3>
          <p className="text-slate-600 mb-8">{error}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="w-full bg-royal-blue hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Main Container - Connected to end of page */}
      <div className="w-full max-w-[1140px] mx-auto glass-panel rounded-t-4xl flex flex-col overflow-hidden relative mt-5 pb-10 md:pb-0 border-white/20 shadow-sm">
        {/* Welcome Section */}
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight mb-2 md:mb-3 text-slate-900">Hello, {user?.name}! 👋</h2>
              <p className="text-slate-500 font-medium text-sm md:text-lg italic">Helping our community find what's missing, one item at a time.</p>
            </div>

          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 md:px-8 pb-6 md:pb-8">
          <div className="space-y-6 md:space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Link to="/report-lost" className="group h-full">
                <div className="relative overflow-hidden bg-slate-50/80 p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center min-h-[200px] md:min-h-[240px]">
                  <div className="relative z-10 flex flex-col items-center text-center w-full">
                    <div className="w-12 h-12 md:w-16 md:h-16 mb-4 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <span className="material-symbols-rounded text-xl md:text-2xl text-orange-500">search_check</span>
                    </div>
                    <h3 className="text-base md:text-lg font-semibold mb-2 text-slate-800">Report Lost Item</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Let us help you track it down. Fill in the details of your missing item.</p>
                    <div className="mt-4 flex items-center gap-2 text-indigo-500 font-semibold text-sm group-hover:gap-3 transition-all">
                      Start Report <span className="material-symbols-rounded text-lg">east</span>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/found" className="group h-full">
                <div className="relative overflow-hidden bg-slate-50/80 p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center min-h-[200px] md:min-h-[240px]">
                  <div className="relative z-10 flex flex-col items-center text-center w-full">
                    <div className="w-12 h-12 md:w-16 md:h-16 mb-4 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <span className="material-symbols-rounded text-xl md:text-2xl text-emerald-500">inventory_2</span>
                    </div>
                    <h3 className="text-base md:text-lg font-semibold mb-2 text-slate-800">Browse Found Items</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Looking for something? See what's been handed in at campus security.</p>
                    <div className="mt-4 flex items-center gap-2 text-indigo-500 font-semibold text-sm group-hover:gap-3 transition-all">
                      View Gallery <span className="material-symbols-rounded text-lg">east</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Active Inquiries and Community Protocol */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-6 bg-indigo-100 rounded-full"></span>
                    <h3 className="text-xs md:text-sm font-semibold tracking-tight text-slate-700 uppercase tracking-wider">Active Inquiries</h3>
                  </div>
                  <Link to="/reports" className="text-indigo-500 font-semibold text-xs md:text-sm flex items-center gap-2 hover:no-underline group">
                    Full History 
                    <span className="material-symbols-rounded text-sm md:text-lg group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                  </Link>
                </div>

                {recentLostItems.length === 0 ? (
                  <div className="bg-slate-50/60 p-4 md:p-8 rounded-2xl text-center border border-slate-200/50">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-rounded text-sm md:text-xl text-slate-400">inbox</span>
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-800 mb-2">No Active Reports</h3>
                    <p className="text-slate-600 text-xs md:text-sm">You have no current missing items in the system.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentLostItems.map((item) => (
                      <Link 
                        key={item._id} 
                        to={`/lost/${item._id}`}
                        onClick={() => localStorage.setItem('fromManageReports', 'true')}
                        className="block"
                      >
                        <div className="bg-slate-50/60 p-3 md:p-4 rounded-2xl flex items-center justify-between group hover:bg-slate-50/80 transition-colors border border-slate-200/50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                              <span className="material-symbols-rounded text-sm md:text-lg text-indigo-500">badge</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm md:text-base text-slate-800">{item.itemName}</h4>
                              <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                                <span className="bg-indigo-50 px-1.5 md:px-2 py-0.5 rounded text-indigo-600 text-[8px] md:text-[10px]">{item.category}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-[8px] md:text-[10px]">{item.locationLost}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-2 md:px-3 py-1 text-[8px] md:text-[10px] font-semibold uppercase tracking-wider rounded-full ${getStatusVariant(item.status)}`}>
                              Status: {item.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Tips Section */}
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-6 bg-orange-100 rounded-full"></span>
                  <h3 className="text-sm font-semibold tracking-tight text-slate-700 uppercase tracking-wider">Community Protocol</h3>
                </div>
                <div className="bg-slate-50/60 p-6 md:p-8 rounded-2xl border border-slate-200/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100/10 rounded-full -mr-10 -mt-10"></div>
                  <ul className="space-y-4 md:space-y-6 relative z-10">
                    {[
                      '"Detailed descriptions make matching much faster for everyone!"',
                      '"Check in daily - new items arrive every morning at the hub."',
                      '"High-value items? Please head directly to Campus Security."',
                      '"Your privacy is our priority until a verified match is made."'
                    ].map((tip, i) => (
                      <li key={i} className="flex gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                          i === 0 ? 'bg-orange-100 text-orange-700' :
                          i === 1 ? 'bg-green-100 text-emerald-700' :
                          i === 2 ? 'bg-purple-100 text-indigo-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
