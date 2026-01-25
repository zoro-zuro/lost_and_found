import React from 'react';
import Navbar from './Navbar';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg bg-pattern">
      <Navbar />
      <main className="container-custom py-12 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
