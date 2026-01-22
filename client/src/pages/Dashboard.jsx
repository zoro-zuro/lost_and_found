import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import API from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [recentLostItems, setRecentLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'MATCHED':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading your dashboard..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary"
            >
              Back to Login
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xl text-gray-600">
            Register Number: {user?.registerNumber}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hover className="p-6 text-center cursor-pointer group">
            <Link to="/lost/report" className="block">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 group-hover:bg-red-200 transition-colors">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Lost Item</h3>
              <p className="text-gray-600">Report an item you've lost</p>
            </Link>
          </Card>

          <Card hover className="p-6 text-center cursor-pointer group">
            <Link to="/found" className="block">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse Found Items</h3>
              <p className="text-gray-600">Search through found items</p>
            </Link>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Lost Items */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Recent Lost Items</h2>
                <Link
                  to="/lost/report"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Report New
                </Link>
              </div>

              {recentLostItems.length === 0 ? (
                <EmptyState
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  title="No Lost Items Reported"
                  description="You haven't reported any lost items yet."
                  action={
                    <Link to="/lost/report" className="btn-primary">
                      Report Your First Item
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {recentLostItems.map((item) => (
                    <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.itemName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Lost: {formatDate(item.dateLost)}</span>
                            <span>Location: {item.locationLost}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Tips Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Good Reports</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-primary-600 mr-2 mt-1">•</span>
                  <p className="text-sm text-gray-600">Be specific about brand, model, and color</p>
                </div>
                <div className="flex items-start">
                  <span className="text-primary-600 mr-2 mt-1">•</span>
                  <p className="text-sm text-gray-600">Include unique markings or damage</p>
                </div>
                <div className="flex items-start">
                  <span className="text-primary-600 mr-2 mt-1">•</span>
                  <p className="text-sm text-gray-600">Provide exact date and location</p>
                </div>
                <div className="flex items-start">
                  <span className="text-primary-600 mr-2 mt-1">•</span>
                  <p className="text-sm text-gray-600">Add contact information for faster response</p>
                </div>
                <div className="flex items-start">
                  <span className="text-primary-600 mr-2 mt-1">•</span>
                  <p className="text-sm text-gray-600">Check back regularly for matches</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
