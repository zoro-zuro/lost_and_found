import { useState, useEffect } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage immediately
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    console.log('🔑 useAuth - Initial auth state:', {
      hasUserData: !!userData,
      hasToken: !!token,
      userData: userData ? JSON.parse(userData) : null
    });
    
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  });

  // Update user data globally
  const updateUser = (updatedUserData) => {
    console.log('🔄 useAuth - Updating user data:', updatedUserData);
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      console.log('🔄 useAuth - Refreshing user data from server');
      const API = (await import('../services/api')).default;
      const response = await API.get('/api/auth/me');
      const userData = response.data.data.user;
      console.log('✅ useAuth - User data refreshed:', userData);
      updateUser(userData);
      return userData;
    } catch (error) {
      console.error('❌ useAuth - Failed to refresh user data:', error);
      return null;
    }
  };

  // Logout user
  const logout = () => {
    console.log('🚪 useAuth - Logging out user');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return {
    user,
    setUser: updateUser,
    updateUser,
    refreshUser,
    logout
  };
};

export default useAuth;
