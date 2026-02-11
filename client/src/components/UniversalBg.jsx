import React from 'react';

const UniversalBg = ({ children, className = "" }) => {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Mesh Background Container */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        {/* Base background */}
        <div className="absolute inset-0 bg-[#FAF9F6] dark:bg-[#0f172a] transition-colors duration-500"></div>
        
        {/* Colorful Blobs */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
        
        {/* Frosted Overlay */}
        <div className="frosted-overlay"></div>
      </div>
      
      {/* Content */}
      {children}
      
      {/* Styles */}
      <style jsx>{`
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.6;
        }
        
        .blob-1 {
          top: -10%;
          left: -10%;
          width: 60vw;
          height: 60vw;
          background-color: #FFD8B1;
        }
        
        .blob-2 {
          top: -5%;
          right: -5%;
          width: 50vw;
          height: 50vw;
          background-color: #E8DAEF;
        }
        
        .blob-3 {
          top: 30%;
          left: 15%;
          width: 45vw;
          height: 45vw;
          background-color: #D1F2EB;
          opacity: 0.5;
        }
        
        .blob-4 {
          bottom: -10%;
          right: 5%;
          width: 55vw;
          height: 55vw;
          background-color: #FFD8B1;
          opacity: 0.4;
        }
        
        .blob-5 {
          bottom: -5%;
          left: -5%;
          width: 40vw;
          height: 40vw;
          background-color: #E8DAEF;
          opacity: 0.4;
        }
        
        .frosted-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(60px);
          -webkit-backdrop-filter: blur(60px);
          z-index: 10;
        }
        
        /* Dark mode styles */
        .dark .blob {
          opacity: 0.25;
        }
        
        .dark .blob-1 {
          background-color: #7c2d12;
        }
        
        .dark .blob-2 {
          background-color: #4c1d95;
        }
        
        .dark .blob-3 {
          background-color: #064e3b;
        }
        
        .dark .blob-4 {
          background-color: #7c2d12;
        }
        
        .dark .blob-5 {
          background-color: #4c1d95;
        }
        
        .dark .frosted-overlay {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(80px);
        }
      `}</style>
    </div>
  );
};

export default UniversalBg;
