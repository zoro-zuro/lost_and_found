import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FilePenLine } from 'lucide-react';
import API from '../services/api';
import ProfileModel from './ProfileModel';
import VerificationBanner from './VerificationBanner';
import Toast from './Toast';
import useAuth from '../hooks/useAuth';


const GlobalNavbar = ({ user, onProfileClick, onUserDetailsClick, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const mobileProfileRef = useRef(null);
  const desktopProfileRef = useRef(null);

  // Debug user data
  useEffect(() => {
    console.log('GlobalNavbar - User data:', user);
    console.log('GlobalNavbar - User exists:', !!user);
    console.log('GlobalNavbar - User name:', user?.name);
  }, [user]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Close profile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(event.target) &&
          desktopProfileRef.current && !desktopProfileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleVerificationSent = (message, type) => {
    setToast({ message, type });
  };

  const handleLogout = async () => {
    try {
      await API.post('/api/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (onLogout) onLogout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const initials = (user?.name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/reports", label: "My Reports" },
    { to: "/found", label: "Found & Lost" }
  ];

  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        {/* Verification Banner - Inside navbar on top */}
        <VerificationBanner user={user} onVerificationSent={handleVerificationSent} />
        
        <div className="w-full max-w-[1140px] mx-auto glass-panel rounded-b-3xl px-4 md:px-8 h-16 md:h-20 flex items-center justify-between border-b border-white/20">
          
          {/* Mobile Layout: Grid with 3 columns */}
          <div className="grid grid-cols-3 items-center w-full md:hidden">
            {/* Left - Profile */}
            <div className="justify-self-start">
              {user && (
                <div className="relative group" ref={mobileProfileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center font-bold text-orange-700 border-2 border-white cursor-pointer hover:scale-105 transition-all"
                  >
                    {initials?.slice(0, 1) || "U"}
                  </button>

                  <ProfileModel 
                    isOpen={isProfileOpen}
                    user={user}
                    onClose={() => setIsProfileOpen(false)}
                    isDropdown={true}
                  />
                </div>
              )}
            </div>

            {/* Center - Logo */}
            <div className="justify-self-center flex items-center gap-2">
              <div className="hidden md:flex w-9 h-9 bg-indigo-100 rounded-xl items-center justify-center">
                <span className="material-symbols-rounded text-indigo-500 text-base">volunteer_activism</span>
              </div>
              <div className="flex flex-col leading-tight">
                <h1 className="font-bold text-xs leading-none tracking-tight text-slate-900">College Hub</h1>
                <p className="text-[7px] uppercase tracking-[0.15em] font-extrabold text-indigo-400 leading-none">Lost & Found</p>
              </div>
            </div>

            {/* Right - Report Button */}
            <div className="justify-self-end">
              {(user?.role === "ADMIN" || user?.role === "STAFF") ? (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-1 px-2 py-2 rounded-md text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all hover:scale-105 border-2 border-white"
                >
                  <span className="material-symbols-rounded text-base">admin_panel_settings</span>
                </Link>
              ) : (
                <Link 
                  to="/report-lost" 
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-2 rounded-md font-bold text-xs transition-all flex items-center gap-1 hover:scale-105 border-2 border-white"
                >
                  <FilePenLine size={16} />
                  <span>Report</span>
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Layout: Original */}
          <div className="hidden md:flex items-center gap-1 md:gap-4">
            <div className="flex w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-2xl flex items-center justify-center border-2 border-white">
              <span className="material-symbols-rounded text-indigo-500 text-xl md:text-3xl">volunteer_activism</span>
            </div>
            <div>
              <h1 className="font-bold text-base md:text-xl leading-tight tracking-tight text-slate-900">College Hub</h1>
              <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] leading-none font-extrabold text-indigo-400">Lost & Found</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-2 bg-slate-50/80 p-1.5 rounded-2xl border-2 shadow-indigo-100/50 inset-shadow-[0px_2px_5px_4px_theme(colors.indigo.100/10%),0px_-2px_5px_4px_theme(colors.indigo.100/10%)] border-white">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to}
                className={`px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  isActiveLink(link.to) 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-slate-500 hover:text-indigo-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center gap-3 md:gap-4">
            {/* Admin Button - Show for admin users */}
            {(user?.role === "ADMIN" || user?.role === "STAFF") ? (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl md:rounded-2xl text-xs md:text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all hover:scale-105"
              >
                <span className="material-symbols-rounded text-lg md:text-base">admin_panel_settings</span>
                Admin Room
              </Link>
            ) : (
              <Link to="/report-lost" className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-2 md:px-6 md:py-3 rounded-2xl font-bold text-xs md:text-sm transition-all flex items-center gap-1 hover:scale-102 border-2 border-white">
                <FilePenLine size={22} />
                <span>Report</span>
              </Link>
            )}
            
            {/* Profile Avatar - Desktop Only */}
            {user && (
              <div className="relative group" ref={desktopProfileRef}>
                <button
                  onMouseEnter={() => setIsProfileOpen(true)}
                  className={`w-8 h-8 md:w-11 md:h-11 rounded-2xl bg-orange-100 flex items-center justify-center font-bold text-orange-700 border-2 border-white text-sm md:text-base cursor-pointer hover:scale-105 transition-all hover:ring-4 hover:ring-orange-100 ${isProfileOpen ? 'ring-4 ring-orange-100' : ''}`}
                >
                  {initials?.slice(0, 1) || "U"}
                </button>

                <ProfileModel 
                  isOpen={isProfileOpen}
                  user={user}
                  onClose={() => setIsProfileOpen(false)}
                  isDropdown={true}
                />
              </div>
            )}
          </div>
        </div>
      </header>

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

export default GlobalNavbar;