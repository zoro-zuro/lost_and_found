import React from 'react';

const LoadingScreen = ({ isLoading = true, layoutType = "default" }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 mesh-bg min-h-screen flex flex-col items-center justify-center relative">
      {/* Background Shapes */}
      <div className="organic-shape bg-peach w-[500px] h-[500px] -top-20 -left-20"></div>
      <div className="organic-shape bg-lavender w-[400px] h-[400px] bottom-0 right-0"></div>
      <div className="organic-shape bg-mint w-72 h-72 top-1/4 right-1/4"></div>
      
      {/* Main Animation */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Orbiting Magnifying Glass */}
        <div className="magnifying-glass-orbit">
          <div className="glass-head">
            <div className="glass-handle"></div>
            <div className="w-2 h-2 bg-white rounded-full absolute top-2 right-2 opacity-60"></div>
          </div>
        </div>
        
        {/* Central Backpack */}
        <div className="hand-drawn-backpack flex items-center justify-center">
          <div className="hand-drawn-handle"></div>
          <div className="hand-drawn-pocket"></div>
          <div className="absolute top-8 left-6 w-12 h-0.5 bg-indigo-200 rounded-full"></div>
          <div className="absolute top-12 left-6 w-8 h-0.5 bg-indigo-200 rounded-full"></div>
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold text-slate-700 tracking-tight">
          Searching the hub for you...
        </h2>
        <p className="mt-2 text-slate-400 font-hand italic text-lg">
          We're gathering all the latest finds.
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-16 w-64 h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
        <div className="h-full bg-primary rounded-full progress-glow animate-[loading_2s_ease-in-out_infinite]" style={{width: "45%"}}></div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-12 flex items-center gap-2 opacity-50">
        <span className="material-symbols-outlined text-slate-400">favorite</span>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">College Community Hub</span>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-peach/40 border border-peach/60"></div>
      <div className="absolute bottom-1/3 right-1/3 w-6 h-6 rounded-full bg-mint/40 border border-mint/60"></div>
      <div className="absolute top-1/2 left-2/3 w-3 h-3 rounded-full bg-lavender/40 border border-lavender/60"></div>
      
      {/* Styles */}
      <style jsx>{`
        .mesh-bg {
          background-color: #fffcf9;
          background-image: 
            radial-gradient(at 0% 0%, rgba(255, 237, 218, 0.5) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(230, 255, 250, 0.5) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(243, 240, 255, 0.5) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(255, 237, 218, 0.4) 0px, transparent 50%);
        }
        
        .organic-shape {
          position: absolute;
          z-index: -1;
          filter: blur(80px);
          opacity: 0.4;
          border-radius: 50%;
        }
        
        .hand-drawn-backpack {
          width: 120px;
          height: 140px;
          background: #f3f0ff;
          border: 3px solid #6366f1;
          border-radius: 30px 30px 15px 15px;
          position: relative;
          box-shadow: 4px 4px 0px rgba(99, 102, 241, 0.1);
        }
        
        .hand-drawn-pocket {
          width: 80px;
          height: 50px;
          background: #e6fffa;
          border: 3px solid #6366f1;
          border-radius: 12px;
          position: absolute;
          bottom: 20px;
          left: 20px;
        }
        
        .hand-drawn-handle {
          width: 40px;
          height: 20px;
          border: 3px solid #6366f1;
          border-radius: 20px 20px 0 0;
          position: absolute;
          top: -15px;
          left: 40px;
        }
        
        .magnifying-glass-orbit {
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          animation: rotate 4s linear infinite;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .glass-head {
          width: 45px;
          height: 45px;
          background: rgba(255, 237, 218, 0.9);
          border: 3px solid #4A6CF7;
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .glass-handle {
          width: 4px;
          height: 20px;
          background: #4A6CF7;
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%) rotate(-10deg);
          border-radius: 2px;
        }
        
        .progress-glow {
          box-shadow: 0 0 15px rgba(74, 108, 247, 0.3);
        }
        
        @keyframes loading {
          0% { width: 10%; margin-left: 0%; }
          50% { width: 40%; margin-left: 60%; }
          100% { width: 10%; margin-left: 0%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
