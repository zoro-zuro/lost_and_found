import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import CommentSection from '../components/CommentSection';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import Toast from '../components/Toast';
import API from '../services/api';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [toast, setToast] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      const res = await API.get(`/api/lost/${id}`);
      setReport(res.data.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseReport = async () => {
    if (!window.confirm('Are you sure you want to close this report?')) return;
    
    try {
      const res = await API.patch(`/api/lost/${id}/close`);
      setReport(res.data.data);
      setToast({ message: 'Report resolved successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Action failed', type: 'error' });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    if (report.status === 'CLOSED') return <Badge variant="success">RESOLVED</Badge>;
    if (report.status === 'MATCHED') return <Badge variant="primary">MATCHED</Badge>;
    return <Badge variant="warning">SEARCHING</Badge>;
  };

  if (loading) return <AppLayout><div className="py-24 flex justify-center"><LoadingSpinner /></div></AppLayout>;
  if (!report) return <AppLayout><div className="text-center py-24 text-muted-text">Entry not found</div></AppLayout>;

  const currentUserId = user.id || user._id;
  const reportOwnerId = report.userId?._id || report.userId;
  const isOwner = currentUserId && reportOwnerId && String(currentUserId) === String(reportOwnerId);

  return (
    <AppLayout>
      <div className="mb-10">
        <button
          onClick={() => window.history.back()}
          className="text-primary hover:underline flex items-center text-[12px] font-black uppercase tracking-widest gap-2 mb-8 bg-primary/5 px-4 py-2 rounded-[12px] w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Previous
        </button>

        <PageHeader 
          title={report.itemName}
          subtitle={`Reported on ${formatDate(report.createdAt)}`}
          action={
            <div className="flex items-center gap-4">
              {getStatusBadge()}
              {isOwner && report.status !== 'CLOSED' && (
                <button 
                  onClick={handleCloseReport} 
                  className="btn-success btn-md"
                >
                  Resolve Case
                </button>
              )}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-20">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 !rounded-[16px] border-border/10 shadow-sm bg-surface relative overflow-hidden">
            {report.imageUrl && (
              <div className="mb-8 -mx-8 -mt-8 h-80 overflow-hidden border-b border-border/50">
                <img src={report.imageUrl} alt={report.itemName} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-10 relative z-10">
              <div>
                <label className="text-[10px] font-bold text-muted-text tracking-widest uppercase block mb-1">Category</label>
                <p className="text-h2 text-text font-bold">{report.category}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-text tracking-widest uppercase block mb-1">Date Missing</label>
                <p className="text-h2 text-text font-bold">{new Date(report.dateLost).toLocaleDateString()}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-muted-text tracking-widest uppercase block mb-2">Last Seen At</label>
                <div className="p-3 bg-bg rounded-[12px] border border-border inline-flex items-center gap-2">
                   <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg></div>
                   <p className="text-body text-text font-bold">{report.locationLost}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <label className="text-[10px] font-bold text-muted-text tracking-widest uppercase block mb-3">Item Description</label>
              <div className="bg-bg/40 p-6 rounded-[16px] border border-border/50">
                <p className="text-body text-text leading-relaxed whitespace-pre-wrap font-medium">{report.description}</p>
              </div>
            </div>
            
            {report.contactPhone && (
               <div className="mt-8 p-5 bg-primary/5 rounded-[20px] border border-primary/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[14px] bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Contact Number</label>
                    <p className="text-h2 text-text font-bold">{report.contactPhone}</p>
                  </div>
               </div>
            )}
          </Card>

          <CommentSection itemId={id} itemType="LostItem" />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 !rounded-[16px] border-border/10 shadow-sm overflow-hidden relative bg-surface">
             <h4 className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-6 border-b border-border pb-3">Reported By</h4>
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[16px] bg-primary/10 text-primary flex items-center justify-center font-bold text-h1 uppercase border border-primary/5">
                   {report.userId?.name?.charAt(0) || '?'}
                </div>
                <div>
                   <p className="text-h2 text-text font-bold">{report.userId?.name || 'Anonymous'}</p>
                   <p className="text-[11px] text-primary font-bold uppercase tracking-tight">{report.userId?.role || 'STUDENT'}</p>
                   <p className="text-small text-muted-text font-medium">{report.userId?.block || 'Main Campus'}</p>
                </div>
             </div>
          </Card>

          <Card className="p-6 bg-warning/5 border-warning/10 !rounded-[24px]">
             <h4 className="text-label text-text mb-3 text-warning flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Safety Notice
             </h4>
             <p className="text-small text-muted-text leading-relaxed font-medium font-sans">
                Arrange exchanges in high-traffic campus zones with security present.
             </p>
          </Card>
        </div>
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  );
};

export default ReportDetails;
