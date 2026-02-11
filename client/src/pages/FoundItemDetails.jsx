import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import UserDetailsOverlay from '../components/UserDetailsOverlay';
import Toast from '../components/Toast';
import Select from '../components/Select';
import API, { getImageUrl } from '../services/api';

const CATEGORY_OPTIONS = [
  { value: 'ID Card', label: 'ID Card' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Wallet', label: 'Wallet' },
  { value: 'Bag', label: 'Bag' },
  { value: 'Keys', label: 'Keys' },
  { value: 'Book', label: 'Book' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Other', label: 'Other' }
];

const LOCATION_OPTIONS = [
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

const FoundItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [foundItem, setFoundItem] = useState(null);
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
  const [updateForm, setUpdateForm] = useState({ itemName: '', category: '', description: '', locationFound: '' });
  const [isFromManageReports, setIsFromManageReports] = useState(false);

  useEffect(() => {
    const fromManage = localStorage.getItem('fromManageReports');
    if (fromManage === 'true' || location.state?.fromManageReports) {
      setIsFromManageReports(true);
      localStorage.removeItem('fromManageReports');
    }
    fetchFoundItem();
  }, [id, location.state]);

  const fetchFoundItem = async () => {
    try {
      const [itemRes, claimsRes] = await Promise.all([
        API.get(`/api/found/${id}`),
        API.get(`/api/interests/found/${id}`)
      ]);
      setFoundItem(itemRes.data.data);
      setClaims(claimsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching found item:', err);
      navigate('/found');
    } finally {
      setLoading(false);
    }
  };

  const handleInterestSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return setToast({ message: 'Please provide a message', type: 'warning' });
    setSubmitting(true);
    try {
      await API.post('/api/interests', { foundItemId: id, message });
      setToast({ message: 'Claim interest recorded! The finder will be notified.', type: 'success' });
      setMessage('');
      const res = await API.get(`/api/interests/found/${id}`);
      setClaims(res.data.data || []);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to record interest', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return setToast({ message: 'Please provide a reply message', type: 'warning' });
    try {
      await API.post(`/api/interests/${replyingTo}/reply`, { message: replyMessage });
      setToast({ message: 'Reply sent successfully!', type: 'success' });
      setReplyMessage('');
      setReplyingTo(null);
      const res = await API.get(`/api/interests/found/${id}`);
      setClaims(res.data.data || []);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to send reply', type: 'error' });
    }
  };

  const handleUpdate = () => {
    setUpdateForm({
      itemName: foundItem.itemName,
      category: foundItem.category,
      description: foundItem.description,
      locationFound: foundItem.locationFound
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async () => {
    try {
      await API.patch(`/api/found/${id}`, updateForm);
      setToast({ message: 'Report updated successfully', type: 'success' });
      setShowUpdateModal(false);
      fetchFoundItem();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update report', type: 'error' });
    }
  };

  const handleResolve = async () => {
    try {
      await API.patch(`/api/found/${id}/close`);
      setToast({ message: 'Report resolved successfully. It will disappear in 7 days.', type: 'success' });
      setTimeout(() => navigate(isFromManageReports ? '/reports' : '/found'), 2000);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to resolve report', type: 'error' });
    }
  };

  const formatDate = (ds) => new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
        <span className="material-symbols-rounded text-2xl text-slate-400 animate-spin">refresh</span>
      </div>
    </div>
  );

  // ── Not found ───────────────────────────────────────────────────────────
  if (!foundItem) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Item Not Found</h2>
        <Link to="/found" className="text-indigo-500 hover:text-indigo-700 font-medium">Back to Gallery</Link>
      </div>
    </div>
  );

  const isClosed = foundItem.status === 'CLOSED';

  // ── Main ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="mt-2" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="w-full max-w-[1140px] mx-auto glass-panel rounded-t-[40px] flex flex-col overflow-hidden h-full pb-24">

          {/* ── Breadcrumbs ── */}
          <div className="px-6 md:px-8 pt-4 md:pt-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  to={isFromManageReports ? '/reports' : '/found'}
                  className="text-primary text-base font-medium leading-normal flex items-center gap-1 hover:translate-x-[-4px] transition-all"
                >
                  <span className="material-symbols-rounded text-base">arrow_back</span>
                  <span className='hidden md:inline'>
{isFromManageReports ? 'Manage Reports' : 'Lost & Found'}
                  </span>
                  
                </Link>
                <span className="hidden md:inline text-slate-400 text-base font-medium leading-normal">/</span>
                <span className="text-slate-900 text-base font-medium leading-normal">{foundItem.itemName}</span>
              </div>

              <div className="text-slate-600 text-sm">
                {isFromManageReports ? (
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isClosed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isClosed ? 'CLOSED' : 'OPEN'}
                    </span>
                    {isClosed && foundItem.closedAt && (
                      <span className="text-xs text-slate-500">Closed on {new Date(foundItem.closedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                ) : (
                  <div className="inline">
                    <span className="text-xs md:text-sm text-slate-600 font-medium">
                      Found by{' '}
                    </span>
                    {foundItem.reportedBy?.name ? (
                      <button onClick={() => setSelectedUserId(foundItem.reportedBy._id)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs md:text-sm transition-colors">
                        {foundItem.reportedBy.name}

                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs md:text-sm">No user</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Content row ── */}
          <div className="flex-1 overflow-y-scroll no-scrollbar">
            <div className="flex flex-col md:flex-row gap-3 md:gap-8 h-full px-3 md:px-8 pb-3">

              {/* ── Left – Image ── */}
              <div className="flex-1 md:flex-initial">
                <div className="w-full h-[240px] md:h-full md:w-[400px] rounded-xl md:rounded-2xl shadow-inner overflow-hidden relative">
                  {foundItem.imageUrl ? (
                    <img src={getImageUrl(foundItem.imageUrl)} alt={foundItem.itemName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200/50 flex items-center justify-center">
                      <span className="material-symbols-rounded text-3xl md:text-4xl text-slate-300">image</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 p-2 md:p-4 bg-indigo-500/50 backdrop-blur-sm w-full rouded-t-2xl">
                      <p className="text-white text-xs md:hidden font-medium flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm md:text-base">location_on</span>
                    <span className="truncate">
                      {foundItem.locationFound && foundItem.locationFound.length > 30 ? `${foundItem.locationFound.slice(0, 30)}...` : foundItem.locationFound}
                    </span>
                  </p>
                    
                  </div>
                </div>
              </div>

              {/* ── Right – Details ── */}
              <div className="flex-1 flex flex-col h-full">
                {/* Title + location */}
                <div className="mb-2 md:mb-4">
                  <h1 className="text-slate-900 text-lg md:text-2xl font-semibold leading-tight mb-0 md:mb-2">{foundItem.itemName}</h1>
                  <p className="text-indigo-500 hidden text-xs md:text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm md:text-base">location_on</span>
                    <span className="truncate">
                      {foundItem.locationFound && foundItem.locationFound.length > 30 ? `${foundItem.locationFound.slice(0, 30)}...` : foundItem.locationFound}
                    </span>
                  </p>
                </div>

                {/* Metadata grid */}
                <div className="flex md:grid md:grid-cols-2 gap-2 md:gap-4 mb-3">
                  {[
                    { icon: 'category', label: 'Category', value: foundItem.category },
                    { icon: 'calendar_today', label: 'Date Found', value: formatDate(foundItem.dateFound) }
                  ].map((item) => (
                    <div key={item.label} className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-3 p-2 md:p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-sm text-center md:text-start">
                      <div className="hidden md:flex text-slate-900 bg-white p-2 rounded-full items-center justify-center shrink-0 md:mt-0.5">
                        <span className="material-symbols-rounded text-sm">{item.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-slate-900 text-[10px] md:text-xs font-semibold uppercase tracking-wider">{item.label}</h3>
                        <p className="text-slate-600 text-[11px] md:text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200/50 mb-2 md:mb-4">
                  {[
                    { key: 'details', label: 'Item Details' },
                    { key: 'inquiries', label: `Active Inquiries (${claims.length})` }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-2 py-1.5 text-xs md:text-sm font-medium transition-all ${activeTab === tab.key ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ── Tab content ── */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'details' && (
                    <div className="h-full">
                      <div className="bg-white/40 p-3 md:p-4 rounded-xl border border-slate-200/50 h-full overflow-y-auto scrollbar-hide">
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{foundItem.description}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'inquiries' && (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {claims.length === 0 ? (
                          <div className="text-center py-4 md:py-6">
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2 md:mb-3 mx-auto">
                              <span className="material-symbols-rounded text-sm md:text-xl text-slate-400">inbox</span>
                            </div>
                            <p className="text-slate-500 font-medium text-xs md:text-sm">No pending verification requests.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 md:space-y-3">
                            {claims.map((claim) => (
                              <div key={claim._id} className="bg-white/40 rounded-xl p-2 md:p-3 border border-slate-200/50 hover:bg-white/50 transition-colors">
                                <div className="flex items-start gap-2 md:gap-3">
                                  <div onClick={() => setSelectedUserId(claim.userId?._id)} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium text-xs md:text-sm cursor-pointer hover:scale-105 transition-transform flex-shrink-0">
                                    {getInitials(claim.userId?.name)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                                      <span onClick={() => setSelectedUserId(claim.userId?._id)} className="text-slate-900 font-medium hover:text-indigo-500 cursor-pointer text-xs md:text-sm">
                                        {claim.userId?.name}
                                      </span>
                                      <span className="text-slate-400 text-[10px] md:text-xs">• {new Date(claim.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-1 md:mb-2">{claim.message}</p>

                                    {/* Replies */}
                                    {claim.replies?.length > 0 && (
                                      <div className="ml-2 md:ml-4 space-y-1 md:space-y-2 border-l-2 border-slate-200 pl-2 md:pl-3">
                                        {claim.replies.map((reply, idx) => (
                                          <div key={idx} className="bg-slate-50/50 rounded-lg p-1.5 md:p-2">
                                            <div className="flex items-center gap-1 md:gap-2 mb-1">
                                              <span className="text-slate-700 font-medium text-[10px] md:text-xs">{reply.replyBy?.name || 'Finder'}</span>
                                              <span className="text-slate-400 text-[10px] md:text-xs">• {new Date(reply.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-slate-600 text-[10px] md:text-xs leading-relaxed">{reply.message}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <button onClick={() => setReplyingTo(replyingTo === claim._id ? null : claim._id)} className="text-indigo-500 hover:text-indigo-700 text-[10px] md:text-xs font-medium flex items-center gap-1 transition-colors mt-1">
                                      <span className="material-symbols-rounded text-xs md:text-sm">reply</span>
                                      {replyingTo === claim._id ? 'Cancel' : 'Reply'}
                                    </button>
                                  </div>
                                </div>

                                {/* Reply input */}
                                {replyingTo === claim._id && (
                                  <div className="mt-2 md:mt-3 ml-8 md:ml-11">
                                    <form onSubmit={handleReply} className="flex gap-1 md:gap-2">
                                      <input
                                        type="text"
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="flex-1 px-2 md:px-3 py-1.5 md:py-2 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                                      />
                                      <button type="submit" className="px-2 md:px-3 py-1.5 md:py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1">
                                        <span className="material-symbols-rounded text-xs md:text-sm">send</span>
                                        <span className="hidden md:inline">Send</span>
                                      </button>
                                    </form>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* New inquiry box */}
                      <div className="border-t border-slate-200/50 p-2 md:p-4 bg-white/40 backdrop-blur-sm">
                        <form onSubmit={handleInterestSubmit} className="flex gap-1 md:gap-2">
                          <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add your inquiry message..."
                            className="flex-1 px-2 md:px-3 py-1.5 md:py-2 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                          />
                          <button type="submit" disabled={submitting} className="px-2 md:px-4 py-1.5 md:py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-1">
                            {submitting ? (
                              <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <span className="material-symbols-rounded text-xs md:text-sm">send</span>
                                <span className="hidden md:inline">Send</span>
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Action buttons ── */}
                <div className="mt-2 md:mt-4">
                  {isFromManageReports ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        disabled={isClosed}
                        className={`flex-1 text-sm md:text-lg font-semibold py-2 md:py-3 px-4 md:px-6 rounded-full shadow-sm border transition-all flex items-center justify-center gap-2 ${isClosed ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'}`}
                      >
                        <span className="material-symbols-rounded text-sm md:text-base">edit</span>
                        Update
                      </button>
                      <button
                        onClick={handleResolve}
                        disabled={isClosed}
                        className={`flex-1 text-sm md:text-lg font-semibold py-2 md:py-3 px-4 md:px-6 rounded-full shadow-sm border transition-all flex items-center justify-center gap-2 ${isClosed ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200'}`}
                      >
                        <span className="material-symbols-rounded text-sm md:text-base">check_circle</span>
                        Resolve
                      </button>
                    </div>
                  ) : (
                    <button className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm md:text-lg font-semibold py-2 md:py-3 px-4 md:px-6 rounded-full shadow-lg shadow-indigo-200/50 transition-all flex items-center justify-center gap-2 w-full">
                      <span className="material-symbols-rounded text-sm md:text-base">verified_user</span>
                      Claim This Item
                    </button>
                  )}
                </div>
              </div>
              {/* end Right */}
            </div>
            {/* end content row */}
          </div>
          {/* end flex-1 overflow */}
        </div>
        {/* end glass-panel */}
      </div>
      {/* end outer wrapper */}

      {/* ── Update Modal ── */}
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
                  onChange={(e) => setUpdateForm({ ...updateForm, itemName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Select
                label="Category"
                name="category"
                value={updateForm.category}
                onChange={(e) => setUpdateForm({ ...updateForm, category: e.target.value })}
                options={CATEGORY_OPTIONS}
                placeholder="Select category"
              />
              <Select
                label="Location"
                name="locationFound"
                value={updateForm.locationFound}
                onChange={(e) => setUpdateForm({ ...updateForm, locationFound: e.target.value })}
                options={LOCATION_OPTIONS}
                placeholder="Select location"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowUpdateModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">Cancel</button>
              <button onClick={handleUpdateSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Update Report</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Overlays ── */}
      <UserDetailsOverlay userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default FoundItemDetails;