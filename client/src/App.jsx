import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyReports from './pages/MyReports';
import ReportDetails from './pages/ReportDetails';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import LostFeed from './pages/LostFeed';
import FoundItems from './pages/FoundItems';
import FoundItemDetails from './pages/FoundItemDetails';
import MyClaims from './pages/MyClaims';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/:id" 
            element={
              <ProtectedRoute>
                <ReportDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/report-lost" 
            element={
              <ProtectedRoute>
                <ReportLost />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lost" 
            element={
              <ProtectedRoute>
                <LostFeed />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lost/:id" 
            element={
              <ProtectedRoute>
                <ReportDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/found/report" 
            element={
              <ProtectedRoute>
                <ReportFound />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/found" 
            element={
              <ProtectedRoute>
                <FoundItems />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/found/:id" 
            element={
              <ProtectedRoute>
                <FoundItemDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-claims" 
            element={
              <ProtectedRoute>
                <MyClaims />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
