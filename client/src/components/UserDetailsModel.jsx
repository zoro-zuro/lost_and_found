import React from 'react';

const UserDetailsModal = ({ isOpen, user, onClose }) => {
  if (!isOpen) return null;

  const initials = (user?.name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main Card */}
          <div className="relative bg-white/60 backdrop-blur-xl rounded-[32px] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
            
            {/* Decorative Gradient Orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#FFD6C9]/60 to-[#FFD6C9]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-[#C9FFE5]/60 to-[#C9FFE5]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-[#E0D7FF]/40 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            {/* Content */}
            <div className="relative p-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-slate-200/50 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md group"
              >
                <span className="material-symbols-rounded text-slate-500 group-hover:text-slate-700 text-lg">close</span>
              </button>

              {/* Profile Header */}
              <div className="flex flex-col items-center mb-8 pt-2">
                {/* Avatar with Ring */}
                <div className="relative mb-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4A6CF7] to-[#8B5CF6] rounded-[24px] blur-sm opacity-30 scale-105" />
                  <div className="relative w-24 h-24 bg-white rounded-[24px] shadow-lg flex items-center justify-center overflow-hidden border-2 border-white">
                    <div className="w-full h-full bg-gradient-to-br from-[#4A6CF7]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                      <span className="text-4xl font-bold bg-gradient-to-br from-[#4A6CF7] to-[#8B5CF6] bg-clip-text text-transparent">
                        {initials || "U"}
                      </span>
                    </div>
                  </div>
                  {/* Verified Badge */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-[#4A6CF7] to-[#8B5CF6] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    <span className="material-symbols-rounded text-white text-sm">verified</span>
                  </div>
                </div>
                
                {/* Name */}
                <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
                  {user?.name || "User Name"}
                </h2>
                
                {/* Role Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#4A6CF7]/10 to-[#8B5CF6]/10 rounded-full border border-[#4A6CF7]/20">
                  <span className="w-2 h-2 rounded-full bg-[#4A6CF7] animate-pulse" />
                  <span className="text-xs font-semibold text-[#4A6CF7] tracking-wide uppercase">
                    {user?.role === "ADMIN" ? "Administrator" : "Verified Member"}
                  </span>
                </div>
              </div>

              {/* Info Cards Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Department Card */}
                <div className="group bg-white/70 hover:bg-white rounded-2xl p-5 border border-slate-200/50 hover:border-[#4A6CF7]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#4A6CF7]/5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD6C9] to-[#FFD6C9]/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-rounded text-[#EA580C] text-xl">school</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Department</span>
                  <span className="text-base font-bold text-slate-800">
                    {user?.department || "Bsc.IT"}
                  </span>
                </div>

                {/* Block Card */}
                <div className="group bg-white/70 hover:bg-white rounded-2xl p-5 border border-slate-200/50 hover:border-[#4A6CF7]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#4A6CF7]/5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9FFE5] to-[#C9FFE5]/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-rounded text-[#059669] text-xl">domain</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Block</span>
                  <span className="text-base font-bold text-slate-800">
                    {user?.block || "Love Hall"}
                  </span>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-gradient-to-r from-white/80 to-white/60 rounded-2xl p-5 border border-slate-200/50 mb-6 hover:border-[#4A6CF7]/20 transition-colors duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E0D7FF] to-[#E0D7FF]/50 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-rounded text-[#7C3AED] text-xl">mail</span>
                  </div>
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Contact Email</span>
                    <span className="text-sm font-semibold text-slate-700 truncate">
                      {user?.email || "user@college.edu"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Row (Optional Enhancement) */}
              <div className="flex items-center justify-center gap-6 mb-6 py-3 border-t border-b border-slate-200/50">
                <div className="text-center">
                  <span className="text-lg font-bold text-slate-800">{user?.reportsCount || 0}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reports</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <span className="text-lg font-bold text-slate-800">{user?.foundItemsCount || 0}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Found</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <span className="text-lg font-bold text-slate-800">{user?.joinedDate || "2024"}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Joined</span>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="w-full bg-gradient-to-r from-[#4A6CF7] to-[#8B5CF6] hover:from-[#3D5AD9] hover:to-[#7C3AED] text-white font-semibold py-4 rounded-2xl shadow-lg shadow-[#4A6CF7]/25 transition-all duration-300 flex items-center justify-center gap-2 group hover:shadow-xl hover:shadow-[#4A6CF7]/30 hover:-translate-y-0.5"
              >
                <span>Close Profile</span>
                <span className="material-symbols-rounded text-lg group-hover:rotate-90 transition-transform duration-300">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetailsModal;