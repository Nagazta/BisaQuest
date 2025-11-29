import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authServices';

const AuthContext = createContext({});

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

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const result = await authService.getSession();
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, firstName, lastName, teacherID = '') => {
    try {
      const result = await authService.registerTeacher(
        email, 
        password, 
        firstName, 
        lastName, 
        teacherID
      );

      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);

      if (result.success && result.data) {
      setUser(result.data.user);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const result = await authService.logout();
      
      if (result.success) {
        setUser(null);
      }

      return result;
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};