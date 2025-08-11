import React, { useEffect } from 'react';
import './IdeaDetails.css';

const IdeaDetails = ({ details, onClose }) => {
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
  if (!details) {
    return null;
  }

  return (
    <div className="idea-details-overlay" onClick={onClose}>
      <div className="idea-details-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        {/* --- UPDATED SECTION --- */}
        {/* We now get all data from the 'details' prop and use bracket notation */}
        
        <h2>{details['Video Title']}</h2>
        <p className="description">{details['Video Description']}</p>

        <div className="detail-section">
          <h3>Script Outline</h3>
          <p><strong>Hook:</strong> {details['Hook']}</p>
          <p><strong>Intro:</strong> {details['Intro']}</p>
        </div>

        <div className="detail-section">
          <h3>Main Content (Steps)</h3>
          <ul>
            {/* Map over the 'Main Content' array to create a list */}
            {details['Main Content']?.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
        
        <div className="detail-section">
          <h3>Conclusion</h3>
          <p><strong>Outro:</strong> {details['Outro']}</p>
          <p><strong>Call to Action:</strong> {details['Call to Action']}</p>
        </div>

        <div className="detail-section">
          <h3>Video Metadata</h3>
          <p><strong>Thumbnail Text:</strong> {details['Thumbnail Text']}</p>
          <p><strong>Hashtags:</strong> {details['Hashtags']}</p>
          {/* We can render the video tags in a more visual way if you like */}
          <p><strong>Video Tags:</strong> {details['Video Tags']?.join(', ')}</p>
        </div>

      </div>
    </div>
  );
};

export default IdeaDetails;