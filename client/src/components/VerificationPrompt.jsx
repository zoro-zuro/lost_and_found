import React from 'react';
import { Link } from 'react-router-dom';

const VerificationPrompt = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-rounded text-2xl text-yellow-600">
              email
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Email Verification Required
          </h3>
          
          {/* Message */}
          <p className="text-slate-600 mb-6">
            {message || 'Please verify your email address to access this feature.'}
          </p>
          
          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/profile"
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Go to Profile
            </Link>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
          
          {/* Help Text */}
          <p className="text-xs text-slate-500 mt-4">
            Don't see the email? Check your spam folder or request a new verification email from your profile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPrompt;
