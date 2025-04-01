import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import { useAuth } from './AuthContext'; // Import the AuthContext
import './HomePage.css';
import customFetch from './api'; 



const CACHE_KEY = 'trending_data';
const CACHE_EXPIRY_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

const HomePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext

  // Function to check and retrieve cached data
  const getCachedData = () => {
    const cachedData = localStorage.getItem(CACHE_KEY);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();

      // Check if the cache is still valid
      if (now - timestamp < CACHE_EXPIRY_TIME) {
        console.log('✅ Using cached data.');
        return data;
      } else {
        console.log('⚠️ Cache expired. Fetching new data...');
        localStorage.removeItem(CACHE_KEY); // Clear expired cache
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      // Check for cached data first
      const cachedData = getCachedData();

      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      try {
        const response = await customFetch('http://127.0.0.1:8000/api/analyze/?country=US');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Data received from backend:', result);

        // Store data in localStorage with timestamp
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: result,
            timestamp: new Date().getTime(),
          })
        );

        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading data...</div>;

  if (error)
    return (
      <div className="error">
        <p>Error loading data: {error}</p>
        <p>Make sure your Django backend is running at http://127.0.0.1:8000</p>
      </div>
    );

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Trendspark AI</h1>
          <p>Discover content trends and generate powerful ideas with AI assistance</p>

          {isAuthenticated ? (
            <Link to="/beginner-ideas" className="cta-button">
              Generate Content Ideas
            </Link>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="secondary-button">Login</Link>
              <Link to="/signup" className="cta-button">Start Creating</Link>
            </div>
          )}
        </div>
      </section>

      <section className="trending-section">
        <h2>Trending Content Analysis</h2>

        <div className="card-container">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={index} className="card-wrapper">
                <Card 
                  title={item.title} 
                  description={item.description}
                  data={{
                    ...item,
                    thumbnail: item.thumbnail
                  }} 
                />
              </div>
            ))
          ) : (
            <p>No trending data available.</p>
          )}
        </div>
      </section>

      <section className="features-section">
        <h2>Platform Features</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Content Idea Generation</h3>
            <p>Get personalized content ideas based on your preferences and resources</p>
          </div>
          <div className="feature-card">
            <h3>Market Analysis</h3>
            <p>Explore trending topics and content formats to stay ahead of the curve</p>
          </div>
          <div className="feature-card">
            <h3>Resource Planning</h3>
            <p>Get recommendations for equipment and software based on your budget</p>
          </div>
          <div className="feature-card">
            <h3>Detailed Guides</h3>
            <p>Step-by-step instructions to bring your content ideas to life</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;