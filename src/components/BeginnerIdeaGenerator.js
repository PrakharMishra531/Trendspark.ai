import React, { useState, useEffect, useRef } from 'react';
// Remove Card import since we'll create our own
import IdeaDetails from './IdeaDetails';
import './BeginnerIdeaGenerator.css';
import customFetch from './api';
import { getCsrfTokenGlobally } from './csrfTokenStorage';

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
  
  const [csrfToken, setCsrfToken] = useState(getCsrfTokenGlobally()); // Initialize with the current token

  useEffect(() => {
    const interval = setInterval(() => {
      const token = getCsrfTokenGlobally();
      if (token !== csrfToken) {
        setCsrfToken(token); // Update state if the token changes
      }
    }, 1000); // Check for updates every second (adjust as needed)

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [csrfToken]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIdeas([]);
    setSelectedIdea(null);
    setIdeaDetails(null);

    // Prepare data for API
    const payload = {
      primary_category: formData.primary_category,
      ideal_creator: formData.ideal_creator,
      budget: formData.budget,
      resources: formData.resources.join(','), // Send as comma-separated string
      video_style: formData.video_style,
      country:"US"
    };

    try {
      if (!csrfToken) {
        // Display clear error and guidance
        setError("CSRF token is missing! Please refresh the page or log in again.");
        console.error("CSRF token missing when submitting idea generator form");
        setLoading(false);
        return;
      }

      const response = await customFetch('https://trendspark-ai.onrender.com/api/suggest-ideas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, // Include CSRF token in the request header
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setIdeas(result.ideas || []);
      
      // Scroll to results section after ideas are loaded
      setTimeout(() => {
        if (resultsRef.current && result.ideas?.length > 0) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }, 500); // Add a small delay to ensure DOM has updated
      
    } catch (err) {
      // Improved error handling
      let errorMessage = err.message;
      if (err.message.includes('403')) {
        errorMessage = "Authorization error (403): CSRF verification failed. Please refresh the page.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (idea) => {
    setSelectedIdea(idea);
    setDetailsLoading(true);
    setIdeaDetails(null);

    // Prepare data for API
    const payload = {
      topic: idea.title,
      description: idea.short_description,
      primary_category: formData.primary_category,
      ideal_creator: formData.ideal_creator,
      budget: formData.budget,
      resources: formData.resources.join(','),
      video_style: formData.video_style
    };

    console.log("Payload being sent:", payload); // Add this line

    try {
      if (!csrfToken) {  // Ensure CSRF token is available
        setError("CSRF token is missing!");
        return;
      }

      const response = await customFetch('https://trendspark-ai.onrender.com/api/get-idea-details/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, // Include CSRF token in the request header
        },
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

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Generating Ideas...' : 'Generate Content Ideas'}
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
                title={idea.topic}
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