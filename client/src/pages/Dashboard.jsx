import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import LostFeed from './LostFeed';
import API from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [recentLostItems, setRecentLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchRecentLostItems();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await API.get('/api/auth/me');
      setUser(res.data.data.user);
    } catch (err) {
      setError('Failed to fetch user data');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentLostItems = async () => {
    try {
      const res = await API.get('/api/lost/mine?limit=5');
      setRecentLostItems(res.data.data);
    } catch (err) {
      console.error('Error fetching recent lost items:', err);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'OPEN': return 'warning';
      case 'MATCHED': return 'primary';
      case 'CLOSED': return 'success';
      default: return 'neutral';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (loading && !user) return <AppLayout><div className="flex justify-center items-center py-24"><LoadingSpinner /></div></AppLayout>;

  if (error) return (
    <AppLayout>
      <Card className="p-12 max-w-md mx-auto text-center !rounded-[32px] border-danger/10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-danger/10 text-danger rounded-[20px] mb-6"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
        <h3 className="text-h2 text-text mb-2 font-bold">Authentication Refused</h3>
        <p className="text-body text-muted-text mb-8">{error}</p>
        <button onClick={() => navigate('/login')} className="btn-primary btn-lg w-full">Back to Login</button>
      </Card>
    </AppLayout>
  );

  return (
    <AppLayout>
      <PageHeader 
        title={`Welcome, ${user?.name}`}
        subtitle={user?.role === 'STUDENT' ? `Institutional Rank: Student • ${user?.block}` : `Institutional Rank: Staff Member`}
      />

      <div className="flex bg-surface/50 backdrop-blur-sm p-1.5 rounded-[12px] border border-border w-fit mb-10 overflow-hidden">
        {['overview', 'help-others'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 h-10 rounded-[8px] text-label font-bold transition-all uppercase tracking-wide ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-muted-text hover:text-text'}`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-12 animate-fade-in">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/report-lost" className="group">
              <Card className="p-8 text-center !rounded-[16px] border-border/10 shadow-sm bg-surface transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-danger/10 text-danger rounded-[12px] mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                <h3 className="text-h1 text-text mb-1 font-bold">Report Lost</h3>
                <p className="text-small text-muted-text max-w-[240px] mx-auto">Register your missing items in the portal.</p>
              </Card>
            </Link>

            <Link to="/found" className="group">
              <Card className="p-8 text-center !rounded-[16px] border-border/10 shadow-sm bg-surface transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 text-success rounded-[12px] mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                <h3 className="text-h1 text-text mb-1 font-bold">Browse Gallery</h3>
                <p className="text-small text-muted-text max-w-[240px] mx-auto">Explore all items turned in by others.</p>
              </Card>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-end border-b border-border pb-3">
                <h2 className="text-h1 text-text uppercase tracking-tight font-bold">Active Reports</h2>
                <Link to="/reports" className="text-small text-primary font-bold hover:underline">History →</Link>
              </div>

              {recentLostItems.length === 0 ? (
                <EmptyState title="No Active Reports" description="You have no current missing items in the system." />
              ) : (
                <div className="grid gap-3">
                  {recentLostItems.map((item) => (
                    <Card key={item._id} className="p-5 flex justify-between items-center bg-surface !rounded-[12px] border-border/10 shadow-sm transition-all">
                      <div>
                        <h4 className="text-body text-text font-bold">{item.itemName}</h4>
                        <p className="text-[11px] text-muted-text font-medium uppercase tracking-tight opacity-60">{item.category} • {item.locationLost}</p>
                      </div>
                      <Badge variant={getStatusVariant(item.status)} className="scale-90">{item.status}</Badge>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-h1 text-text uppercase tracking-tight font-bold">Safety Tips</h2>
              <Card className="p-6 bg-primary/5 border-primary/10 !rounded-[16px] space-y-5">
                {[
                  "Detailed descriptions speed up matching.",
                  "Check daily for institutional findings.",
                  "Report to Security for high-value items.",
                  "Privacy is preserved until match found."
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                    <p className="text-small text-muted-text font-medium leading-relaxed">{tip}</p>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-8">
           <div className="bg-primary/5 p-6 rounded-[16px] border border-primary/10">
              <h2 className="text-h1 text-text mb-1 font-bold">Campus Watch</h2>
              <p className="text-body text-muted-text">Recent missing items in <span className="text-primary font-bold">{user?.block || 'your vicinity'}</span>.</p>
           </div>
           <LostFeed embedded defaultScope="block" />
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
