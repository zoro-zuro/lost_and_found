import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { isUserVerified } from '../utils/verification';
import VerificationPrompt from './VerificationPrompt';

const UserDetailsOverlay = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user
    const userData = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(userData);
    
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      
      // Check if current user is verified
      if (!isUserVerified(currentUser)) {
        setShowVerificationPrompt(true);
        setLoading(false);
        return;
      }
      
      const response = await API.get(`/api/users/${userId}/profile`);
      console.log('User details response:', response.data.data); // Debug log
      setUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUser(null);
    } finally {
      setLoading(false);
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

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white/60 backdrop-blur-lg rounded-2xl border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-400/90 to-indigo-600/90 p-5 border-b border-white/30">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-105 z-50 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-rounded text-white text-sm">close</span>
          </button>
          
          {/* Header decorative orb */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-sm scale-110" />
              <div className="relative w-14 h-14 rounded-full bg-white/30 flex items-center justify-center border-2 border-white/40">
                <span className="text-xl font-bold text-white">
                  {loading ? '...' : getInitials(user?.name)}
                </span>
              </div>
              {/* Verified Badge */}
              {!loading && user && (
                !user.emailVerified ? (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="material-symbols-rounded text-white text-xs">block</span>
                  </div>
                ) : (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="material-symbols-rounded text-white text-xs">verified</span>
                  </div>
                )
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {loading ? 'Loading...' : user?.name || 'Unknown User'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {!loading && user && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    user.emailVerified 
                      ? 'bg-green-500/20' 
                      : 'bg-yellow-500/20'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      user.emailVerified ? 'bg-green-500' : 'bg-yellow-500'
                    } animate-pulse`} />
                    <span className={`text-xs font-medium ${
                      user.emailVerified ? 'text-green-100' : 'text-yellow-100'
                    }`}>
                      {user.emailVerified 
                        ? (user?.role === 'ADMIN' ? 'Verified Admin' : 'Verified Member')
                        : (user?.role === 'ADMIN' ? 'Admin - Pending' : 'Member - Pending')
                      }
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4A6CF7]/10 to-[#8B5CF6]/10 rounded-full flex items-center justify-center mb-3">
                <div className="w-5 h-5 border-3 border-[#4A6CF7] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-600 text-sm font-medium">Loading user details...</p>
            </div>
          ) : user ? (
            <div className="space-y-3">
              {/* Contact Information */}
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                <h3 className="text-slate-800 font-semibold mb-2 flex items-center gap-2">
                  <span className="material-symbols-rounded text-[#7C3AED] text-sm">person</span>
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-slate-400 text-sm">email</span>
                    <span className="text-slate-700 text-sm">{user.email || 'Not provided'}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-slate-400 text-sm">phone</span>
                      <span className="text-slate-700 text-sm">{user.phone}</span>
                    </div>
                  )}
                  {user.altPhone && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-slate-400 text-sm">phone_in_talk</span>
                      <span className="text-slate-700 text-sm">{user.altPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                <h3 className="text-slate-800 font-semibold mb-2 flex items-center gap-2">
                  <span className="material-symbols-rounded text-[#EA580C] text-sm">school</span>
                  Academic Information
                </h3>
                <div className="space-y-2">
                  {user.institutionalId && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-slate-400 text-sm">badge</span>
                      <span className="text-slate-700 text-sm">ID: {user.institutionalId}</span>
                    </div>
                  )}
                  {user.department && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-slate-400 text-sm">business</span>
                      <span className="text-slate-700 text-sm">{user.department}</span>
                    </div>
                  )}
                  {user.block && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-slate-400 text-sm">location_city</span>
                      <span className="text-slate-700 text-sm">{user.block}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-rounded text-xl text-slate-400">person_off</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">User details not available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Verification Prompt */}
      {showVerificationPrompt && (
        <VerificationPrompt
          message="Please verify your email address to view user details and contact information."
          onClose={() => setShowVerificationPrompt(false)}
        />
      )}
    </div>
  );
};

export default UserDetailsOverlay;