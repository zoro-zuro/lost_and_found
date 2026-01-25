import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import API from '../services/api';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await API.get('/api/interests/mine');
      setClaims(res.data.data);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'neutral';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading && claims.length === 0) return <AppLayout><div className="py-24 flex justify-center"><LoadingSpinner /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader 
          title="Claim Submissions"
          subtitle="History of your verification requests for discovered items."
        />

        {claims.length === 0 && !loading ? (
          <EmptyState
            title="No Claims Found"
            description="You haven't submitted any claim requests yet."
            action={<button onClick={() => navigate('/found')} className="btn-primary">Browse Gallery</button>}
          />
        ) : (
          <div className="space-y-4 animate-fade-in pb-20">
            {claims.map((claim) => (
              <Card key={claim._id} className="p-6 !rounded-[20px] border-border/10 shadow-sm bg-surface">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center justify-between md:justify-start gap-4">
                       <Badge variant={getStatusVariant(claim.status)} className="scale-90 origin-left">{claim.status}</Badge>
                       <span className="text-[10px] font-bold text-muted-text uppercase tracking-tight opacity-50">Transmitted {new Date(claim.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-h2 text-text font-bold leading-tight">
                      {claim.foundItemId?.itemName || 'Unknown Item'}
                    </h3>
                    <div className="bg-bg/40 p-3 rounded-[12px] border border-border/50">
                      <p className="text-[13px] text-text italic font-medium leading-snug">"{claim.message}"</p>
                    </div>
                  </div>
                  <div className="w-full md:w-auto shrink-0">
                    <button 
                      onClick={() => navigate(`/found/${claim.foundItemId?._id}`)}
                      className="w-full md:w-auto btn-secondary btn-md !h-10 !px-5 text-[11px]"
                    >
                      View Item
                    </button>
                  </div>
                </div>

                {claim.status === 'APPROVED' && claim.pickupInstructions && (
                  <div className="mt-4 p-4 bg-success/5 border border-success/10 rounded-[16px] animate-fade-in">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-[10px] bg-success text-white flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[10px] font-bold text-success uppercase tracking-widest mb-0.5">Pickup Instructions</h4>
                        <p className="text-small text-text leading-relaxed whitespace-pre-wrap">{claim.pickupInstructions}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyClaims;
