import React, { useState, useEffect } from 'react';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import Badge from './Badge';
import API from '../services/api';

const UserDetailModal = ({ userId, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/api/users/${userId}/profile`);
      setUserData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Glass Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-bg/20 backdrop-blur-xl transition-all duration-500"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-[400px] scale-in">
        <Card className="!rounded-[24px] overflow-hidden !shadow-2xl border-border/10 bg-surface">
          <div className="px-6 py-8">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-[20px] bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border border-primary/20 capitalize mb-4 shrink-0">
                {userData?.name ? userData.name.charAt(0) : '?'}
              </div>
              
              {loading ? (
                <div className="py-8 flex flex-col items-center">
                  <LoadingSpinner size="md" />
                  <p className="mt-3 text-muted-text text-[12px] font-medium opacity-60 uppercase tracking-widest">Checking Profile...</p>
                </div>
              ) : error ? (
                <div className="py-6 text-center space-y-3">
                  <p className="text-danger font-semibold text-small">{error}</p>
                  <button onClick={onClose} className="btn-secondary btn-sm">Close</button>
                </div>
              ) : userData ? (
                <div className="w-full space-y-6">
                  <div className="text-center space-y-1">
                    <h3 className="text-h2 text-text font-bold">{userData.name}</h3>
                    <div className="flex justify-center">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10">
                        {userData.role} • Verified Member
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-bg rounded-[12px] border border-border/50">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-muted-text opacity-50 block mb-0.5">Department</label>
                      <p className="text-[12px] font-bold text-text truncate">{userData.department || 'General'}</p>
                    </div>
                    {userData.block && (
                      <div className="p-3 bg-bg rounded-[12px] border border-border/50">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-muted-text opacity-50 block mb-0.5">Block</label>
                        <p className="text-[12px] font-bold text-text truncate">{userData.block}</p>
                      </div>
                    )}
                  </div>

                  {/* Contact Information (Conditional) */}
                  {(userData.email || userData.phone) ? (
                    <div className="space-y-3 pt-2 border-t border-border/50">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-muted-text opacity-40 block text-center">Contact Channels</label>
                      <div className="space-y-2">
                        {userData.email && (
                          <a href={`mailto:${userData.email}`} className="flex items-center gap-3 p-3 rounded-[12px] bg-bg hover:bg-primary/5 transition-colors border border-border/50 hover:border-primary/20">
                            <div className="w-8 h-8 rounded-[8px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <span className="text-[12px] font-bold text-text truncate">{userData.email}</span>
                          </a>
                        )}
                        {userData.phone && (
                          <a href={`tel:${userData.phone}`} className="flex items-center gap-3 p-3 rounded-[12px] bg-bg hover:bg-success/5 transition-colors border border-border/50 hover:border-success/20">
                            <div className="w-8 h-8 rounded-[8px] bg-success/10 text-success flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <span className="text-[12px] font-bold text-text truncate">{userData.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-warning/5 border border-warning/10 rounded-[16px] text-center">
                       <p className="text-[11px] text-warning/80 font-medium leading-normal italic">Contact details are locked for security purposes.</p>
                    </div>
                  )}

                  <button onClick={onClose} className="btn-secondary w-full !rounded-[12px] !h-11 text-[11px] font-bold mt-2">
                    Close Profile
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserDetailModal;
