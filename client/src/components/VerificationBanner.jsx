import React, { useState } from 'react';
import API from '../services/api';

const VerificationBanner = ({ user, onVerificationSent }) => {
  const [sendingVerification, setSendingVerification] = useState(false);

  const handleSendVerification = async () => {
    try {
      setSendingVerification(true);
      await API.post('/api/auth/send-verification');
      if (onVerificationSent) {
        onVerificationSent('Verification email sent! Please check your inbox and spam folder.', 'success');
      }
    } catch (error) {
      console.error('Error sending verification:', error);
      if (onVerificationSent) {
        onVerificationSent('Failed to send verification email. Please try again.', 'error');
      }
    } finally {
      setSendingVerification(false);
    }
  };

  // Don't show banner if user is verified or no user data
  if (!user || user.emailVerified) {
    return null;
  }

  return (
    <div className="w-full max-w-[1140px] mx-auto px-4 md:px-8 py-1 md:py-1.5 bg-yellow-50/80 backdrop-blur-sm border-b border-yellow-200/50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="material-symbols-rounded text-yellow-600 text-[14px] md:text-base">warning</span>
          <p className="text-[10px] md:text-xs text-yellow-800 font-semibold tracking-tight md:tracking-normal">
            <span className="md:hidden">Email not verified</span>
            <span className="hidden md:inline">Email not verified - Verify to get verified student badge</span>
          </p>
        </div>
        <button
          onClick={handleSendVerification}
          disabled={sendingVerification}
          className="px-2 py-0.5 md:px-3 md:py-1 bg-yellow-500 text-white text-[9px] md:text-xs font-bold rounded-lg md:rounded hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
        >
          {sendingVerification ? 'Sending...' : 'Verify Now'}
        </button>
      </div>
    </div>
  );
};

export default VerificationBanner;
