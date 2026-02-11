import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import API from '../services/api';
import Toast from '../components/Toast';
import ProfileSkeleton from '../components/ProfileSkeleton';


const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registrationNumber: '',
    block: '',
    department: '',
    phone: '',
    altPhone: '',
    emailNotificationsEnabled: true,
    notifyScope: 'all'
  });
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/auth/me');
      const userData = response.data.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        registrationNumber: userData.registerNumber || '',
        block: userData.block || '',
        department: userData.department || '',
        phone: userData.phone || '',
        altPhone: userData.altPhone || '',
        emailNotificationsEnabled: userData.emailNotificationsEnabled ?? true,
        notifyScope: userData.notifyScope || 'all'
      });
    } catch (error) {
      // Don't reset user state on rate limiting (429) errors
      if (error.response?.status === 401) {
        console.error('Error fetching user profile:', error);
        setToast({ message: 'Failed to load profile data', type: 'error' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.response?.status !== 429) {
        console.error('Error fetching user profile:', error);
        setToast({ message: 'Failed to load profile data', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setHasChanges(true);
  };

  const handleLogout = async () => {
    try {
      await API.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;

    try {
      setSaving(true);
      
      // Send only the fields server expects
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        altPhone: formData.altPhone,
        block: formData.block,
        department: formData.department,
        emailNotificationsEnabled: formData.emailNotificationsEnabled,
        notifyScope: formData.notifyScope
      };
      
      const response = await API.put('/api/users/me', updateData);
      
      // Update user state with the actual updated data from server response
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      
      // Update localStorage with the fresh user data
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setToast({ message: 'Profile updated successfully!', type: 'success' });
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Check for verification token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verificationToken = urlParams.get('verify');
    if (verificationToken) {
      handleVerifyEmail(verificationToken);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleVerifyEmail = async (token) => {
    try {
      const response = await API.post('/api/auth/verify-email', { token });
      setToast({ 
        message: 'Email verified successfully! Your verification badge is now active.', 
        type: 'success' 
      });
      // Refresh user data to get updated verification status
      await fetchUserProfile();
    } catch (error) {
      console.error('Error verifying email:', error);
      setToast({ 
        message: 'Invalid or expired verification link. Please request a new one.', 
        type: 'error' 
      });
    }
  };

  const getInitials = (name) => {
    return (name || 'U')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <>

      {/* Main Container (unchanged wrapper) */}
      <div className="w-full max-w-[1140px] mx-auto glass-panel rounded-t-[40px] flex flex-col overflow-hidden relative mt-5 pb-16 md:pb-6">
        {/* Header Section */}
        <div className="px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8 pb-4 md:pb-6 border-b border-white/40">
          <div className="flex items-start md:items-center gap-4 md:gap-6">
            {/* Avatar + badge */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-[24px] md:rounded-2xl bg-indigo-100 flex items-center justify-center shadow-md border-4 border-white">
                <span className="text-lg md:text-xl lg:text-2xl font-bold text-indigo-600">
                  {getInitials(formData.name)}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 md:p-2 rounded-full shadow-md leading-[0.7] ${
                user?.emailVerified 
                  ? 'bg-green-500 text-white' 
                  : 'bg-yellow-500 text-white'
              }`
              
              }>
                <span className="material-symbols-rounded text-xs md:text-sm scale-75 md:scale-100">
                  {user?.emailVerified ? 'verified' : 'block'}
                </span>
              </div>
            </div>

            {/* Name + status */}
            <div className="flex-1 flex flex-col items-start md:items-center gap-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2">
                <div>
                  <h1 className="text-xl md:text-xl lg:text-2xl font-bold text-slate-900">
                    {formData.name || 'Your Name'}
                  </h1>
                  <p className="text-sm md:text-sm text-slate-500 mt-1">
                    {formData.email || 'Your college email'}
                  </p>
                </div>

                <div className="hidden md:flex justify-center md:justify-end">
                  <div className={`inline-flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full text-sm md:text-sm font-semibold border uppercase tracking-wide ${
                    user?.emailVerified
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    <span className="material-symbols-rounded text-sm md:text-sm">
                      {user?.emailVerified ? 'verified' : 'pending'}
                    </span>
                    <span className="hidden md:inline">{user?.emailVerified ? 'Verified Student' : 'Unverified'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save button - Desktop: in header, Mobile: at bottom of form */}
            <div className="hidden md:flex w-full md:w-auto justify-end md:justify-end mt-4 md:mt-0">
              <button
                id="save-btn"
                type="submit"
                disabled={!hasChanges || saving}
                onClick={handleSave}
                className={`px-4 md:px-6 lg:px-7 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all whitespace-nowrap ${
                  hasChanges && !saving
                    ? 'bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-200/40 hover:scale-[1.02] hover:bg-indigo-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8">
          <form onSubmit={handleSave} className="space-y-6 md:space-y-7 lg:space-y-8 max-w-3xl mx-auto">
            {/* Personal Information */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg lg:text-xl font-bold text-slate-900">
                  Personal Information
                </h2>
                <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">
                  Basic details
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Full Name */}
                <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 flex flex-col gap-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 flex flex-col gap-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-2.5 text-slate-500 font-medium outline-none cursor-not-allowed"
                    placeholder="Enter email address"
                    disabled
                  />
                </div>

                {/* Reg No */}
                <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 flex flex-col gap-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Enter Reg No."
                  />
                </div>

                {/* Block / Hall */}
                <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 flex flex-col gap-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Block / Hall
                  </label>
                  <input
                    type="text"
                    name="block"
                    value={formData.block}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Enter Residence"
                  />
                </div>

                {/* Department */}
                <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 flex flex-col gap-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Enter Department"
                  />
                </div>

                {/* Phone */}
                <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 flex flex-col gap-1.5">
                  <label className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg lg:text-xl font-bold text-slate-900">
                  Notification Settings
                </h2>
                <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider">
                  Stay updated
                </span>
              </div>

              <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 flex flex-col gap-3 md:gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-sm md:text-base font-semibold text-slate-800">
                      Email Notifications
                    </label>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                      Receive email updates about your lost and found reports.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      name="emailNotificationsEnabled"
                      checked={formData.emailNotificationsEnabled}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </form>

          {/* Save button - Mobile only, at bottom of form */}
          <div className="flex md:hidden justify-center mt-6 mb-4">
            <button
              id="save-btn-mobile"
              type="submit"
              disabled={!hasChanges || saving}
              onClick={handleSave}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap w-full max-w-xs ${
                hasChanges && !saving
                  ? 'bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-200/40 hover:scale-[1.02] hover:bg-indigo-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
};

export default Profile;
