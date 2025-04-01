import React, { createContext, useState, useEffect, useContext } from 'react';
import customFetch from './api';
import { setCsrfTokenGlobally } from './csrfTokenStorage';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null); // <<< Add state for CSRF token

  // Check authentication status and get CSRF token on load
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true); // Ensure loading is true at the start
      try {
        const response = await customFetch('https://trendspark-ai.onrender.com/auth/status/'); // GET request
        const data = await response.json();

        if (response.ok) {
          setCsrfToken(data.csrfToken); // <<< Store the token from response
          setCsrfTokenGlobally(data.csrfToken);
          if (data.isAuthenticated && data.username) { // Check user data exists
             // Assuming the response includes user details when authenticated
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
           // Handle non-ok response from /auth/status/
           console.error('Auth status check failed:', data);
           setUser(null);
           setCsrfToken(null); // Clear token on failure
           setCsrfTokenGlobally(null); 
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setUser(null);
        setCsrfToken(null); // Clear token on error
        setCsrfTokenGlobally(null); 
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Run only once on mount

  // Helper to get headers with CSRF token
  const getHeaders = () => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken; // <<< Add header using stored token
    } else {
      // This should ideally not happen if checkAuth ran successfully
      console.warn('CSRF token not available for request.');
    }
    return headers;
  };

  // Login function
  const login = async (username, password) => {
    setError(null);
    if (!csrfToken) { // Prevent request if token is missing
        setError("CSRF token not loaded. Please refresh.");
        return false;
    }
    try {
      const response = await customFetch('https://trendspark-ai.onrender.com/auth/login/', {
        method: 'POST',
        headers: getHeaders(), // <<< Use helper to get headers
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json(); // Try parsing JSON regardless of status for error messages

      if (!response.ok) {
        // Use error message from backend if available
        throw new Error(data.detail || data.error || 'Login failed');
      }

      setUser(data); // Assuming login returns full user data
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
      return false;
    }
  };

  // Signup function (ensure you pass all required fields from your form)
  const signup = async (userData) => {
    setError(null);
     if (!csrfToken) { // Prevent request if token is missing
        setError("CSRF token not loaded. Please refresh.");
        return false;
    }
    // Example: const { username, email, password, password2, firstName, lastName } = userData;
    try {
      const response = await customFetch('https://trendspark-ai.onrender.com/auth/register/', {
        method: 'POST',
        headers: getHeaders(), // <<< Use helper to get headers
        body: JSON.stringify(userData), // Send all required fields
      });

      const data = await response.json(); // Try parsing JSON regardless of status

      if (!response.ok) {
         // Try to get specific field errors from DRF
         const messages = Object.entries(data)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
         throw new Error(messages || 'Registration failed');
      }

      // Backend automatically logs in on successful registration
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
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
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
    isAuthenticated: !!user && !loading, // Consider loading state for isAuthenticated
    csrfToken,
    getHeaders
  };

  // Render children only after initial loading is complete? Optional.
  // if (loading) {
  //   return <div>Loading authentication...</div>;
  // }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;