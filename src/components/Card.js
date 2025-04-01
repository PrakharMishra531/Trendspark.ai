import React from 'react';
import './Card.css';

const Card = ({ title, description, data }) => {
  return (
    <div className="card">
      {data && data.thumbnail && (
        <div className="card-thumbnail">
          <img src={data.thumbnail} alt={title} />
        </div>
      )}
      
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        
        {description && (
          <div className="card-description">
            <p>{description}</p>
          </div>
        )}
        
        {data && Object.keys(data).length > 0 && data.title !== title && (
          <div className="card-data">
            {Object.entries(data)
              .filter(([key]) => !['title', 'description', 'thumbnail', 'id'].includes(key))
              .map(([key, value]) => (
                <div key={key} className="data-item">
                  <span className="data-key">{key}: </span>
                  <span className="data-value">
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;