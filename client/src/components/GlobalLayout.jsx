import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GlobalNavbar from './GlobalNavbar';
import MobileBottomNav from './MobileBottomNav';
import useAuth from '../hooks/useAuth';

const GlobalLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Routes that should not have global navigation
  const noNavRoutes = ['/login', '/register'];
  const shouldShowNav = !noNavRoutes.includes(location.pathname);

  // Debug user data in GlobalLayout
  useEffect(() => {
    console.log('🏗️ GlobalLayout - User state:', {
      pathname: location.pathname,
      hasUser: !!user,
      userData: user,
      shouldShowNav
    });
  }, [user, location.pathname]);

  return (
    <div className="mesh-bg-full min-h-screen">
      {shouldShowNav && user && (
        <>
          {/* Global Navbar */}
          <div className="sticky top-0 z-50 w-full">
            <GlobalNavbar user={user} />
          </div>
          
          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </>
      )}
      
      {/* Page Content */}
      <div className={shouldShowNav ? 'md:pt-2 md:pb-0' : 'min-h-screen'}>
        {children}
      </div>
    </div>
  );
};

export default GlobalLayout;
