import React, { useState } from 'react';
import Card from './Card';
import IdeaDetails from './IdeaDetails';
import './BeginnerIdeaGenerator.css';

const BeginnerIdeaGenerator = () => {
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
      video_style: formData.video_style
    };
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/suggest-ideas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      setIdeas(result.ideas || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching ideas:', err);
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
      const response = await fetch('http://127.0.0.1:8000/api/get-idea-details/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
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
      <h2>Beginner Content Idea Generator</h2>
      
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
      
      {loading && <div className="loading">Generating ideas...</div>}
      
      {ideas.length > 0 && (
        <div className="results-section">
          <h3>Content Ideas</h3>
          <div className="card-container">
            {ideas.map((idea, index) => (
              <div 
                key={index} 
                className="clickable-card"
                onClick={() => handleCardClick(idea)}
              >
                <Card
                  title={idea.topic}
                  description={idea.short_description}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {detailsLoading && <div className="loading">Loading idea details...</div>}
      
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