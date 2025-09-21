import React, { useState, useRef } from 'react';
import IdeaDetails from './IdeaDetails';
import './BeginnerIdeaGenerator.css';
import customFetch from './api';
import { useAuth } from './AuthContext';

// Custom IdeaCard component (no changes needed here)
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
  const { isAuthenticated, loading: authLoading } = useAuth();

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
  const resultsRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      resources: checked 
        ? [...prevData.resources, value] 
        : prevData.resources.filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIdeas([]);
    setSelectedIdea(null);
    setIdeaDetails(null);

    // Simple authentication check
    if (!isAuthenticated) {
      setError("You must be logged in to generate ideas. Please log in first.");
      setLoading(false);
      return;
    }

    const payload = {
      primary_category: formData.primary_category || "General",
      ideal_creator: formData.ideal_creator || "Any popular creator",
      budget: formData.budget,
      resources: formData.resources.join(', ') || "basic setup",
      video_style: formData.video_style
    };

    try {
      // customFetch now handles CSRF token automatically
      const response = await customFetch('https://trendspark.prakharmishra.tech/api/suggest-ideas/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get raw text for better error logging
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText.substring(0, 500)}`);
      }

      const result = await response.json();
      
      if (result.ideas && Array.isArray(result.ideas)) {
        const completeIdeas = result.ideas.filter(idea => idea.title && idea.short_description);
        setIdeas(completeIdeas);
      } else {
        setIdeas([]);
      }
      
      // Scroll to results after a short delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (idea) => {
    if (!formData.primary_category || !formData.ideal_creator) {
      setError("Please ensure 'Primary Category' and 'Ideal Creator' are filled out before getting details.");
      return;
    }

    if (!isAuthenticated) {
        setError("You must be logged in to get idea details. Please log in first.");
        return;
    }
    
    setSelectedIdea(idea);
    setDetailsLoading(true);
    setIdeaDetails(null);

    const payload = {
      topic: idea.title,
      description: idea.short_description,
      primary_category: formData.primary_category,
      ideal_creator: formData.ideal_creator,
      budget: formData.budget,
      resources: formData.resources.join(', ') || "basic setup",
      video_style: formData.video_style
    };

    try {
      const response = await customFetch('https://trendspark.prakharmishra.tech/api/get-idea-details/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setIdeaDetails(result.details || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="beginner-idea-generator">
      <h2>Content Idea Generator</h2>
      <form onSubmit={handleSubmit} className="idea-form">
        {/* Your form JSX remains unchanged */}
        <div className="form-group">
          <label htmlFor="primary_category">Primary Video Category (e.g., Gaming, Music)</label>
          <input type="text" id="primary_category" name="primary_category" value={formData.primary_category} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
            <label htmlFor="ideal_creator">Who is your ideal content creator (e.g., MrBeast, Marques Brownlee)?</label>
            <input type="text" id="ideal_creator" name="ideal_creator" value={formData.ideal_creator} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
            <label>Budget</label>
            <div className="radio-group">
                <label><input type="radio" name="budget" value="low" checked={formData.budget === 'low'} onChange={handleInputChange} /> Low</label>
                <label><input type="radio" name="budget" value="medium" checked={formData.budget === 'medium'} onChange={handleInputChange} /> Medium</label>
                <label><input type="radio" name="budget" value="high" checked={formData.budget === 'high'} onChange={handleInputChange} /> High</label>
            </div>
        </div>

        <div className="form-group">
            <label>Resources Available</label>
            <div className="checkbox-group">
                <label><input type="checkbox" name="resources" value="smartphone" onChange={handleCheckboxChange} checked={formData.resources.includes('smartphone')} /> Smartphone</label>
                <label><input type="checkbox" name="resources" value="camera" onChange={handleCheckboxChange} checked={formData.resources.includes('camera')} /> Camera</label>
                <label><input type="checkbox" name="resources" value="microphone" onChange={handleCheckboxChange} checked={formData.resources.includes('microphone')} /> Microphone</label>
                <label><input type="checkbox" name="resources" value="editing software" onChange={handleCheckboxChange} checked={formData.resources.includes('editing software')} /> Editing Software</label>
            </div>
        </div>

        <div className="form-group">
            <label>Preferred Video Style</label>
            <div className="radio-group">
                <label><input type="radio" name="video_style" value="short" checked={formData.video_style === 'short'} onChange={handleInputChange} /> Short</label>
                <label><input type="radio" name="video_style" value="long" checked={formData.video_style === 'long'} onChange={handleInputChange} /> Long</label>
            </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading || authLoading}>
          {loading ? 'Generating Ideas...' : authLoading ? 'Loading Auth...' : 'Generate Content Ideas'}
        </button>
      </form>

      {error && (
        <div className="error-message">Error: {error}</div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading">Generating ideas...</div>
          <p>Please wait while we create personalized content ideas for you.</p>
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
            <p>Preparing a detailed breakdown of your selected idea.</p>
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