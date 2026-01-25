import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import API from '../services/api';
import UserDetailModal from '../components/UserDetailModal';

const FoundItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [foundItem, setFoundItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [message, setMessage] = useState('');
  const [claims, setClaims] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFoundItem();
  }, [id]);

  const fetchFoundItem = async () => {
    try {
      const [itemRes, claimsRes] = await Promise.all([
        API.get(`/api/found/${id}`),
        API.get(`/api/interests/found/${id}`)
      ]);
      setFoundItem(itemRes.data.data);
      setClaims(claimsRes.data.data);
    } catch (err) {
      console.error('Error fetching found item:', err);
      setToast({ message: 'Failed to load item details', type: 'error' });
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
      await API.post('/api/interests', { foundItemId: id, message });
      setToast({ message: 'Claim interest recorded! The finder will be notified.', type: 'success' });
      setMessage('');
      const claimsRes = await API.get(`/api/interests/found/${id}`);
      setClaims(claimsRes.data.data);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to record interest', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) return <AppLayout><div className="py-24 flex justify-center"><LoadingSpinner /></div></AppLayout>;
  if (!foundItem) return <AppLayout><div className="text-center py-24 text-muted-text">Inventory record not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-10">
        <button
          onClick={() => navigate('/found')}
          className="text-primary hover:underline flex items-center text-[11px] font-bold uppercase tracking-wider gap-2 mb-6 bg-primary/5 px-4 py-2 rounded-[10px] w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Gallery
        </button>

        <PageHeader 
          title={foundItem.itemName}
          subtitle={`Found on ${formatDate(foundItem.dateFound)}`}
          action={<Badge variant="primary">{foundItem.category}</Badge>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-20">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 !rounded-[24px] border-border/10 shadow-xl overflow-hidden relative bg-surface">
            {foundItem.imageUrl && (
              <div className="mb-8 -mx-8 -mt-8 h-80 overflow-hidden border-b border-border/50">
                <img src={foundItem.imageUrl} alt={foundItem.itemName} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-10 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-muted-text tracking-widest uppercase block mb-1">Found Location</label>
                <div className="flex items-center gap-2">
                   <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg></div>
                   <p className="text-h2 text-text font-bold">{foundItem.locationFound}</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-text tracking-widest uppercase block mb-1">Log Date</label>
                <p className="text-h2 text-text font-bold">{formatDate(foundItem.createdAt)}</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <label className="text-[10px] font-bold text-muted-text tracking-widest uppercase block mb-3">Item Description</label>
              <div className="bg-bg/40 p-6 rounded-[16px] border border-border/50">
                <p className="text-body text-text leading-relaxed whitespace-pre-wrap font-medium">{foundItem.description}</p>
              </div>
            </div>
          </Card>

          {/* Claims Feed */}
          <div className="space-y-6">
             <h3 className="text-h2 font-bold text-text mb-6 uppercase tracking-tight">Active Inquiries</h3>
             {claims.length === 0 ? (
               <div className="p-8 bg-surface border border-dashed border-border/60 rounded-[16px] text-center">
                  <p className="text-muted-text font-bold uppercase tracking-widest text-[10px] opacity-60">No pending verification requests.</p>
               </div>
             ) : (
               <div className="space-y-1">
                 {claims.map(claim => (
                   <div key={claim._id} className="flex gap-3 group">
                      <div className="flex flex-col items-center">
                        <div 
                          onClick={() => { setSelectedUserId(claim.userId?._id); setIsModalOpen(true); }}
                          className="w-6 h-6 rounded-sm bg-muted-text/10 text-muted-text flex items-center justify-center font-bold text-[9px] cursor-pointer shrink-0 transition-transform hover:scale-105"
                        >
                          {claim.userId?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 w-0.5 bg-border/40 my-1 group-last:bg-transparent"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span 
                            onClick={() => { setSelectedUserId(claim.userId?._id); setIsModalOpen(true); }}
                            className="text-[11px] font-bold text-text tracking-tight hover:underline cursor-pointer"
                          >
                            {claim.userId?.name}
                          </span>
                          <span className="text-[10px] text-muted-text font-medium opacity-40 uppercase">
                            • {claim.userId?.role} • {new Date(claim.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[12.5px] mt-1 leading-relaxed bg-surface border border-border/60 shadow-sm px-3 py-2 rounded-lg text-text italic">
                           "{claim.message}"
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 !rounded-[24px] border-border/10 shadow-xl bg-primary/5">
            <h2 className="text-h2 text-text mb-2 font-bold uppercase tracking-tight">Claim Item</h2>
            <p className="text-small text-muted-text mb-6 leading-relaxed font-medium">Please provide details or evidence to verify you are the rightful owner.</p>
            
            <form onSubmit={handleInterestSubmit} className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Verification Details</label>
                 <textarea
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   rows={5}
                   className="w-full p-5 bg-surface border border-primary/20 rounded-[20px] focus:ring-4 focus:ring-primary/5 outline-none transition-all text-small text-text placeholder:text-muted-text/30 font-medium"
                   placeholder="Describe marks, lock screens, or content..."
                   required
                 />
               </div>
               
               <button
                 type="submit"
                 disabled={submitting}
                 className="w-full btn-primary btn-lg !rounded-[14px]"
               >
                 {submitting ? 'Submitting...' : 'Send Claim Request'}
               </button>
            </form>
          </Card>

          <Card className="p-6 bg-warning/5 border-warning/10 !rounded-[24px]">
             <h4 className="text-label text-text mb-3 text-warning flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Security Notice
             </h4>
             <p className="text-small text-muted-text leading-relaxed font-medium">
                Verify identity with campus security before asset release. Choose safe public meeting spots.
             </p>
          </Card>
        </div>
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <UserDetailModal userId={selectedUserId} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppLayout>
  );
};

export default FoundItemDetails;
