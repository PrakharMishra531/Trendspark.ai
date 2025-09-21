import React, { createContext, useState, useEffect, useContext } from 'react';
import customFetch from './api';
import { setCsrfToken } from './csrfTokenStorage'; // Import the global token setter

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This function is the single source of truth for the user's auth state
  const checkAuthStatus = async () => {
    try {
      const response = await customFetch('https://trendspark.prakharmishra.tech/auth/status/');
      const data = await response.json();

      if (response.ok) {
        // Set the token in our global store so customFetch can use it
        setCsrfToken(data.csrfToken); 
        
        if (data.isAuthenticated) {
           setUser({
             id: data.id,
             username: data.username,
             email: data.email,
             firstName: data.first_name,
             lastName: data.last_name,
           });
        } else {
          setUser(null);
        }
      } else {
         console.error('Auth status check failed:', data);
         setUser(null);
         setCsrfToken(null);
      }
    } catch (err) {
      console.error('Auth check network error:', err);
      setUser(null);
      setCsrfToken(null); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    checkAuthStatus();
  }, []); // Runs once when the app loads

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await customFetch('https://trendspark.prakharmishra.tech/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        // Use the actual error from the backend if available
        throw new Error(data.error || 'Login failed');
      }
      
      // After a successful login, re-check the auth status to get the
      // new user data and a fresh CSRF token.
      await checkAuthStatus();
      return true;

    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const signup = async (userData) => {
    setError(null);
    try {
        const response = await customFetch('https://trendspark.prakharmishra.tech/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (!response.ok) {
            // Extract a user-friendly error message
            const errorMessage = Object.values(data).join(' ');
            throw new Error(errorMessage || 'Signup failed');
        }

        // After signup, re-check status to log the user in and get a CSRF token
        await checkAuthStatus();
        return true;

    } catch(err) {
        setError(err.message);
        return false;
    }
  };

  const logout = async () => {
    setError(null);
    try {
        await customFetch('https://trendspark.prakharmishra.tech/auth/logout/', {
            method: 'POST',
        });
    } catch (err) {
        console.error("Logout failed, but clearing client-side state anyway:", err);
    } finally {
        // Always clear user state and token on logout
        setUser(null);
        setCsrfToken(null);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);