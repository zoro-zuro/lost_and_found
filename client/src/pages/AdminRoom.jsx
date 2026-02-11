import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from '../components/Select';
import API from '../services/api';
import Toast from '../components/Toast';
import AdminRoomSkeleton from '../components/AdminRoomSkeleton';

const AdminRoom = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('admin');
  const [locationFilter, setLocationFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef(null);

  const [stats, setStats] = useState({
    adminStats: { total: 0, open: 0, matched: 0, resolved: 0 },
    campusStats: { total: 0, open: 0, matched: 0, resolved: 0 }
  });
  const [reports, setReports] = useState([]);
  const [toast, setToast] = useState(null);

  // Derived unique users from reports list
  const reportUsers = useMemo(() => {
    const uniqueUsers = new Map();
    reports.forEach(report => {
      if (report.userId && report.userId._id) {
        uniqueUsers.set(report.userId._id, report.userId.name);
      }
    });
    
    const options = Array.from(uniqueUsers).map(([id, name]) => ({
      value: id,
      label: name
    }));

    return [{ value: '', label: 'Account' }, ...options];
  }, [reports]);

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'main-hall', label: 'Main Hall' },
    { value: 'james-hall', label: 'James Hall' },
    { value: 'jivana-jyoti', label: 'Jivana Jyoti Block' },
    { value: 'binghamton-hall', label: 'Binghamton Hall' },
    { value: 'flint-house', label: 'Flint House' },
    { value: 'new-building', label: 'New Building' },
    { value: 'library', label: 'Library' },
    { value: 'student-union', label: 'Student Union' },
    { value: 'gym', label: 'Sports Center' },
    { value: 'great-hall', label: 'Great Hall' },
    { value: 'college-canteen', label: 'College Canteen' },
    { value: 'ladies-hostel', label: 'Ladies Hostel' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser?.role !== 'ADMIN' && parsedUser?.role !== 'STAFF') {
        navigate('/unauthorized');
        return;
      }
    } else {
      navigate('/login');
    }

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, [searchTerm, locationFilter, userFilter, viewMode]);

  const fetchStats = async () => {
    try {
      const response = await API.get('/api/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (locationFilter) params.append('location', locationFilter);
      if (userFilter) params.append('user', userFilter);
      
      if (viewMode === 'admin') {
        params.append('visibility', 'ADMIN_ONLY');
      } else if (viewMode === 'public') {
        params.append('visibility', 'CAMPUS');
      }

      const response = await API.get(`/api/admin/reports?${params}`);
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setToast({ message: 'Failed to fetch reports', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const activeStats = viewMode === 'admin' ? (stats.adminStats || {}) : (stats.campusStats || {});
  
  const displayStats = {
    total: activeStats.total || 0,
    open: activeStats.open || 0,
    matched: activeStats.matched || 0,
    resolved: activeStats.resolved || 0
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleLocationSelect = (value) => {
    setLocationFilter(value);
    setShowLocationModal(false);
    setCurrentPage(1);
  };

  const handleViewReport = (reportId) => {
    navigate(`/lost/${reportId}`);
    setActiveMenuId(null);
  };

  const handleCloseReport = async (report) => {
    try {
      await API.patch(`/api/lost/${report._id}/close`);
      fetchReports();
      fetchStats();
      setToast({ message: 'Report marked as closed', type: 'success' });
      setActiveMenuId(null);
    } catch (error) {
      console.error('Error closing report:', error);
      setToast({ message: 'Unauthorized or failed to close', type: 'error' });
    }
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
      case 'MATCHED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = reports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  // Compact Select styles for Table Header
  const compactSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '28px',
      height: '28px',
      minWidth: '100%',
      fontSize: '10px',
      backgroundColor: 'rgba(99, 102, 241, 0.05)',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 4px',
      height: '28px',
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '10px',
      fontWeight: '800',
      color: '#4f46e5',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '10px',
      fontWeight: '800',
      color: '#4f46e5'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '0 4px',
      svg: { width: '12px', height: '12px' }
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    menu: (base) => ({
      ...base,
      width: '140px',
      fontSize: '11px',
      borderRadius: '12px',
      overflow: 'hidden',
      padding: '4px',
      backgroundColor: 'white',
      border: '1px solid rgba(15, 23, 42, 0.1)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
    }),
    option: (base, state) => ({
      ...base,
      padding: '6px 10px',
      fontSize: '11px',
      borderRadius: '8px',
      margin: '2px 0',
      cursor: 'pointer',
      backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
      color: state.isSelected ? 'white' : '#1e293b',
      '&:active': {
        backgroundColor: '#4338ca'
      }
    })
  };

  if (loading && reports.length === 0) {
    return <AdminRoomSkeleton />;
  }

  return (
    <>
      <div className="w-full max-w-[1140px] mx-auto glass-panel rounded-t-[40px] flex flex-col overflow-hidden relative mt-5">
        <div className="px-3 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-1 md:mb-2 text-shadow-sm">
              Admin Control Center
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto">
              Oversee campus-wide reports, manage claims, and maintain system integrity.
            </p>
          </div>

          <div className="md:hidden flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-rounded absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full h-[36px] pl-8 pr-10 bg-white/60 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-lg text-xs transition-all placeholder:text-slate-400 outline-none"
                  placeholder="Items or ID..."
                />
                <button onClick={() => setShowLocationModal(true)} className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500">
                  <span className="material-symbols-rounded text-sm">location_on</span>
                </button>
              </div>
            </div>
            
            <div className="bg-white/50 p-1 flex items-center gap-1 rounded-xl border border-white/60">
              <button
                onClick={() => setViewMode('admin')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'admin' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Admin Only
              </button>
              <button
                onClick={() => setViewMode('public')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'public' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Public View
              </button>
            </div>
          </div>

          <div className="hidden md:flex flex-col md:flex-row items-center gap-4 md:gap-6 h-auto md:h-[48px]">
            <div className="relative w-full md:flex-[5] h-[48px]">
              <span className="material-symbols-rounded absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg md:text-base">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full h-full pl-10 md:pl-12 pr-4 bg-white/60 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl md:rounded-2xl text-sm md:text-base transition-all placeholder:text-slate-400"
                placeholder="Search report ID, student ID, item..."
              />
            </div>
            
            <div className="w-full md:flex-[3] h-[48px] bg-white/60 p-1 rounded-xl md:rounded-2xl ring-1 ring-slate-200 flex items-center">
              <button
                onClick={() => setViewMode('admin')}
                className={`flex-1 h-full rounded-lg md:rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                  viewMode === 'admin' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Admin Only
              </button>
              <button
                onClick={() => setViewMode('public')}
                className={`flex-1 h-full rounded-lg md:rounded-xl text-sm font-semibold flex items-center justify-center transition-all ${
                  viewMode === 'public' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Public View
              </button>
            </div>
            
            <div className="w-full md:flex-[2] h-[48px]">
              <Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                options={locationOptions}
                placeholder="Locality"
                className="h-[48px]"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-6">
            <div className="bg-white/60 backdrop-blur-sm border-2 border-slate-100 rounded-lg md:rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-3 text-center">
              <div className="bg-indigo-50 border border-indigo-100 p-1.5 md:p-3 rounded-md md:rounded-xl">
                <span className="material-symbols-rounded text-indigo-600 text-sm md:text-xl scale-75 md:scale-100">assignment</span>
              </div>
              <p className="text-slate-500 text-[8px] md:text-xs font-bold uppercase tracking-wider">Total</p>
              <p className="text-slate-900 text-base md:text-2xl font-black">{displayStats.total}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border-2 border-slate-100 rounded-lg md:rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-3 text-center">
              <div className="bg-orange-50 border border-orange-100 p-1.5 md:p-3 rounded-md md:rounded-xl">
                <span className="material-symbols-rounded text-orange-600 text-sm md:text-xl scale-75 md:scale-100">pending_actions</span>
              </div>
              <p className="text-slate-500 text-[8px] md:text-xs font-bold uppercase tracking-wider">Open</p>
              <p className="text-slate-900 text-base md:text-2xl font-black">{displayStats.open}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border-2 border-slate-100 rounded-lg md:rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-3 text-center">
              <div className="bg-purple-50 border border-purple-100 p-1.5 md:p-3 rounded-md md:rounded-xl">
                <span className="material-symbols-rounded text-purple-600 text-sm md:text-xl scale-75 md:scale-100">handshake</span>
              </div>
              <p className="text-slate-500 text-[8px] md:text-xs font-bold uppercase tracking-wider">Matched</p>
              <p className="text-slate-900 text-base md:text-2xl font-black">{displayStats.matched}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border-2 border-slate-100 rounded-lg md:rounded-2xl p-2 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-3 text-center">
              <div className="bg-green-50 border border-green-100 p-1.5 md:p-3 rounded-md md:rounded-xl">
                <span className="material-symbols-rounded text-green-600 text-sm md:text-xl scale-75 md:scale-100">task_alt</span>
              </div>
              <p className="text-slate-500 text-[8px] md:text-xs font-bold uppercase tracking-wider">Resolved</p>
              <p className="text-slate-900 text-base md:text-2xl font-black">{displayStats.resolved}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 md:px-8 pb-10 md:pb-8 overflow-hidden">
          <div className="bg-white/40 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 overflow-hidden min-h-[400px]">
            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <span className="material-symbols-rounded text-4xl text-slate-400 mb-4">search_off</span>
                <h3 className="text-slate-900 text-lg font-bold mb-2">No reports to display</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/50 border-b border-white/30">
                      <th className="px-2 md:px-4 py-3 text-left w-[135px] md:w-[180px]">
                        <Select
                          value={userFilter}
                          onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
                          options={reportUsers}
                          styles={compactSelectStyles}
                          placeholder="Account"
                        />
                      </th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-slate-700">Item</th>
                      <th className="hidden md:table-cell px-4 py-3 text-left text-xs md:text-sm font-bold text-slate-700">Category</th>
                      <th className="hidden lg:table-cell px-4 py-3 text-left text-xs md:text-sm font-bold text-slate-700">Location</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-slate-700">Date</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-slate-700">Status</th>
                      <th className="px-2 md:px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReports.map((report) => (
                      <tr key={report._id} className="border-b border-white/20 hover:bg-white/30 transition-all">
                        <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-slate-900 font-bold whitespace-nowrap">
                          <span className="truncate max-w-[100px] block">{report.userId?.name || 'Unknown'}</span>
                        </td>
                        <td className="px-2 md:px-4 py-4">
                          <div className="text-xs md:text-sm text-slate-900 font-bold truncate max-w-[120px]">{report.itemName || 'N/A'}</div>
                          <div className="md:hidden text-[10px] text-slate-500">{report.category}</div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-4 text-xs md:text-sm text-slate-600">{report.category}</td>
                        <td className="hidden lg:table-cell px-4 py-4 text-xs md:text-sm text-slate-600">{report.locationLost}</td>
                        <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-slate-600 font-medium">{formatDate(report.dateLost)}</td>
                        <td className="px-2 md:px-4 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase shadow-sm ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-2 md:px-4 py-4 text-right relative">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              const rect = e.target.getBoundingClientRect();
                              setMenuPosition({ top: rect.bottom + 5, right: window.innerWidth - rect.right });
                              setActiveMenuId(activeMenuId === report._id ? null : report._id); 
                            }}
                            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                          >
                            <span className="material-symbols-rounded">more_vert</span>
                          </button>
                          
                          {activeMenuId === report._id && (
                            <div 
                              ref={menuRef}
                              className="fixed w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-[9999] overflow-hidden animate-fade-in"
                              style={{ 
                                top: `${menuPosition.top}px`, 
                                right: `${menuPosition.right}px` 
                              }}
                            >
                              <button 
                                onClick={() => handleViewReport(report._id)}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-indigo-50 transition-colors flex items-center gap-2"
                              >
                                <span className="material-symbols-rounded text-base text-indigo-500">visibility</span>
                                View
                              </button>
                              <button 
                                onClick={() => handleCloseReport(report)}
                                disabled={report.status === 'CLOSED'}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center gap-2"
                              >
                                <span className="material-symbols-rounded text-base">close</span>
                                Close
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {reports.length > 0 && (
            <div className="mt-4 flex flex-col md:flex-row items-center justify-between px-4 py-3 bg-white/30 border-t border-white/20 gap-3 mb-10 md:mb-0">
              <div className="hidden md:inline text-xs md:text-sm text-slate-600 font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, reports.length)} of {reports.length} records
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs md:text-sm font-bold text-slate-600 bg-white/60 border border-slate-200 rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 md:w-9 md:h-9 text-xs md:text-sm font-bold rounded-xl transition-all ${
                        currentPage === page
                          ? 'bg-indigo-500 text-white border border-indigo-600 shadow-md shadow-indigo-200'
                          : 'bg-white/60 text-slate-600 border border-slate-200 hover:bg-white/80'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs md:text-sm font-bold text-slate-600 bg-white/60 border border-slate-200 rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLocationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-t-[32px] md:rounded-[32px] w-full max-w-md max-h-[70vh] overflow-hidden border border-white/40 shadow-2xl animate-slide-up">
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 p-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Select Locality</h3>
              <button onClick={() => setShowLocationModal(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2 max-h-[calc(70vh-80px)]">
              {locationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleLocationSelect(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-2xl transition-all ${
                    locationFilter === opt.value 
                      ? 'bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-100' 
                      : 'bg-white/50 text-slate-700 hover:bg-white font-medium border border-slate-100'
                  }`}
                >
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default AdminRoom;
