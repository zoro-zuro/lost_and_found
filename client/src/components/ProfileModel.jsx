import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileModel = ({ isOpen, user, onClose, isDropdown = false }) => {
  const navigate = useNavigate();
  
  const initials = (user?.name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const handleManageAccount = () => {
    // Navigate to profile page
    navigate('/profile');
    onClose();
  };

  const handleSignOut = async () => {
    try {
      // Try to use the API logout if available
      const API = (await import('../services/api')).default;
      await API.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  if (!isOpen) return null;

  // Dropdown version - using the exact inline dropdown structure
  if (isDropdown) {
    return (
      <div className="absolute left-0 md:right-0 md:left-auto top-full w-[280px] pt-1 origin-top-left md:origin-top-right">
        <div className="bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
          {/* User Info Section */}
          <div className="p-5 flex items-center gap-4 bg-gradient-to-r from-indigo-50/10 to-indigo-50">
            <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-[16px] font-bold relative border-2 border-[#fff]">
              {initials?.slice(0, 1) || "U"}
              {/* Verification Status Icon */}
              {!user?.emailVerified ? (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="material-symbols-rounded text-white text-xs">block</span>
                </div>
              ) : (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="material-symbols-rounded text-white text-xs">verified</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold text-slate-900 truncate">{user?.name}</div>
              <div className="text-[12px] text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100 mx-4" />

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={handleManageAccount}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-[1rem] text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors group"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Manage account
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-[1rem] text-[14px] font-semibold text-red-600 hover:bg-red-50 transition-colors group"
            >
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Original modal version
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="w-[300px] bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 px-4 md:px-6 pt-6 md:pt-8 pb-5 md:pb-7 border-b border-white/50">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg shadow-indigo-200/50 border-2 border-white/50 flex-shrink-0">
                {initials?.slice(0, 1) || "T"}
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="font-bold text-slate-800 text-base md:text-lg tracking-tight leading-tight truncate">
                  {user?.name || "User"}
                </h4>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {user?.email || "user@college.edu"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="p-2 md:p-3 bg-white/30">
            <div className="space-y-1 md:space-y-2">
              <button 
                onClick={handleManageAccount}
                className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-2xl hover:bg-white/70 transition-all duration-300 group"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/60 shadow-sm border border-white/70 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-700 text-xs md:text-sm">Manage account</span>
              </button>
              
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-2xl hover:bg-red-50 transition-all duration-300 group"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-red-100 shadow-sm border border-red-200 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
                  </svg>
                </div>
                <span className="font-semibold text-red-600 text-xs md:text-sm">Sign out</span>
              </button>
            </div>
          </div>
          
          {/* Handle */}
          <div className="pb-2 md:pb-3 pt-1">
            <div className="h-1 w-8 md:w-10 bg-slate-200/50 mx-auto rounded-full"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileModel;