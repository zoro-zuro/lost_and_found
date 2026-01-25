import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import Input from '../components/Input';
import Select from '../components/Select';
import TextArea from '../components/TextArea';
import PageHeader from '../components/PageHeader';
import API from '../services/api';
import Toast from '../components/Toast';
import UserDetailModal from '../components/UserDetailModal';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lostItems, setLostItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [toast, setToast] = useState(null);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [foundForm, setFoundForm] = useState({
    itemName: '', category: '', dateFound: '', locationFound: '', description: ''
  });

  const categories = [
    { value: 'ID Card', label: 'ID Card' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Wallet', label: 'Wallet' },
    { value: 'Bag', label: 'Bag' },
    { value: 'Keys', label: 'Keys' },
    { value: 'Book', label: 'Book' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Other', label: 'Other' }
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') fetchLostItems();
    if (activeTab === 'claims') fetchClaims();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await API.get('/api/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      if (err.response?.status === 403) navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchLostItems = async () => {
    try {
      const res = await API.get('/api/admin/lost?limit=50');
      setLostItems(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchClaims = async () => {
    try {
      const res = await API.get('/api/admin/claims?limit=50');
      setClaims(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleUpdateReport = async (id, statusData) => {
    try {
      await API.patch(`/api/admin/lost/${id}`, statusData);
      setToast({ message: 'Report updated', type: 'success' });
      fetchLostItems();
    } catch (err) { setToast({ message: 'Failed to update', type: 'error' }); }
  };

  const handleUpdateClaim = async (id, status, instructions = '') => {
    try {
      await API.patch(`/api/admin/claims/${id}`, { status, pickupInstructions: instructions });
      setToast({ message: 'Claim updated', type: 'success' });
      fetchClaims();
    } catch (err) { setToast({ message: 'Failed to update', type: 'error' }); }
  };

  const handleFoundSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/admin/found', foundForm);
      setToast({ message: 'Found item created', type: 'success' });
      setFoundForm({ itemName: '', category: '', dateFound: '', locationFound: '', description: '' });
    } catch (err) { setToast({ message: 'Failed to create item', type: 'error' }); }
  };

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    try {
      const res = await API.post('/api/debug/send-test-email');
      setToast({ message: res.data.message || 'Test email sent!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to send test email.', type: 'error' });
    } finally {
      setTestEmailLoading(false);
    }
  };

  if (loading) return <AppLayout><div className="py-24 flex justify-center"><LoadingSpinner /></div></AppLayout>;

  return (
    <AppLayout>
      <PageHeader title="Admin Portal" subtitle="System oversight and community management." />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-fade-in">
        {[
          { label: 'Total Lost', val: stats?.totalLost, color: 'bg-blue-50 text-blue-600 border-blue-100' },
          { label: 'Total Found', val: stats?.totalFound, color: 'bg-green-50 text-green-600 border-green-100' },
          { label: 'Pending Claims', val: stats?.pendingClaims, color: 'bg-purple-50 text-purple-600 border-purple-100' },
          { label: 'Pending Reviews', val: stats?.pendingLostReviews, color: 'bg-orange-50 text-orange-600 border-orange-100' }
        ].map((s, i) => (
          <Card key={i} className={`p-6 !rounded-[16px] border uppercase tracking-widest ${s.color}`}>
            <p className="text-[10px] font-bold opacity-70 mb-1">{s.label}</p>
            <p className="text-h2 font-bold">{s.val || 0}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
        {['overview', 'reports', 'claims', 'add-found', 'system'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 h-11 rounded-[12px] text-[11px] font-bold transition-all whitespace-nowrap uppercase tracking-widest ${
              activeTab === tab ? 'bg-primary text-white shadow-sm' : 'bg-surface text-muted-text hover:bg-primary/5 hover:text-primary border border-border/50'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <Card className="p-10 !rounded-[16px] border-border/10 shadow-sm text-center bg-surface">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-[12px] flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h2 className="text-h1 text-text mb-2 font-bold">Admin Controls</h2>
            <p className="text-body text-muted-text max-w-lg mx-auto">Manage reports and verify community feedback.</p>
          </Card>
        )}

        {activeTab === 'reports' && (
          <div className="grid gap-4">
            {lostItems.map(item => (
              <Card key={item._id} className="p-5 !rounded-[16px] border-border/10 shadow-sm transition-all bg-surface">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-body text-text font-bold">{item.itemName}</h3> 
                    <p className="text-[11px] text-muted-text font-semibold uppercase tracking-tight">{item.userId?.name} • {item.visibility}</p>
                  </div>
                  <div className="flex gap-2">
                    {item.reviewStatus === 'PENDING_REVIEW' && (
                      <>
                        <button onClick={() => handleUpdateReport(item._id, { reviewStatus: 'APPROVED', publishStatus: 'PUBLISHED' })} className="px-4 h-9 bg-success text-white text-[11px] font-bold rounded-[8px]">APPROVE</button>
                        <button onClick={() => handleUpdateReport(item._id, { reviewStatus: 'REJECTED' })} className="px-4 h-9 bg-danger/10 text-danger text-[11px] font-bold rounded-[8px]">REJECT</button>
                      </>
                    )}
                    {item.status === 'OPEN' && (
                      <button onClick={() => handleUpdateReport(item._id, { status: 'CLOSED' })} className="px-4 h-9 bg-bg text-text text-[11px] font-bold rounded-[8px] border border-border">CLOSE CASE</button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'claims' && (
           <div className="grid gap-4">
             {claims.map(claim => (
               <Card key={claim._id} className="p-6 !rounded-[16px] border-border/10 shadow-sm bg-surface">
                 <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                   <div className="flex-1 space-y-4">
                      <div className="inline-block px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Claim ID: {claim._id.slice(-8)}</div>
                      <h3 className="text-h2 text-text font-bold">Item: {claim.foundItemId?.itemName}</h3>
                      <button onClick={() => { setSelectedUserId(claim.userId?._id); setIsModalOpen(true); }} className="text-small text-primary font-bold hover:underline block">Claimed by {claim.userId?.name}</button>
                      <div className="p-3 bg-bg rounded-[12px] border border-border">
                        <p className="text-small text-text italic">"{claim.message}"</p>
                      </div>
                   </div>
                   {claim.status === 'PENDING' && (
                     <div className="flex flex-col gap-2 w-full md:w-auto">
                       <button onClick={() => { const inst = prompt('Instructions:'); if (inst) handleUpdateClaim(claim._id, 'APPROVED', inst); }} className="btn-primary h-10 md:w-40 font-bold !rounded-[8px]">APPROVE</button>
                       <button onClick={() => handleUpdateClaim(claim._id, 'REJECTED')} className="bg-danger/10 text-danger h-10 md:w-40 font-bold rounded-[8px]">REJECT</button>
                     </div>
                   )}
                 </div>
               </Card>
             ))}
           </div>
        )}

        {activeTab === 'add-found' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleFoundSubmit}>
              <Card className="p-8 space-y-6 !rounded-[16px] border-border/10 shadow-sm bg-surface">
                 <h2 className="text-h1 text-text font-bold border-b border-border pb-4">Direct Register</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Item Name" placeholder="Asset Name" value={foundForm.itemName} onChange={e => setFoundForm({...foundForm, itemName: e.target.value})} required />
                    <Select label="Category" options={categories} value={foundForm.category} onChange={val => setFoundForm({...foundForm, category: val.target.value})} required />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Date Found" type="date" value={foundForm.dateFound} onChange={e => setFoundForm({...foundForm, dateFound: e.target.value})} required />
                    <Input label="Location Found" placeholder="Discovery Site" value={foundForm.locationFound} onChange={e => setFoundForm({...foundForm, locationFound: e.target.value})} required />
                 </div>
                 <TextArea label="Description" placeholder="Description..." value={foundForm.description} onChange={e => setFoundForm({...foundForm, description: e.target.value})} required rows={4} />
                 <button className="w-full btn-primary btn-md !h-12">Create Record</button>
              </Card>
            </form>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-8 !rounded-[16px] border-border/10 shadow-sm bg-surface">
              <h2 className="text-h1 text-text mb-2 font-bold">Mail System</h2>
              <p className="text-small text-muted-text mb-6">Test the SMTP layer.</p>
              <button
                onClick={handleSendTestEmail}
                disabled={testEmailLoading}
                className="w-full btn-primary h-11 flex justify-center items-center rounded-[8px]"
              >
                {testEmailLoading ? <LoadingSpinner size="sm" color="white" /> : 'Ping Mailer'}
              </button>
            </Card>

            <Card className="p-8 !rounded-[16px] border-border/10 bg-bg">
              <h2 className="text-h1 text-text mb-4 font-bold">Environment</h2>
              <div className="space-y-4">
                {[
                  { label: 'Notification', val: 'Gmail', status: 'Healthy' },
                  { label: 'Database', val: 'MongoDB', status: 'Active' },
                  { label: 'Auth', val: 'JWT', status: 'Locked' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-surface rounded-[12px] border border-border/40">
                    <div>
                      <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest">{item.label}</p>
                      <p className="text-[12px] font-bold text-text">{item.val}</p>
                    </div>
                    <div className="px-2 py-0.5 bg-success/10 text-success text-[9px] font-bold rounded uppercase">{item.status}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <UserDetailModal userId={selectedUserId} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppLayout>
  );
};

export default AdminDashboard;
