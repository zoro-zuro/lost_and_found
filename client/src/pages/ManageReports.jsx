import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Toast from '../components/Toast';
import ManageReportsSkeleton from '../components/ManageReportsSkeleton';


const ManageReports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('lost');
  const [filters, setFilters] = useState({
    location: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [reports, setReports] = useState({
    lost: [],
    found: []
  });
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    activeClaims: 0
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [lostRes, foundRes] = await Promise.all([
        API.get('/api/lost/mine'),
        API.get('/api/found/mine')
      ]);
      
      setReports({
        lost: lostRes.data.data || [],
        found: foundRes.data.data || []
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      setToast({ message: 'Failed to fetch reports', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get('/api/users/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogout = async () => {
    try {
      await API.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleNewReport = () => {
    navigate('/report-lost');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = activeTab === 'lost' ? reports.lost : reports.found;
  const searchFilteredReports = filteredReports.filter(report => 
    report.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = searchFilteredReports.slice(indexOfFirstItem, indexOfLastItem);

  const handleViewReport = (report) => {
    localStorage.setItem('fromManageReports', 'true');
    if (activeTab === 'lost') {
      navigate(`/lost/${report._id}`);
    } else {
      navigate(`/found/${report._id}`);
    }
  };

  const handleCloseReport = async (report) => {
    try {
      const endpoint = activeTab === 'lost' ? '/api/lost' : '/api/found';
      await API.patch(`${endpoint}/${report._id}/close`);
      fetchReports();
      setToast({ message: 'Report closed successfully', type: 'success' });
    } catch (error) {
      console.error('Error closing report:', error);
      setToast({ message: 'Failed to close report', type: 'error' });
    }
  };

  if (loading) {
    return <ManageReportsSkeleton />;
  }

  return (
    <>
      <div className="w-full max-w-[1140px] mx-auto glass-panel rounded-t-[40px] flex flex-col overflow-hidden relative mt-5">
        {/* Header Section */}
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-1 md:mb-2">
              My Reports Hub
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto">
              Manage and track your personal lost and found submissions in one place.
            </p>
          </div>

          {/* MOBILE: Search + New Button in One Row */}
          <div className="md:hidden flex items-center gap-2 mb-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <span className="material-symbols-rounded absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full h-[36px] pl-8 pr-3 bg-white/60 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg text-xs transition-all placeholder:text-slate-400 outline-none"
                placeholder="Search..."
              />
            </div>
            
            {/* New Button */}
            <button
              onClick={handleNewReport}
              className="h-[36px] px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold text-xs shadow-lg shadow-indigo-200/20 transition-all flex items-center gap-1 whitespace-nowrap"
            >
              <span className="material-symbols-rounded text-sm">add</span>
              New
            </button>
          </div>

          {/* DESKTOP: Original Search and Filter Bar */}
          <div className="hidden md:flex flex-col md:flex-row items-center gap-4 md:gap-6 h-auto md:h-[48px]">
            <div className="relative w-full md:flex-[5] h-[48px]">
              <span className="material-symbols-rounded absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg md:text-base">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full h-full pl-10 md:pl-12 pr-4 bg-white/60 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl md:rounded-2xl text-sm md:text-base transition-all placeholder:text-slate-400"
                placeholder="Search your reports..."
              />
            </div>
            
            <div className="w-full md:flex-[3] h-[48px] bg-white/60 p-1 rounded-xl md:rounded-2xl ring-1 ring-slate-200 flex items-center">
              <button
                onClick={() => setActiveTab('lost')}
                className={`flex-1 h-full rounded-lg md:rounded-xl text-sm md:text-sm font-bold flex items-center justify-center transition-all ${
                  activeTab === 'lost' 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                }`}
              >
                Lost
              </button>
              <button
                onClick={() => setActiveTab('found')}
                className={`flex-1 h-full rounded-lg md:rounded-xl text-sm md:text-sm font-semibold flex items-center justify-center transition-all ${
                  activeTab === 'found' 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                }`}
              >
                Found
              </button>
            </div>
            
            <button
              onClick={handleNewReport}
              className="w-full md:flex-[2] h-[48px] bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-sm shadow-lg shadow-indigo-200/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap px-4 md:px-6"
            >
              <span className="material-symbols-rounded text-lg md:text-xl">add_circle</span>
              New Lost Report
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mt-4 grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-6">
            <div className="bg-white/60 backdrop-blur-sm border-2 border-slate-200 rounded-lg md:rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-3 text-center">
              <div className="bg-indigo-100 border border-indigo-200 p-1.5 md:p-3 rounded-md md:rounded-xl flex items-center justify-center">
                <span className="material-symbols-rounded text-indigo-600 text-sm md:text-xl scale-75 md:scale-100">assignment</span>
              </div>
              <div>
                <p className="text-slate-500 text-[8px] md:text-xs font-bold uppercase tracking-wider">Total</p>
                <p className="text-slate-900 text-base md:text-2xl font-bold">{stats.totalReports}</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border-2 border-slate-200 rounded-lg md:rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-3 text-center">
              <div className="bg-green-100 border border-green-200 p-1.5 md:p-3 rounded-md md:rounded-xl flex items-center justify-center">
                <span className="material-symbols-rounded text-green-600 text-sm md:text-xl scale-75 md:scale-100">check_circle</span>
              </div>
              <div>
                <p className="text-slate-500 text-[8px] md:text-xs font-bold uppercase tracking-wider">Resolved</p>
                <p className="text-slate-900 text-base md:text-2xl font-bold">{stats.resolvedReports}</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border-2 border-slate-200 rounded-lg md:rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-3 text-center">
              <div className="bg-orange-100 border border-orange-200 p-1.5 md:p-3 rounded-md md:rounded-xl flex items-center justify-center">
                <span className="material-symbols-rounded text-orange-600 text-sm md:text-xl scale-75 md:scale-100">pending</span>
              </div>
              <div>
                <p className="text-slate-500 text-[8px] md:text-xs font-bold uppercase tracking-wider">Pending</p>
                <p className="text-slate-900 text-base md:text-2xl font-bold">{stats.pendingReports}</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border-2 border-slate-200 rounded-lg md:rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-3 text-center">
              <div className="bg-purple-100 border border-purple-200 p-1.5 md:p-3 rounded-md md:rounded-xl flex items-center justify-center">
                <span className="material-symbols-rounded text-purple-600 text-sm md:text-xl scale-75 md:scale-100">handshake</span>
              </div>
              <div>
                <p className="text-slate-500 text-[8px] md:text-xs font-bold uppercase tracking-wider">Claims</p>
                <p className="text-slate-900 text-base md:text-2xl font-bold">{stats.activeClaims}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 md:px-8 pb-10 md:pb-8 overflow-hidden">
          <div className="bg-white/40 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 overflow-hidden">
            
            {/* MOBILE: Compact Tab Above Table */}
            <div className="md:hidden bg-white/50 p-1.5 flex items-center gap-1">
              <button
                onClick={() => setActiveTab('lost')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'lost' 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Lost
              </button>
              <button
                onClick={() => setActiveTab('found')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'found' 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Found
              </button>
            </div>

            {currentReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-16">
                <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-rounded text-2xl md:text-3xl text-slate-400">inbox</span>
                </div>
                <h3 className="text-slate-900 text-lg md:text-xl font-semibold mb-2">
                  No {activeTab} reports found
                </h3>
                <p className="text-slate-500 text-sm md:text-base mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first report'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleNewReport}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base transition-all"
                  >
                    Create New Report
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* MOBILE: Compact Table - No Horizontal Scroll */}
                <div className="md:hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/50 border-b border-white/30">
                        <th className="px-1.5 py-1.5 text-left text-[10px] font-semibold text-slate-700">Item</th>
                        <th className="px-1 py-1.5 text-left text-[10px] font-semibold text-slate-700">Date</th>
                        <th className="px-1 py-1.5 text-center text-[10px] font-semibold text-slate-700">Status</th>
                        <th className="px-1 py-1.5 text-center text-[10px] font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentReports.map((report) => (
                        <tr key={report._id} className="border-b border-white/20 hover:bg-white/30 transition-colors">
                          <td className="px-1.5 py-1.5">
                            <div className="text-[10px] text-slate-900 font-medium truncate max-w-[80px]">{report.itemName || 'N/A'}</div>
                            <div className="text-[8px] text-slate-500 truncate">{report.category || 'N/A'}</div>
                          </td>
                          <td className="px-1 py-1.5 text-[9px] text-slate-600">{report.dateFound ? new Date(report.dateFound).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</td>
                          <td className="px-1 py-1.5 text-center">
                            <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[8px] font-medium ${getStatusColor(report.status)}`}>
                              {report.status === 'OPEN' ? 'Open' : report.status === 'CLOSED' ? 'Closed' : report.status}
                            </span>
                          </td>
                          <td className="px-1 py-1.5">
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => handleViewReport(report)}
                                className="w-6 h-6 flex items-center justify-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                              >
                                <span className="material-symbols-rounded text-base scale-75">visibility</span>
                              </button>
                              <button 
                                onClick={() => handleCloseReport(report)}
                                disabled={report.status === 'CLOSED'}
                                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                                  report.status === 'CLOSED'
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                    : 'text-red-600 bg-red-50 hover:bg-red-100'
                                }`}
                              >
                                <span className="material-symbols-rounded text-base scale-75">close</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* DESKTOP: Full Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/50 border-b border-white/30">
                        <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700">Item</th>
                        <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700">Category</th>
                        <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700">Location</th>
                        <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700">Date</th>
                        <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700">Status</th>
                        <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentReports.map((report) => (
                        <tr key={report._id} className="border-b border-white/20 hover:bg-white/30 transition-colors cursor-pointer">
                          <td className="px-4 py-3 text-xs md:text-sm text-slate-900 font-medium">{report.itemName || 'N/A'}</td>
                          <td className="px-4 py-3 text-xs md:text-sm text-slate-600">{report.category || 'N/A'}</td>
                          <td className="px-4 py-3 text-xs md:text-sm text-slate-600">{report.location || 'N/A'}</td>
                          <td className="px-4 py-3 text-xs md:text-sm text-slate-600">{report.dateFound ? formatDate(report.dateFound) : 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              {report.status || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleViewReport(report)}
                                className="px-3 py-1.5 text-xs text-indigo-600 bg-transparent md:bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors flex items-center gap-1.5"
                              >
                                <span className="material-symbols-rounded text-sm">visibility</span>
                                View
                              </button>
                              <button 
                                onClick={() => handleCloseReport(report)}
                                disabled={report.status === 'CLOSED'}
                                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                                  report.status === 'CLOSED'
                                    ? 'text-gray-500 bg-transparent  md:bg-gray-300/50 cursor-not-allowed'
                                    : 'text-red-600 bg-transparent md:bg-red-50 hover:bg-red-100'
                                }`}
                              >
                                <span className="material-symbols-rounded text-sm">close</span>
                                Close
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {searchFilteredReports.length > 0 && (
            <div className="mt-2 md:mt-4 flex flex-col md:flex-row items-center justify-between px-4 py-3 bg-white/30 border-t border-white/20 gap-2 mb-10 md:mb-0">
              <div className="hidden md:inline text-xs md:text-sm text-slate-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, searchFilteredReports.length)} of {searchFilteredReports.length} reports
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium text-slate-600 bg-white/60 border border-slate-200 rounded-lg md:rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(searchFilteredReports.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-6 h-6 md:w-8 md:h-8 text-xs md:text-sm font-medium rounded-lg md:rounded-xl transition-all ${
                        currentPage === page
                          ? 'bg-indigo-500 text-white border border-indigo-600'
                          : 'bg-white/60 text-slate-600 border border-slate-200 hover:bg-white/80'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(searchFilteredReports.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(searchFilteredReports.length / itemsPerPage)}
                  className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium text-slate-600 bg-white/60 border border-slate-200 rounded-lg md:rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
};

export default ManageReports;