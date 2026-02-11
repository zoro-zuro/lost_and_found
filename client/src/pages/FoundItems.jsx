import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Select from '../components/Select';
import API, { getImageUrl } from '../services/api';
import FoundItemsSkeleton from '../components/FoundItemsSkeleton';

const FoundItems = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('found');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 768 ? 16 : 7);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 16 : 7);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [pagination, setPagination] = useState({
    page: 1, limit: 12, total: 0, pages: 0
  });
  const [filters, setFilters] = useState({
    search: '', category: '', location: ''
  });

  const categories = [
    { value: '', label: 'All', emoji: '🔍' },
    { value: 'Electronics', label: 'Electronics', emoji: '📱' },
    { value: 'Keys & IDs', label: 'Keys & IDs', emoji: '🔑' },
    { value: 'Bags & Gear', label: 'Bags & Gear', emoji: '🎒' },
    { value: 'Eyewear', label: 'Eyewear', emoji: '🕶️' },
    { value: 'Books & Notes', label: 'Books & Notes', emoji: '📓' },
    { value: 'Hydration', label: 'Hydration', emoji: '🥤' },
    { value: 'ID Cards', label: 'ID Cards', emoji: '🆔' },
    { value: 'Personal', label: 'Personal', emoji: '👤' },
    { value: 'Accessories', label: 'Accessories', emoji: '⌚' },
    { value: 'Clothing', label: 'Clothing', emoji: '👕' },
    { value: 'Other', label: 'Other', emoji: '📦' }
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'main-hall', label: 'Main Hall (Offices, Assembly Hall)' },
    { value: 'james-hall', label: 'James Hall (Physics, Chemistry)' },
    { value: 'jivana-jyoti-block', label: 'Jivana Jyoti Block' },
    { value: 'binghamton-hall', label: 'Binghamton Hall (Bio)' },
    { value: 'flint-house', label: 'Flint House (English)' },
    { value: 'new-building', label: 'New Building (CS, Management)' },
    { value: 'paul-linder-love-hall', label: 'Paul Linder Love Hall (MCA, Data)' },
    { value: 'jones-hall', label: 'Jones Hall (Exam)' },
    { value: 'washburn-hall', label: 'Washburn Hall' },
    { value: 'dudley-hall', label: 'Dudley Hall' },
    { value: 'wallace-hall', label: 'Wallace Hall' },
    { value: 'ladies-hostel', label: 'Ladies Hostel' },
    { value: 'college-canteen', label: 'College Canteen' },
    { value: 'library', label: 'Library' },
    { value: 'main-gate', label: 'Main Gate' },
    { value: 'playground', label: 'Playground' },
    { value: 'other', label: 'Other (specify)' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    fetchItems();
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [filters, activeTab]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'found' ? '/api/found' : '/api/lost';
      const params = new URLSearchParams({
        page: 1,
        limit: 1000, // Fetch all items for client-side pagination
        ...filters,
        status: 'OPEN'
      });
      const res = await API.get(`${endpoint}?${params}`);
      setItems(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
    } catch (err) {
      console.error('Error fetching items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleLocationSelect = (value) => {
    setFilters({ ...filters, location: value });
    setShowLocationModal(false);
  };

  const handleCategoryClick = (category) => {
    setFilters({ ...filters, category: category.value });
  };

  // Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeTab === 'found') {
      setActiveTab('lost');
    }
    if (isRightSwipe && activeTab === 'lost') {
      setActiveTab('found');
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSelectedLocationLabel = () => {
    if (!filters.location) return 'Campus';
    const selected = locationOptions.find(loc => loc.value === filters.location);
    return selected ? selected.label.split('(')[0].trim() : 'Campus';
  };

  // Return skeleton when loading
  if (loading) {
    return <FoundItemsSkeleton />;
  }

  // Pagination calculations
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return (
    <>
      <div className="w-full max-w-[1140px] mx-auto glass-panel rounded-t-4xl flex flex-col overflow-hidden relative mt-5 pb-8 md:pb-0 border-white/20 shadow-sm">
        {/* Header Section */}
        <div className="flex-none px-4 md:px-10 pt-6 md:pt-10 pb-4 md:pb-6">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-1 md:mb-2">
              Campus Lost & Found
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto">
              A centralized portal for students and faculty to reunite lost items with their rightful owners.
            </p>
          </div>

          {/* MOBILE: Search + Location + Report in One Row */}
          <div className="md:hidden flex items-center gap-1.5 mb-4">
            {/* Search Bar with Location Icon - 75% */}
            <div className="relative flex-[7.5]">
              <span className="material-symbols-rounded absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pr-2">search</span>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full h-[36px] pl-9 pr-10 bg-white/60 border-none ring-1 ring-slate-200 focus:ring-2 rounded-lg text-xs transition-all placeholder:text-slate-400 outline-none focus:ring-indigo-500"
                placeholder="Search..."
              />
              {/* Separator */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-px bg-slate-300"></div>
              {/* Location Icon Inside Search Bar */}
              <button
                onClick={() => setShowLocationModal(true)}
                className="absolute right-1.5 top-1/2 -translate-y-[12px] text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                <span className="material-symbols-rounded text-xs">location_on</span>
              </button>
            </div>

            {/* Report Button - 25% */}
            <Link
              to={activeTab === 'found' ? "/found/report" : "/report-lost"}
              className="flex-[2.5] h-[36px] ring-1 rounded-lg flex items-center justify-center transition-all bg-indigo-500 hover:bg-indigo-600 ring-indigo-500"
            >
              <span className="material-symbols-rounded text-white text-sm">add</span>
              <span className="text-white text-xs font-medium ml-1">New</span>
            </Link>
          </div>

          {/* MOBILE: Categories Only (No Title) */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryClick(category)}
                className={`flex items-center gap-1 px-3 py-1.5 backdrop-blur-sm rounded-xl transition-all border-2 whitespace-nowrap ${
                  filters.category === category.value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white/60 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-[9px] uppercase tracking-wider">{category.label}</span>
              </button>
            ))}
          </div>

          {/* MOBILE: Tab Indicator */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-4">
            <span className="text-xs font-bold text-slate-600">{activeTab === 'found' ? 'Found Items' : 'Lost Items'}</span>
            <div className="w-2 h-2 rounded-full transition-all bg-indigo-500"></div>
          </div>

          {/* DESKTOP: Original Layout */}
          <div className="hidden md:flex flex-col md:flex-row items-center gap-4 md:gap-6 h-auto md:h-[48px]">
            <div className="relative w-full md:flex-[5] h-[48px]">
              <span className="material-symbols-rounded absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg md:text-base">search</span>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full h-full pl-10 md:pl-12 pr-4 bg-white/60 border-none ring-1 rounded-xl md:rounded-2xl text-sm md:text-base transition-all placeholder:text-slate-400 outline-none ring-slate-200 focus:ring-2 focus:ring-indigo-500"
                placeholder="Search for items, descriptions, or brands..."
              />
            </div>

            <div className="w-full md:flex-[3] h-[48px] bg-white/60 p-1 rounded-xl md:rounded-2xl ring-1 ring-slate-200 flex items-center">
              <button
                onClick={() => setActiveTab('found')}
                className={`flex-1 h-full rounded-lg md:rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                  activeTab === 'found'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                }`}
              >
                Found
              </button>
              <button
                onClick={() => setActiveTab('lost')}
                className={`flex-1 h-full rounded-lg md:rounded-xl text-sm font-semibold flex items-center justify-center transition-all ${
                  activeTab === 'lost'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                }`}
              >
                Lost
              </button>
            </div>

            <div className="w-full md:flex-[2] h-[48px] relative">
              <Select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                options={locationOptions}
                placeholder="All Locations"
                className="h-[48px]"
              />
            </div>
          </div>

          {/* DESKTOP: Quick Categories */}
          <div className="hidden md:flex items-center gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide border-t border-slate-200/20 pt-4 md:pt-6 mb-6 md:mb-8">
            <div className="flex items-center gap-2 shrink-0">
              <span className="material-symbols-rounded text-primary text-lg md:text-xl">category</span>
              <h3 className="text-sm md:text-xl text-slate-700 whitespace-nowrap">Quick Categories:</h3>
            </div>
            <div className="flex gap-2 md:gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryClick(category)}
                  className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 backdrop-blur-sm rounded-xl md:rounded-2xl hover:bg-white/70 transition-all border-2 whitespace-nowrap ${
                    filters.category === category.value
                      ? 'bg-primary text-white border-primary hover:text-slate-700'
                      : 'bg-white/60 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs md:text-base">{category.emoji}</span>
                  <span className="font-bold text-[8px] md:text-[10px] uppercase tracking-wider">{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items Grid - With Swipe Support on Mobile */}
        <div 
          className="flex-1 px-4 md:px-10 pb-10 md:pb-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex flex-col gap-0 md:gap-8">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white/60 backdrop-blur-sm border-2 border-slate-200 rounded-3xl p-4 md:p-6 animate-pulse">
                    <div className="h-32 md:h-44 bg-white/40 rounded-2xl mb-4"></div>
                    <div className="h-4 bg-white/40 rounded-xl mb-2"></div>
                    <div className="h-3 bg-white/30 rounded-xl w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-rounded text-2xl text-slate-400">search_off</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No items found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters or check back later.</p>
              </div>
            ) : (
                <div className="flex flex-col gap-0 md:gap-8">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {/* Add New Item Card - Desktop Only */}
                  <div className="hidden md:flex relative bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-3xl flex-col items-center justify-between text-center group hover:bg-white/70 transition-all overflow-hidden h-[260px] md:h-[300px] p-6">
                    <div className="absolute top-[-24px] left-[-34px] z-[-1] w-20 h-20 rounded-full bg-white/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-rounded text-indigo-500/50 rotate-90 scale-[8] group-hover:rotate-0 transition-transform duration-300">add_circle</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-1 text-slate-800">Found or Lost something?</h4>
                      <p className="text-sm text-slate-500 mb-4">Report items and help them reach the right person.</p>
                      <p className="text-xs text-slate-400">Wallets • Phones • Keys • Documents • More</p>
                    </div>
                    <div className="w-full border-t border-dashed border-gray-300 my-4" />
                    <div className="flex flex-col gap-2 w-full">
                      <Link to="/found/report" className="bg-primary text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all">
                        Post Found Item
                      </Link>
                      <Link to="/report-lost" className="border-2 border-primary/50 text-primary py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                        Post Lost Item
                      </Link>
                    </div>
                  </div>

                  {/* Items Cards */}
                  {paginatedItems.map((item) => (
                    <div key={item._id} className="bg-white/60 backdrop-blur-sm border-2 border-slate-200 rounded-3xl overflow-hidden group hover:bg-white/70 transition-all duration-300 flex flex-col h-[260px] md:h-[300px]">
                      <div className="relative h-28 md:h-36 w-full overflow-hidden bg-indigo-50">
                        {item.imageUrl ? (
                          <img src={getImageUrl(item.imageUrl)} alt={item.itemName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-slate-200/50 flex items-center justify-center">
                            <span className="material-symbols-rounded text-lg text-slate-300">image</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 bg-white/90 rounded-full text-[8px] font-black uppercase tracking-widest text-primary">
                            {item.category}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 bg-black/70 rounded-full text-[8px] text-white">
                            {formatDate(item.dateFound || item.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 md:p-3 flex flex-col flex-1">
                        <h4 className="font-bold text-sm md:text-base text-slate-800 line-clamp-1">{item.itemName}</h4>
                        <div className="flex items-center gap-1 text-slate-500 text-xs md:text-sm mt-1">
                          <span className="material-symbols-rounded text-sm">location_on</span>
                          <span className="truncate">{item.locationFound || item.locationLost}</span>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-200/30">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">
                            {item.reportedBy?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <button onClick={() => navigate(activeTab === 'found' ? `/found/${item._id}` : `/lost/${item._id}`)} className="font-bold text-primary hover:text-indigo-700 text-[9px] uppercase tracking-widest flex items-center gap-1">
                            Details
                            <span className="material-symbols-rounded text-sm">chevron_right</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {items.length > 0 && (
                  <div className="flex flex-col md:flex-row items-center justify-between px-4 pb-3 pt-0 md:py-3 bg-white/30 border-t border-white/20 gap-3 mt-4 mb-2 md:mt-0">
                    <div className=" hidden md:inline text-xs md:text-sm text-slate-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, items.length)} of {items.length} items
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <button
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            setCurrentPage(prev => Math.max(((Math.floor((prev - 1) / 3) - 1) * 3) + 1, 1));
                          } else {
                            setCurrentPage(prev => Math.max(prev - 1, 1));
                          }
                        }}
                        disabled={currentPage === 1}
                        className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium text-slate-600 bg-white/60 border border-slate-200 rounded-lg md:rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {(() => {
                          const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                          if (window.innerWidth >= 768) return pages.map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 text-sm font-medium rounded-xl transition-all ${
                                currentPage === page
                                  ? 'bg-indigo-500 text-white border border-indigo-600'
                                  : 'bg-white/60 text-slate-600 border border-slate-200 hover:bg-white/80'
                              }`}
                            >
                              {page}
                            </button>
                          ));

                          const chunkSize = 3;
                          const currentChunkIndex = Math.floor((currentPage - 1) / chunkSize);
                          const startPage = currentChunkIndex * chunkSize + 1;
                          const endPage = Math.min(startPage + chunkSize - 1, totalPages);
                          
                          return pages.slice(startPage - 1, endPage).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-6 h-6 text-xs font-medium rounded-lg transition-all ${
                                currentPage === page
                                  ? 'bg-indigo-500 text-white border border-indigo-600'
                                  : 'bg-white/60 text-slate-600 border border-slate-200 hover:bg-white/80'
                              }`}
                            >
                              {page}
                            </button>
                          ));
                        })()}
                      </div>
                      
                      <button
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            setCurrentPage(prev => Math.min(((Math.floor((prev - 1) / 3) + 1) * 3) + 1, totalPages));
                          } else {
                            setCurrentPage(prev => Math.min(prev + 1, totalPages));
                          }
                        }}
                        disabled={
                          window.innerWidth < 768 
                            ? Math.floor((currentPage - 1) / 3) === Math.floor((totalPages - 1) / 3)
                            : currentPage === totalPages
                        }
                        className="px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium text-slate-600 bg-white/60 border border-slate-200 rounded-lg md:rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Modal - Glassmorphic */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-t-3xl md:rounded-3xl w-full max-w-md max-h-[70vh] overflow-hidden border border-white/40 shadow-2xl animate-slide-up">
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Select Location</h3>
              <button onClick={() => setShowLocationModal(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <span className="material-symbols-rounded text-slate-600">close</span>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(70vh-80px)] p-4 space-y-2">
              {locationOptions.map((location) => (
                <button
                  key={location.value}
                  onClick={() => handleLocationSelect(location.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    filters.location === location.value ? 'bg-indigo-500 text-white' : 'bg-white/60 hover:bg-white/80 text-slate-700'
                  }`}
                >
                  <span className="font-medium text-sm">{location.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FoundItems;