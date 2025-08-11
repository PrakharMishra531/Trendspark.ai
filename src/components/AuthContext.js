import React, { createContext, useState, useEffect, useContext } from 'react';
import customFetch from './api';
import { setCsrfTokenGlobally } from './csrfTokenStorage';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null); 

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await customFetch('https://trendspark-ai.onrender.com/auth/status/');
        const data = await response.json();

        if (response.ok) {
          setCsrfToken(data.csrfToken); 
          setCsrfTokenGlobally(data.csrfToken);
          if (data.isAuthenticated && data.username) {
             setUser({
                id: data.id,
                username: data.username,
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                is_staff: data.is_staff
             });
          } else {
            setUser(null);
          }
        } else {
           console.error('Auth status check failed:', data);
           setUser(null);
           setCsrfToken(null);
           setCsrfTokenGlobally(null); 
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setUser(null);
        setCsrfToken(null); 
        setCsrfTokenGlobally(null); 
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const getHeaders = () => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken; 
    } else {
      console.warn('CSRF token not available for request.');
    }
    return headers;
  };

  // Login function
  const login = async (username, password) => {
    setError(null);
    if (!csrfToken) { 
        setError("CSRF token not loaded. Please refresh.");
        return false;
    }
    try {
      const response = await customFetch('https://trendspark-ai.onrender.com/auth/login/', {
        method: 'POST',
        headers: getHeaders(), 
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Login failed');
      }

      setUser(data); 
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
      return false;
    }
  };


  const signup = async (userData) => {
    setError(null);
     if (!csrfToken) {
        setError("CSRF token not loaded. Please refresh.");
        return false;
    }

    try {
      const response = await customFetch('https://trendspark-ai.onrender.com/auth/register/', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json(); 

      if (!response.ok) {

         const messages = Object.entries(data)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
         throw new Error(messages || 'Registration failed');
      }

      setUser(data);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Signup error:', err);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    setError(null);
  
    if (!csrfToken) {
      console.warn("⚠️ CSRF token missing for logout! Retrying...");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  
    if (!csrfToken) {
      console.error("❌ Still no CSRF token after delay. Aborting logout.");
      return false;
    }
  
    try {
      console.log("🚀 Sending logout request with CSRF token:", csrfToken);
      const response = await customFetch('https://trendspark-ai.onrender.com/auth/logout/', {
        method: 'POST',
        headers: getHeaders(),
      });
  
      console.log("✅ Logout response status:", response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Logout failed');
      }
  
      setUser(null);
      console.log('🎉 User logged out successfully!');
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Logout error:', err);
      return false;
    }
  };
  

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user && !loading, 
    csrfToken,
    getHeaders
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;