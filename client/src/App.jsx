import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyReports from './pages/MyReports';
import ReportDetails from './pages/ReportDetails';
import ReportLost from './pages/ReportLost';
import FoundItems from './pages/FoundItems';
import FoundItemDetails from './pages/FoundItemDetails';
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
