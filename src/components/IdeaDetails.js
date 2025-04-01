import React, { useEffect } from 'react';
import './IdeaDetails.css';

// Recursive function to handle deeply nested objects or arrays
const renderNestedObject = (obj) => {
  if (Array.isArray(obj)) {
    return (
      <ul>
        {obj.map((item, index) => (
          <li key={index}>{typeof item === 'object' ? renderNestedObject(item) : item}</li>
        ))}
      </ul>
    );
  } else if (typeof obj === 'object' && obj !== null) {
    return (
      <ul>
        {Object.entries(obj).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong>{' '}
            {typeof value === 'object' ? renderNestedObject(value) : value}
          </li>
        ))}
      </ul>
    );
  } else {
    return obj;
  }
};

const IdeaDetails = ({ idea, details, onClose }) => {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Ensure we have details to render
  if (!idea || !details) {
    return null;
  }

  return (
    <div className="idea-details-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="idea-details-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <h2>{idea.topic}</h2>
        <p className="description">{idea.short_description}</p>

        {details.usp && (
          <div className="detail-section">
            <h3>Unique Selling Point</h3>
            <p>{details.usp}</p>
          </div>
        )}

        {details['step-by-step_guide'] && (
          <div className="detail-section">
            <h3>Step-by-Step Guide</h3>
            <ul>
              {details['step-by-step_guide'].map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        {details.resources && (
          <div className="detail-section">
            <h3>Resources</h3>
            {renderNestedObject(details.resources)}
          </div>
        )}

        {details.performance_insights && (
          <div className="detail-section">
            <h3>Performance Insights</h3>
            {renderNestedObject(details.performance_insights)}
          </div>
        )}

        {details.pro_tips && (
          <div className="detail-section">
            <h3>Pro Tips</h3>
            <ul>
              {details.pro_tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {details.quote && (
          <div className="detail-section quote">
            <h3>Quote</h3>
            <blockquote>"{details.quote}"</blockquote>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaDetails;
