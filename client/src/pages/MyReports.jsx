import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import API from '../services/api';
import Toast from '../components/Toast';

const MyReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/api/lost/mine?page=${page}&limit=10`);
      setReports(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseReport = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Mark this item as found and close the report?')) return;
    
    try {
      await API.patch(`/api/lost/${id}/close`);
      setToast({ message: 'Report resolved successfully!', type: 'success' });
      fetchReports(pagination.page);
    } catch (err) {
      setToast({ message: 'Action failed. Try again.', type: 'error' });
    }
  };

  const getVisibilityBadge = (visibility) => {
    if (visibility === 'ADMIN_ONLY') return <Badge variant="warning">Private</Badge>;
    return <Badge variant="primary">Campus</Badge>;
  };

  const getStatusBadge = (report) => {
    if (report.status === 'CLOSED') return <Badge variant="success">Resolved</Badge>;
    if (report.reviewStatus === 'REJECTED') return <Badge variant="danger">Rejected</Badge>;
    if (report.reviewStatus === 'PENDING_REVIEW') return <Badge variant="warning">Under Review</Badge>;
    return <Badge variant="primary">Active</Badge>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading && reports.length === 0) return <AppLayout><div className="py-24 flex justify-center"><LoadingSpinner /></div></AppLayout>;

  return (
    <AppLayout>
      <PageHeader 
        title="My Lost Reports"
        subtitle="Manage your missing item reports and track their status."
        action={
          <button 
            onClick={() => navigate('/report-lost')} 
            className="btn-primary btn-md gap-2 !px-5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Report New Item
          </button>
        }
      />

      {reports.length === 0 && !loading ? (
        <EmptyState
          title="No reports started"
          description="If you've lost something on the AMC campus, create a report to let others know."
        />
      ) : (
        <Card className="overflow-hidden !rounded-[12px] border-border/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-bg border-b border-border">
                <tr>
                  <th className="px-6 py-5 text-label text-muted-text uppercase tracking-widest text-[11px]">Item / Category</th>
                  <th className="px-6 py-5 text-label text-muted-text uppercase tracking-widest text-[11px]">Location</th>
                  <th className="px-6 py-5 text-label text-muted-text uppercase tracking-widest text-[11px]">Visibility</th>
                  <th className="px-6 py-5 text-label text-muted-text uppercase tracking-widest text-[11px]">Status</th>
                  <th className="px-6 py-5 text-label text-muted-text uppercase tracking-widest text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((report) => (
                  <tr 
                    key={report._id}
                    className="hover:bg-primary/5 transition-all cursor-pointer group"
                    onClick={() => navigate(`/reports/${report._id}`)}
                  >
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-body font-bold text-text group-hover:text-primary transition-colors">{report.itemName}</span>
                        <span className="text-small text-muted-text">{report.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-small text-text max-w-[200px] truncate font-medium">{report.locationLost}</span>
                        <span className="text-[12px] text-muted-text">Lost {formatDate(report.dateLost)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      {getVisibilityBadge(report.visibility)}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      {getStatusBadge(report)}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                         {report.status !== 'CLOSED' && (
                           <button 
                             onClick={(e) => handleCloseReport(e, report._id)}
                             className="px-3 py-1.5 rounded-[10px] bg-success/10 text-success text-[11px] font-black uppercase tracking-wider hover:bg-success hover:text-white transition-all shadow-sm"
                           >
                             Close Case
                           </button>
                         )}
                         <button className="w-10 h-10 rounded-[10px] bg-bg flex items-center justify-center text-muted-text hover:text-primary hover:bg-primary/10 transition-all border border-border">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-6 bg-bg border-t border-border flex items-center justify-between">
              <span className="text-small text-muted-text font-semibold">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); fetchReports(pagination.page - 1); }}
                  disabled={pagination.page === 1}
                  className="btn-secondary btn-md"
                >
                  Previous
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); fetchReports(pagination.page + 1); }}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn-secondary btn-md"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  );
};

export default MyReports;
