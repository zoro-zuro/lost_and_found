import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import API from '../services/api';

const FoundItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [foundItem, setFoundItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFoundItem();
  }, [id]);

  const fetchFoundItem = async () => {
    try {
      const res = await API.get(`/api/found/${id}`);
      setFoundItem(res.data.data);
    } catch (err) {
      console.error('Error fetching found item:', err);
      setToast({
        message: 'Failed to load item details',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInterestSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setToast({
        message: 'Please provide a message',
        type: 'warning'
      });
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/api/interests', {
        foundItemId: id,
        message
      });
      
      setToast({
        message: 'Your interest has been recorded! The item owner will contact you.',
        type: 'success'
      });
      setMessage('');
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to record interest',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner text="Loading item details..." size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!foundItem) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Item Not Found</h3>
            <p className="text-gray-600 mb-6">The found item you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/found')}
              className="btn-primary"
            >
              Back to Found Items
            </button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/found')}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Found Items
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Item Details */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{foundItem.itemName}</h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {foundItem.category}
                  </span>
                </div>
                
                {foundItem.imageUrl && (
                  <div className="mb-6">
                    <img
                      src={foundItem.imageUrl}
                      alt={foundItem.itemName}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{foundItem.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Date Found</h3>
                  <p className="text-gray-900">{formatDate(foundItem.dateFound)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Location Found</h3>
                  <p className="text-gray-900">{foundItem.locationFound}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Reported On</h3>
                <p className="text-gray-900">{formatDate(foundItem.createdAt)}</p>
              </div>
            </Card>
          </div>

          {/* Interest Form */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">This Might Be Mine</h2>
              <p className="text-gray-600 text-sm mb-6">
                If you think this found item belongs to you, leave a message for the finder.
              </p>
              
              <form onSubmit={handleInterestSubmit} className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Describe why you think this item is yours and provide any identifying details..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Record Interest'
                  )}
                </button>
              </form>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Important Note</h4>
                <p className="text-sm text-yellow-700">
                  Please provide specific details that prove the item is yours. The finder will review your message and contact you if it matches.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  );
};

export default FoundItemDetails;
