import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import UserDetailsOverlay from '../components/UserDetailsOverlay';
import Toast from '../components/Toast';
import Select from '../components/Select';
import API, { getImageUrl } from '../services/api';

const LostItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [lostItem, setLostItem] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [claims, setClaims] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [toast, setToast] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    itemName: '',
    category: '',
    description: '',
    locationLost: ''
  });
  const [isFromManageReports, setIsFromManageReports] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Check if coming from dashboard or manage reports using multiple methods
    const fromManage = localStorage.getItem('fromManageReports');
    const isFromState = location.state?.fromManageReports;
    
    if (fromManage === 'true' || isFromState) {
      setIsFromManageReports(true);
      // Clear the flag after using it
      localStorage.removeItem('fromManageReports');
    }
    
    fetchLostItem();
  }, [id, location.state]);

  const fetchLostItem = async () => {
    try {
      // Fetch the lost item
      const [itemRes, claimsRes] = await Promise.all([
        API.get(`/api/lost/${id}`),
        API.get(`/api/interests/lost/${id}`)
      ]);
      setLostItem(itemRes.data.data);
      const claimsData = claimsRes.data.data || [];
      console.log('=== CLAIMS DATA DEBUG ===');
      console.log('Total claims:', claimsData.length);
      console.log('Claims data from API:', claimsData);
      if (claimsData.length > 0) {
        console.log('First claim structure:', JSON.stringify(claimsData[0], null, 2));
        console.log('First claim userId:', claimsData[0].userId);
        console.log('First claim userId name:', claimsData[0].userId?.name);
      }
      console.log('========================');
      setClaims(claimsData);
    } catch (err) {
      console.error('Error fetching lost item:', err);
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  const handleInterestSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setToast({ message: 'Please provide a message', type: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/api/interests', { lostItemId: id, message });
      setToast({ message: 'Thank you! The owner will be notified about your finding.', type: 'success' });
      setMessage('');
      // Refresh claims after submission
      const claimsRes = await API.get(`/api/interests/lost/${id}`);
      setClaims(claimsRes.data.data || []);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to submit finding', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      setToast({ message: 'Please provide a reply message', type: 'warning' });
      return;
    }

    try {
      await API.post(`/api/interests/${replyingTo}/reply`, { message: replyMessage });
      setToast({ message: 'Reply sent successfully!', type: 'success' });
      setReplyMessage('');
      setReplyingTo(null);
      // Refresh claims to show new replies
      const claimsRes = await API.get(`/api/interests/lost/${id}`);
      setClaims(claimsRes.data.data || []);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to send reply', type: 'error' });
    }
  };

  const handleUpdate = () => {
    setUpdateForm({
      itemName: lostItem.itemName,
      category: lostItem.category,
      description: lostItem.description,
      locationLost: lostItem.locationLost
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async () => {
    try {
      await API.patch(`/api/lost/${id}`, updateForm);
      setToast({ message: 'Report updated successfully', type: 'success' });
      setShowUpdateModal(false);
      fetchLostItem(); // Refresh the data
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update report', type: 'error' });
    }
  };

  const handleResolve = async () => {
    try {
      await API.patch(`/api/lost/${id}/close`);
      setToast({ message: 'Report resolved successfully. It will disappear in 7 days.', type: 'success' });
      setTimeout(() => {
        navigate(isFromManageReports ? '/reports' : '/found');
      }, 2000);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to resolve report', type: 'error' });
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Function to get proper initials
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  };

  if (loading) return (
    <div className="w-full max-w-[1140px] mx-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <span className="material-symbols-rounded text-2xl text-slate-400 animate-spin">refresh</span>
        </div>
      </div>
    </div>
  );

  if (!lostItem) return (
    <div className="w-full max-w-[1140px] mx-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Item Not Found</h2>
          <Link to="/found" className="text-orange-700 hover:text-orange-900 font-medium">
            Back to Lost & Found
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>

      {/* Main Container - Fixed height to connect to bottom */}
      <div className="mt-2" style={{height: 'calc(100vh - 64px)'}}>
        <div className="w-full max-w-[1140px] mx-auto glass-panel rounded-t-[40px] flex flex-col overflow-hidden h-full pb-22 md:pb-4">
          {/* Breadcrumbs */}
          <div className="px-6 md:px-8 pt-4 md:pt-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link to={isFromManageReports ? "/reports" : "/found"} className="text-orange-700 text-base font-medium leading-normal flex items-center gap-1 hover:translate-x-[-4px] transition-all">
                  <span className="material-symbols-rounded text-base ">arrow_back</span>
                  <span className='hidden md:inline'>
{isFromManageReports ? "Manage Reports" : "Lost & Found"}
                  </span>
                  
                </Link>
                <span className=" hidden md:inline text-slate-400 text-base font-medium leading-normal">/</span>
                <span className="text-slate-900 text-base font-medium leading-normal">{lostItem.itemName}</span>
              </div>
              
              {/* Status - Right side */}
              <div className="text-slate-600 text-base ">
                {isFromManageReports ? (
                  <div className="flex flex-col gap-[6px] items-end text-base">
                    <span className={`w-fit flex items-center justify-center gap-[0px] md:gap-2 px-[6px] md:px-3 py-[2px] md:py-1 rounded-full text-base font-medium ${
                      lostItem.status === 'CLOSED' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      <span className="material-symbols-rounded text-xs scale-65 md:scale-100">
                        {lostItem.status === 'CLOSED' ? 'check_circle' : 'schedule'}
                      </span>

                      {lostItem.status === 'CLOSED' ? 'Closed' : 'Open'}{" "}
                      on {new Date(lostItem.closedAt).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-xs md:text-sm text-slate-600 font-medium">
                      Lost by {lostItem.userId ? (
                        <button 
                          onClick={() => setSelectedUserId(lostItem.userId._id)}
                          className="text-orange-700 hover:text-orange-800 font-medium text-xs md:text-sm transition-colors"
                        >
                          {lostItem.userId.name}
                        </button>
                      ) : (
                        <span className="text-orange-700 font-medium text-xs md:text-sm">Anonymous</span>
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Fill remaining height */}
          <div className="flex-1 overflow-y-scroll no-scrollbar ">
            <div className="flex flex-col md:flex-row gap-3 md:gap-8 h-full px-3 md:px-8 pb-3">
              {/* Left Section: Item Image */}
              <div className="flex-1">
                <div className="w-full h-[240px] md:h-full bg-center bg-no-repeat bg-cover rounded-xl md:rounded-2xl shadow-inner overflow-hidden relative">
                  {lostItem.imageUrl ? (
    
<img 
                      src={getImageUrl(lostItem.imageUrl)} 
                      alt={lostItem.itemName} 
                      className=" w-full h-full object-cover" 
                    />

                    
                    
                    

                  ) : (
                    <div className="w-full h-full bg-slate-200/50 flex items-center justify-center">
                      <span className="material-symbols-rounded text-3xl md:text-4xl text-slate-300">image</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 p-2 md:p-4 bg-orange-500/50 rounded-b-xl w-full">
                    
                    <p className="text-white text-sm md:text-base font-medium flex items-center gap-2">
                      <span className="material-symbols-rounded">location_on</span>
                      <span className="truncate">
                        {lostItem.locationLost && lostItem.locationLost.length > 30 
                          ? `${lostItem.locationLost.slice(0, 30)}...` 
                          : lostItem.locationLost}
                      </span>
                    </p></div>
                  <div className="p-2 md:p-4">
                    <span className="bg-orange-500/90 text-white px-2 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg">
                      Lost Item
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section: Content Details */}
              <div className="flex-1 flex flex-col h-full">
                {/* Header Section */}
                <div className="mb-4">
                  <h1 className="text-slate-900 text-xl md:text-2xl font-semibold leading-tight mb-3">
                    {lostItem.itemName}
                  </h1>
                  
                  {/* Location with icon */}
                  {/* <div className="mb-3 hidden md:block">
                    <p className="text-orange-700 text-sm md:text-base font-medium flex items-center gap-2">
                      <span className="material-symbols-rounded">location_on</span>
                      <span className="truncate">
                        {lostItem.locationLost && lostItem.locationLost.length > 30 
                          ? `${lostItem.locationLost.slice(0, 30)}...` 
                          : lostItem.locationLost}
                      </span>
                    </p>
                  </div> */}
                </div>

                {/* Metadata Grid */}
                <div className="flex md:grid md:grid-cols-2 gap-2 md:gap-4 mb-4">
                  <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-3 p-2 md:p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-sm text-center md:text-start">
                    <div className="hidden md:flex text-slate-900 bg-white p-2 rounded-full items-center justify-center shrink-0 md:mt-0.5">
                      <span className="material-symbols-rounded text-sm">category</span>
                    </div>
                    <div>
                      <h3 className="text-slate-900 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Category</h3>
                      <p className="text-slate-600 text-[11px] md:text-sm font-medium">{lostItem.category}</p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-3 p-2 md:p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-sm text-center md:text-start">
                    <div className="hidden md:flex text-slate-900 bg-white p-2 rounded-full items-center justify-center shrink-0 md:mt-0.5">
                      <span className="material-symbols-rounded text-sm">calendar_today</span>
                    </div>
                    <div>
                      <h3 className="text-slate-900 text-[10px] md:text-xs font-semibold uppercase tracking-wider">Date Lost</h3>
                      <p className="text-slate-600 text-[11px] md:text-sm font-medium">{formatDate(lostItem.dateLost)}</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200/50 mb-4">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-3 py-2 text-sm font-medium transition-all ${
                      activeTab === 'details'
                        ? 'text-orange-700 border-b-2 border-orange-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Item Details
                  </button>
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className={`px-3 py-2 text-sm font-medium transition-all ${
                      activeTab === 'inquiries'
                        ? 'text-orange-700 border-b-2 border-orange-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Found Matches ({claims.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'details' && (
                    <div className="h-full">
                      <div className="bg-white/40 p-4 rounded-xl border border-slate-200/50 h-full overflow-y-auto scrollbar-hide">
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {lostItem.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'inquiries' && (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {claims.length === 0 ? (
                          <div className="text-center py-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                              <span className="material-symbols-rounded text-xl text-slate-400">inbox</span>
                            </div>
                            <p className="text-slate-500 font-medium text-sm">No matches found yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {claims.map((claim, index) => {
                              console.log(`=== RENDERING CLAIM ${index} ===`);
                              console.log('Claim:', claim);
                              console.log('Claim userId:', claim.userId);
                              console.log('Claim userId name:', claim.userId?.name);
                              console.log('Claim userId _id:', claim.userId?._id);
                              console.log('==============================');
                              
                              return (
                              <div key={claim._id} className="bg-white/40 rounded-xl p-3 border border-slate-200/50 hover:bg-white/50 transition-colors">
                                {/* Main Message */}
                                <div className="flex items-start gap-3">
                                  <div 
                                    onClick={() => setSelectedUserId(claim.userId?._id)}
                                    className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-medium text-sm cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                                  >
                                    {getInitials(claim.userId?.name)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span 
                                        onClick={() => setSelectedUserId(claim.userId?._id)}
                                        className="text-slate-900 font-medium hover:text-orange-700 cursor-pointer text-sm"
                                      >
                                        {claim.userId?.name || 'Unknown User'}
                                      </span>
                                      <span className="text-slate-400 text-xs">
                                        • {new Date(claim.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="text-slate-600 text-sm leading-relaxed mb-2">
                                      {claim.message}
                                    </div>
                                    
                                    {/* Replies */}
                                    {claim.replies && claim.replies.length > 0 && (
                                      <div className="ml-4 space-y-2 border-l-2 border-slate-200 pl-3">
                                        {claim.replies.map((reply, replyIndex) => (
                                          <div key={replyIndex} className="bg-slate-50/50 rounded-lg p-2">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-slate-700 font-medium text-xs">
                                                {reply.replyBy?.name || 'Unknown User'}
                                              </span>
                                              <span className="text-slate-400 text-xs">
                                                • {new Date(reply.createdAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <div className="text-slate-600 text-xs leading-relaxed">
                                              {reply.message}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* Reply Button */}
                                    <button
                                      onClick={() => setReplyingTo(replyingTo === claim._id ? null : claim._id)}
                                      className="text-orange-700 hover:text-orange-800 text-xs font-medium flex items-center gap-1 transition-colors"
                                    >
                                      <span className="material-symbols-rounded text-sm">reply</span>
                                      {replyingTo === claim._id ? 'Cancel' : 'Reply'}
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Reply Input */}
                                {replyingTo === claim._id && (
                                  <div className="mt-3 ml-11">
                                    <form onSubmit={handleReply} className="flex gap-2">
                                      <input
                                        type="text"
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="flex-1 px-3 py-2 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-transparent"
                                      />
                                      <button
                                        type="submit"
                                        className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                      >
                                        <span className="material-symbols-rounded text-sm">send</span>
                                        Send
                                      </button>
                                    </form>
                                  </div>
                                )}
                              </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      {/* Message Input Box */}
                      <div className="border-t border-slate-200/50 p-3 bg-white/40 backdrop-blur-sm">
                        <form onSubmit={handleInterestSubmit} className="flex gap-2">
                          <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add your message if you found this item..."
                            className="flex-1 px-3 py-2 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-transparent"
                          />
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-orange-100 hover:bg-orange-200 disabled:bg-orange-50 text-orange-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            {submitting ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <span className="material-symbols-rounded text-sm">send</span>
                                Send
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4">
                  {isFromManageReports ? (
                    <div className={`flex gap-3 ${lostItem.status === 'CLOSED' ? 'hidden' : ''}`}>
                      <button 
                        onClick={handleUpdate}
                        disabled={lostItem.status === 'CLOSED'}
                        className={`flex-1 text-base md:text-lg font-semibold py-3 px-6 rounded-full shadow-sm border transition-all flex items-center justify-center gap-2 ${
                          lostItem.status === 'CLOSED'
                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                        }`}
                      >
                        <span className="material-symbols-rounded">edit</span>
                        Update
                      </button>
                      <button 
                        onClick={handleResolve}
                        disabled={lostItem.status === 'CLOSED'}
                        className={`flex-1 text-base md:text-lg font-semibold py-3 px-6 rounded-full shadow-sm border transition-all flex items-center justify-center gap-2 ${
                          lostItem.status === 'CLOSED'
                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200'
                        }`}
                      >
                        <span className="material-symbols-rounded">check_circle</span>
                        Resolve
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => navigate('/found/report', { state: { linkedLostItemId: id } })}
                      className="bg-orange-100 hover:bg-orange-200 text-orange-700 text-base md:text-lg font-semibold py-3 px-6 rounded-full shadow-sm border border-orange-200 transition-all flex items-center justify-center gap-2 w-full"
                    >
                      <span className="material-symbols-rounded">search</span>
                      I Found This Item
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={updateForm.itemName}
                  onChange={(e) => setUpdateForm({...updateForm, itemName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <Select
                  label="Category"
                  name="category"
                  value={updateForm.category}
                  onChange={(e) => setUpdateForm({...updateForm, category: e.target.value})}
                  options={[
                    { value: 'ID Card', label: 'ID Card' },
                    { value: 'Phone', label: 'Phone' },
                    { value: 'Wallet', label: 'Wallet' },
                    { value: 'Bag', label: 'Bag' },
                    { value: 'Keys', label: 'Keys' },
                    { value: 'Book', label: 'Book' },
                    { value: 'Electronics', label: 'Electronics' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  placeholder="Select category"
                />
              </div>
              
              <div>
                <Select
                  label="Location"
                  name="locationLost"
                  value={updateForm.locationLost}
                  onChange={(e) => setUpdateForm({...updateForm, locationLost: e.target.value})}
                  options={[
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
                  ]}
                  placeholder="Select location"
                  menuPortalTarget={document.body}
                  styles={{
                    menu: (base) => ({
                      ...base,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(15, 23, 42, 0.05)',
                      padding: '4px',
                      zIndex: 9999,
                      maxHeight: '200px'
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menuList: (base) => ({
                      ...base,
                      maxHeight: '180px',
                      overflowY: 'auto'
                    }),
                    option: (base, state) => ({
                      ...base,
                      borderRadius: '8px',
                      margin: '1px 0',
                      padding: '8px 12px',
                      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                      color: state.isSelected ? 'white' : '#0f172a',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      '&:active': {
                        backgroundColor: '#2563eb',
                        color: 'white'
                      }
                    })
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({...updateForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Update Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Overlay */}
      <UserDetailsOverlay 
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />

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

export default LostItemDetails;
