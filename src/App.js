import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import BeginnerIdeaGenerator from './components/BeginnerIdeaGenerator';
import Login from './components/Login';
import Signup from './components/Signup';
import Header from './components/Header';
import { AuthProvider, useAuth } from './components/AuthContext';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading authentication status...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <Login />
          } />
          <Route path="/signup" element={
            isAuthenticated ? <Navigate to="/" /> : <Signup />
          } />
          <Route path="/beginner-ideas" element={
            <ProtectedRoute>
              <BeginnerIdeaGenerator />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <footer>
        <p>Made By Prakhar, Ashish, Pramukh</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;