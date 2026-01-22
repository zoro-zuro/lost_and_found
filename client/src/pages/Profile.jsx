import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import API from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    altPhone: '',
    block: '',
    department: ''
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await API.get('/api/auth/me');
      const userData = res.data.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        altPhone: userData.altPhone || '',
        block: userData.block || '',
        department: userData.department || ''
      });
    } catch (err) {
      setToast({
        message: 'Failed to load profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.phone && formData.phone.trim().length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    if (formData.altPhone && formData.altPhone.trim().length < 10) {
      newErrors.altPhone = 'Alternate phone must be at least 10 digits';
    }

    if (user?.role === 'STUDENT') {
      if (!formData.block || !formData.block.trim()) {
        newErrors.block = 'Block is required for students';
      }
      if (!formData.department || !formData.department.trim()) {
        newErrors.department = 'Department is required for students';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const res = await API.put('/api/users/me', formData);
      
      // Update localStorage
      const updatedUser = res.data.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setToast({
        message: 'Profile updated successfully!',
        type: 'success'
      });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinner />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and contact details</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Role:</span>
                <p className="font-medium text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.role === 'STUDENT' ? 'bg-blue-100 text-blue-800' :
                    user?.role === 'STAFF' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user?.role}
                  </span>
                </p>
              </div>
              {user?.registerNumber && (
                <div>
                  <span className="text-gray-500">Register Number:</span>
                  <p className="font-medium text-gray-900">{user.registerNumber}</p>
                </div>
              )}
              {user?.staffId && (
                <div>
                  <span className="text-gray-500">Staff ID:</span>
                  <p className="font-medium text-gray-900">{user.staffId}</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="John Doe"
                required
                error={errors.name}
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={onChange}
                placeholder="+91 98765 43210"
                error={errors.phone}
              />
            </div>

            <Input
              label="Alternate Phone"
              name="altPhone"
              type="tel"
              value={formData.altPhone}
              onChange={onChange}
              placeholder="+91 98765 43210"
              error={errors.altPhone}
            />

            {user?.role === 'STUDENT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Block / Hall"
                  name="block"
                  value={formData.block}
                  onChange={onChange}
                  placeholder="e.g., Washburn Hall"
                  required
                  error={errors.block}
                />

                <Input
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={onChange}
                  placeholder="e.g., Computer Science"
                  required
                  error={errors.department}
                />
              </div>
            )}

            {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
              <Input
                label="Department (Optional)"
                name="department"
                value={formData.department}
                onChange={onChange}
                placeholder="e.g., Administration"
                error={errors.department}
              />
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Important: Contact Details</p>
                  <p className="mt-1">Your phone number will be shared with users who find your lost items so they can contact you for verification and return.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
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

export default Profile;
