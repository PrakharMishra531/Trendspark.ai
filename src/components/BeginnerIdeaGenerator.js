import React, { useState, useRef } from 'react';
// Remove Card import since we'll create our own
import IdeaDetails from './IdeaDetails';
import './BeginnerIdeaGenerator.css';
import customFetch from './api';
import { useAuth } from './AuthContext';

// Custom IdeaCard component with Vercel-inspired styling
const IdeaCard = ({ title, description, onClick }) => {
  return (
    <div className="idea-card" onClick={onClick}>
      <div className="idea-card-content">
        <h4 className="idea-card-title">{title}</h4>
        <p className="idea-card-description">{description}</p>
      </div>
      <div className="idea-card-footer">
        <span className="idea-card-tag">Trending</span>
        <span className="idea-card-arrow">→</span>
      </div>
    </div>
  );
};

const BeginnerIdeaGenerator = () => {
  
  const { getHeaders, loading: authLoading, csrfToken, user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    primary_category: '',
    ideal_creator: '',
    budget: 'low',
    resources: [],
    video_style: 'short'
  });

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideaDetails, setIdeaDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const resultsRef = useRef(null); // Add a ref for the results section

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        resources: [...formData.resources, value]
      });
    } else {
      setFormData({
        ...formData,
        resources: formData.resources.filter(item => item !== value)
      });
    }
  };

  // In BeginnerIdeaGenerator.js

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setIdeas([]);
  setSelectedIdea(null);
  setIdeaDetails(null);

  const payload = {
    primary_category: formData.primary_category || "General",
    ideal_creator: formData.ideal_creator || "Any popular creator",
    budget: formData.budget,
    resources: formData.resources.join(', ') || "basic setup",
    video_style: formData.video_style
  };

  try {
    if (!csrfToken) {
      setError("CSRF token is missing! Please refresh the page or log in again.");
      setLoading(false);
      return;
    }

    if (!getHeaders) {
      setError("Authentication headers not available. Please refresh the page.");
      setLoading(false);
      return;
    }

    if (!isAuthenticated || !user) {
      setError("You must be logged in to generate ideas. Please log in first.");
      setLoading(false);
      return;
    }

    console.log('🔍 Testing suggest-ideas API...');
    console.log('📤 Sending payload:', payload);
    console.log('🍪 Cookies available:', document.cookie ? 'Yes' : 'No');
    console.log('🔐 User authenticated:', isAuthenticated);
    console.log('👤 User:', user?.username);
    
    // Force refresh CSRF token before making the API call
    console.log('🔄 Refreshing CSRF token...');
    try {
      const tokenResponse = await customFetch('https://trendspark.prakharmishra.tech/auth/status/');
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        console.log('✅ New CSRF token received:', tokenData.csrfToken);
        console.log('🔄 Updating CSRF token in context...');
        // The auth context should automatically update, let's continue with the API call
      }
    } catch (err) {
      console.log('❌ Failed to refresh token:', err.message);
    }
    
    const response = await customFetch('https://trendspark.prakharmishra.tech/api/suggest-ideas/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    
    console.log('✅ POST request status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    
    // --- THIS IS THE FIX ---
    // We will only accept ideas that have BOTH a title and a description.
    if (result.ideas && Array.isArray(result.ideas)) {
      const completeIdeas = result.ideas.filter(idea => idea.title && idea.description);
      setIdeas(completeIdeas);
    } else {
      // If there's no 'ideas' array, set it to an empty array.
      setIdeas([]);
    }
    // --- END OF FIX ---

    // Scroll to results after a short delay
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
    
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleCardClick = async (idea) => {
    if (!formData.primary_category || !formData.ideal_creator) {
      setError("Please ensure 'Primary Category' and 'Ideal Creator' fields are filled out before getting details.");
      return; // Stop the function before it makes the API call
    }
    
    setSelectedIdea(idea);
    setDetailsLoading(true);
    setIdeaDetails(null);

    const payload = {
      topic: idea.title,
      description: idea.description,
      primary_category: formData.primary_category || "General",
      ideal_creator: formData.ideal_creator || "Any popular creator",
      budget: formData.budget,
      resources: formData.resources.join(', ') || "basic setup",
      video_style: formData.video_style
    };

    try {
      if (!csrfToken) {  // Ensure CSRF token is available
        setError("CSRF token is missing!");
        return;
      }

      if (!getHeaders) {
        setError("Authentication headers not available. Please refresh the page.");
        return;
      }

      if (!isAuthenticated || !user) {
        setError("You must be logged in to get idea details. Please log in first.");
        return;
      }

      const response = await customFetch('https://trendspark.prakharmishra.tech/api/get-idea-details/', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching idea details:', `HTTP error! Status: ${response.status}`, errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setIdeaDetails(result.details || null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching idea details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };
  return (
    
    <div className="beginner-idea-generator">
      <h2>Content Idea Generator</h2>

      <form onSubmit={handleSubmit} className="idea-form">
        <div className="form-group">
          <label htmlFor="primary_category">
            Primary Video Category (e.g., Gaming, Music)
          </label>
          <input
            type="text"
            id="primary_category"
            name="primary_category"
            value={formData.primary_category}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ideal_creator">
            Who is your ideal content creator (e.g., MrBeast, Marques Brownlee)?
          </label>
          <input
            type="text"
            id="ideal_creator"
            name="ideal_creator"
            value={formData.ideal_creator}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Budget</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="budget"
                value="low"
                checked={formData.budget === 'low'}
                onChange={handleInputChange}
              />
              Low
            </label>
            <label>
              <input
                type="radio"
                name="budget"
                value="medium"
                checked={formData.budget === 'medium'}
                onChange={handleInputChange}
              />
              Medium
            </label>
            <label>
              <input
                type="radio"
                name="budget"
                value="high"
                checked={formData.budget === 'high'}
                onChange={handleInputChange}
              />
              High
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Resources Available</label>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="resources"
                value="smartphone"
                onChange={handleCheckboxChange}
                checked={formData.resources.includes('smartphone')}
              />
              Smartphone
            </label>
            <label>
              <input
                type="checkbox"
                name="resources"
                value="camera"
                onChange={handleCheckboxChange}
                checked={formData.resources.includes('camera')}
              />
              Camera
            </label>
            <label>
              <input
                type="checkbox"
                name="resources"
                value="microphone"
                onChange={handleCheckboxChange}
                checked={formData.resources.includes('microphone')}
              />
              Microphone
            </label>
            <label>
              <input
                type="checkbox"
                name="resources"
                value="editing software"
                onChange={handleCheckboxChange}
                checked={formData.resources.includes('editing software')}
              />
              Editing Software
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Preferred Video Style</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="video_style"
                value="short"
                checked={formData.video_style === 'short'}
                onChange={handleInputChange}
              />
              Short
            </label>
            <label>
              <input
                type="radio"
                name="video_style"
                value="long"
                checked={formData.video_style === 'long'}
                onChange={handleInputChange}
              />
              Long
            </label>
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading || authLoading}>
          {loading ? 'Generating Ideas...' : authLoading ? 'Loading...' : 'Generate Content Ideas'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          Error: {error}. Make sure your Django backend is running.
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading">Generating ideas...</div>
          <p>Please wait while we create personalized content ideas for you</p>
        </div>
      )}

      {ideas.length > 0 && (
        <div className="results-section" ref={resultsRef}>
          <h3>Content Ideas</h3>
          <div className="idea-cards-container">
            {ideas.map((idea, index) => (
              <IdeaCard
                key={index}
                title={idea.title}
                description={idea.short_description}
                onClick={() => handleCardClick(idea)}
              />
            ))}
          </div>
        </div>
      )}

      {detailsLoading && (
        <div className="loading-overlay">
          <div className="loading">Loading idea details...</div>
          <p>Preparing detailed breakdown of your selected idea</p>
        </div>
      )}

      {ideaDetails && (
        <IdeaDetails
          idea={selectedIdea}
          details={ideaDetails}
          onClose={() => setIdeaDetails(null)}
        />
      )}
    </div>
  );
};

export default BeginnerIdeaGenerator;