import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000, onCancel, showCancel = false }) => {
  useEffect(() => {
    if (!showCancel && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, showCancel]);

  const typeClasses = {
    success: 'bg-white/95 backdrop-blur-lg border border-slate-200/60 shadow-lg',
    error: 'bg-white/95 backdrop-blur-lg border border-slate-200/60 shadow-lg',
    warning: 'bg-white/95 backdrop-blur-lg border border-slate-200/60 shadow-lg',
    info: 'bg-white/95 backdrop-blur-lg border border-slate-200/60 shadow-lg'
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  const textColors = {
    success: 'text-slate-800',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  const icons = {
    success: (
      <svg className={`w-5 h-5 ${iconColors.success}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className={`w-5 h-5 ${iconColors.error}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className={`w-5 h-5 ${iconColors.warning}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className={`w-5 h-5 ${iconColors.info}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div className={`fixed z-[100] shadow-2xl transition-all duration-300 animate-toast
      ${typeClasses[type]} ${textColors[type]}
      /* Mobile: iPhone Style - Top Center Popup */
      top-20 left-1/2
      w-fit max-w-[280px] 
      px-3 py-2.5 
      rounded-2xl
      backdrop-blur-sm bg-opacity-95
      /* Desktop: Top Right */
      md:top-18 md:right-6 md:left-auto md:translate-x-0 
      md:w-fit md:max-w-[320px]
      md:px-4 md:py-3.5`
    }>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-2.5 scale-90 md:scale-100">
          {icons[type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-semibold leading-tight truncate md:whitespace-normal">{message}</p>
        </div>
        {showCancel && (
          <button
            onClick={onCancel}
            className="ml-2 flex-shrink-0 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <style>{`
        /* Mobile: Slide down from top with bounce */
        @keyframes toastSlideIn {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -100%) scale(0.9);
          }
          60% { 
            opacity: 1; 
            transform: translate(-50%, 4px) scale(1.02);
          }
          100% { 
            opacity: 1; 
            transform: translate(-50%, 0) scale(1);
          }
        }
        
        @keyframes toastSlideOut {
          0% { 
            opacity: 1; 
            transform: translate(-50%, 0) scale(1);
          }
          100% { 
            opacity: 0; 
            transform: translate(-50%, -100%) scale(0.9);
          }
        }

        /* Desktop: Slide in from right */
        @media (min-width: 768px) {
          @keyframes toastSlideIn {
            0% { 
              opacity: 0; 
              transform: translateX(400px);
            }
            60% { 
              opacity: 1; 
              transform: translateX(-10px);
            }
            100% { 
              opacity: 1; 
              transform: translateX(0);
            }
          }
          
          @keyframes toastSlideOut {
            0% { 
              opacity: 1; 
              transform: translateX(0);
            }
            100% { 
              opacity: 0; 
              transform: translateX(400px);
            }
          }
        }
        
        .animate-toast {
          animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;