import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="mesh-bg-full min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-[600px] glass-panel rounded-t-[40px] p-8 md:p-12 text-center overflow-hidden relative border-white/20 shadow-xl">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full -ml-16 -mb-16 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <span className="material-symbols-rounded text-red-600 text-4xl">lock</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
            Security Clearance Required
          </h1>
          
          <p className="text-slate-500 font-medium text-base md:text-lg mb-8 max-w-md mx-auto leading-relaxed">
            You don't have the necessary authorization to access the Admin Room. This area is restricted to authorized personnel only.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border-2 border-slate-200 transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <span className="material-symbols-rounded text-lg">arrow_back</span>
              Go Back
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200/50 transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-rounded text-lg">dashboard</span>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
