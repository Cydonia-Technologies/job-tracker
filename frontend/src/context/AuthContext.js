// =====================================================
// AUTH CONTEXT (src/context/AuthContext.js)
// =====================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await apiService.getCurrentUser();
        setUser(userData.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  // Updated method names to match component usage
  const signIn = async (email, password) => {
    try {
      const data = await apiService.login(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const signUp = async (email, password) => {
    try {
      const data = await apiService.register({ email, password });
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const signOut = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
    }
  };

  // Keep legacy method names for backward compatibility
  const login = signIn;
  const register = signUp;
  const logout = signOut;

  const value = {
    user,
    isAuthenticated,
    loading,
    // New method names (matching component usage)
    signIn,
    signUp,
    signOut,
    // Legacy method names
    login,
    register,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
