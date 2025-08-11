import React, { useEffect } from 'react';
import './IdeaDetails.css';

const IdeaDetails = ({ details, onClose }) => {
  // All hooks must be at the top level
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!details) {
    return null;
  }

  // With a clean API, the component becomes simple and readable
  return (
    <div className="idea-details-overlay" onClick={onClose}>
      <div className="idea-details-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>{details.video_title}</h2>
        <p className="description">{details.video_description}</p>

        <div className="detail-section">
          <h3>Script Outline</h3>
          <p><strong>Hook:</strong> {details.hook}</p>
          <p><strong>Intro:</strong> {details.intro}</p>
        </div>

        <div className="detail-section">
          <h3>Main Content (Steps)</h3>
          <ul>
            {details.main_content?.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
        
        <div className="detail-section">
          <h3>Conclusion</h3>
          <p><strong>Outro:</strong> {details.outro}</p>
          <p><strong>Call to Action:</strong> {details.call_to_action}</p>
        </div>

        <div className="detail-section">
          <h3>Video Metadata</h3>
          <p><strong>Thumbnail Text:</strong> {details.thumbnail_text}</p>
          <p><strong>Hashtags:</strong> {details.hashtags}</p>
        </div>

      </div>
    </div>
  );
};

export default IdeaDetails;