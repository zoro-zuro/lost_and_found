import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import API from '../services/api';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDetails = () => {
    if (!report) return [];

    const timeline = [
      {
        label: 'Submitted',
        status: 'completed',
        date: report.createdAt,
        icon: '✓'
      }
    ];

    if (report.reviewStatus === 'PENDING_REVIEW') {
      timeline.push({
        label: 'Under Review',
        status: 'current',
        icon: '⏳'
      });
      timeline.push({
        label: 'Approved',
        status: 'pending',
        icon: '○'
      });
    } else if (report.reviewStatus === 'APPROVED') {
      timeline.push({
        label: 'Approved',
        status: 'completed',
        date: report.updatedAt,
        icon: '✓'
      });
    } else if (report.reviewStatus === 'REJECTED') {
      timeline.push({
        label: 'Rejected',
        status: 'rejected',
        date: report.updatedAt,
        icon: '✕'
      });
      return timeline;
    }

    if (report.publishStatus === 'PUBLISHED' && report.visibility === 'CAMPUS') {
      timeline.push({
        label: 'Published',
        status: 'completed',
        date: report.updatedAt,
        icon: '✓'
      });
    } else if (report.reviewStatus === 'APPROVED' && report.publishStatus === 'DRAFT') {
      timeline.push({
        label: 'Ready to Publish',
        status: 'pending',
        icon: '○'
      });
    }

    return timeline;
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinner />
      </AppLayout>
    );
  }

  if (!report) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Report not found</p>
          <button onClick={() => navigate('/reports')} className="btn-primary mt-4">
            Back to Reports
          </button>
        </div>
      </AppLayout>
    );
  }

  const timeline = getStatusDetails();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/reports')}
            className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Reports
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Details</h1>
        </div>

        {/* Timeline */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Status Timeline</h2>
          <div className="relative">
            {timeline.map((step, index) => (
              <div key={index} className="flex items-start mb-8 last:mb-0 relative">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.status === 'completed' ? 'bg-green-100 text-green-600' :
                  step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                  step.status === 'rejected' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step.icon}
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium ${
                    step.status === 'completed' || step.status === 'current' ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs text-gray-500 mt-1">{formatDate(step.date)}</p>
                  )}
                </div>
                {index < timeline.length - 1 && (
                  <div className={`absolute left-5 top-10 w-0.5 h-8 ${
                    step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                  }`} style={{ transform: 'translateX(-50%)' }} />
                )}
              </div>
            ))}
          </div>
          
          {report.adminNote && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font medium text-gray-700 mb-2">Admin Note:</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{report.adminNote}</p>
            </div>
          )}
        </Card>

        {/* Item Details */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Item Name</label>
              <p className="text-gray-900 mt-1">{report.itemName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <p className="text-gray-900 mt-1">{report.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date Lost</label>
              <p className="text-gray-900 mt-1">{new Date(report.dateLost).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location Lost</label>
              <p className="text-gray-900 mt-1">{report.locationLost}</p>
            </div>
            {report.color && (
              <div>
                <label className="text-sm font-medium text-gray-500">Color</label>
                <p className="text-gray-900 mt-1">{report.color}</p>
              </div>
            )}
            {report.brand && (
              <div>
                <label className="text-sm font-medium text-gray-500">Brand</label>
                <p className="text-gray-900 mt-1">{report.brand}</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900 mt-2 whitespace-pre-wrap">{report.description}</p>
          </div>

          {report.uniqueMark && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500">Unique Markings</label>
              <p className="text-gray-900 mt-2 whitespace-pre-wrap">{report.uniqueMark}</p>
            </div>
          )}
        </Card>

        {/* Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Visibility</p>
                <p className="text-xs text-gray-500">Who can see this report</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                report.visibility === 'CAMPUS' ? 'bg-cyan-100 text-cyan-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {report.visibility === 'CAMPUS' ? 'Campus Wide' : 'Admin Only'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Notification Requested</p>
                <p className="text-xs text-gray-500">Email notification when found</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                report.notifyRequested ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {report.notifyRequested ? 'Yes' : 'No'}
              </span>
            </div>

            {report.contactPhone && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Contact Phone</p>
                  <p className="text-xs text-gray-500">For verification</p>
                </div>
                <span className="text-sm text-gray-900">{report.contactPhone}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReportDetails;
