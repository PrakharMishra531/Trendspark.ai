import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      navigate('/login');
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1>
          <span style={{ color: "#4f46e5" }}>✦</span> Trendspark AI - Dynamic Content Ideation Using Context-Aware LLMs
        </h1>
        
        <nav>
          <Link to="/">Home</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/beginner-ideas">Idea Generator</Link>
              <div className="auth-section">
                <span className="username">Welcome, {user?.username || 'User'}</span>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-section">
              <Link to="/login" className="auth-link">Login</Link>
              <Link to="/signup" className="auth-link auth-button">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;