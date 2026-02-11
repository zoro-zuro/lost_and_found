import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ManageReports from './pages/ManageReports';
// import ReportDetails from './pages/ReportDetails';
import ReportItem from './pages/ReportItem';
// import LostFeed from './pages/LostFeed';
import FoundItems from './pages/FoundItems';
import FoundItemDetails from './pages/FoundItemDetails';
import LostItemDetails from './pages/LostItemDetails';
// import MyClaims from './pages/MyClaims';
import AdminRoom from './pages/AdminRoom';
import Unauthorized from './pages/Unauthorized';

import ProtectedRoute from './components/ProtectedRoute';
import GlobalLayout from './components/GlobalLayout';

function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

// Separate component to use Router context
function AppContent() {
  const location = useLocation();

  // Debug navigation and auth state
  useEffect(() => {
    console.log('🚀 App - Route changed to:', location.pathname);
    
    // Check auth state on route change
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('🔑 App - Auth state check:', {
      pathname: location.pathname,
      hasToken: !!token,
      hasUser: !!user,
      userData: user ? JSON.parse(user) : null
    });
  }, [location.pathname]);

  return (
    <>
      <div className="App">
        <Routes>
          {/* Auth Routes - No Global Navigation */}
          <Route path="/login" element={
            <GlobalLayout>
              <Login />
            </GlobalLayout>
          } />
          <Route path="/register" element={
            <GlobalLayout>
              <Register />
            </GlobalLayout>
          } />
          
          {/* Protected Routes - With Global Navigation */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <Dashboard />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <Profile />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <ManageReports />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          />
          {/* <Route 
            path="/reports/:id" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <ReportDetails />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          /> */}
          <Route 
            path="/report-lost" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <ReportItem />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/found/report" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <ReportItem />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          />
          {/* <Route 
            path="/lost" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <LostFeed />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          /> */}
          <Route 
            path="/lost/:id" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <LostItemDetails />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/found" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <FoundItems />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/found/:id" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <FoundItemDetails />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          />
          {/* <Route 
            path="/my-claims" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <MyClaims />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          /> */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <GlobalLayout>
                  <AdminRoom />
                </GlobalLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/unauthorized" 
            element={
              <GlobalLayout>
                <Unauthorized />
              </GlobalLayout>
            } 
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
