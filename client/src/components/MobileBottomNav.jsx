import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(1);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    {
      to: '/reports',
      icon: 'description',
      label: 'Reports'
    },
    {
      to: '/dashboard',
      icon: 'home',
      label: 'Home',
      isCenter: true
    },
    {
      to: '/found',
      icon: 'search',
      label: 'Browse'
    }
  ];

  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  useEffect(() => {
    const active = navItems.findIndex(item => isActiveLink(item.to));
    if (active !== -1) setActiveIndex(active);
  }, [location.pathname]);

  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="relative">
          {/* Main Navigation Container */}
          <div className="relative bg-white/30  border-white border backdrop-blur-md rounded-t-[1.5rem] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] px-4 py-2">
            
            <div className="grid grid-cols-3 relative">
              {navItems.map((item, index) => {
                const isActive = isActiveLink(item.to);
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setActiveIndex(index)}
                    className="relative flex items-center justify-center py-2 group z-10"
                  >
                    {/* Icon Container */}
                    <div className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isActive
                        ? 'bg-royal-blue shadow-[0_8px_20px_rgba(67,97,238,0.3)] -translate-y-1'
                        : 'bg-transparent'
                    }`}>
                      <span className={`material-symbols-rounded transition-colors duration-300 ${
                        isActive ? 'text-white text-[22px]' : 'text-slate-400 text-[20px] group-active:scale-95'
                      }`}>
                        {item.icon}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {/* Sliding Background Indicator */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-11 h-11 bg-royal-blue/5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{
                  left: `calc(${activeIndex * 33.333}% + (33.333% - 2.75rem) / 2)`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileBottomNav;