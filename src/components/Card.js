import React from 'react';
import './Card.css';

const Card = ({ title, description, data }) => {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      {description && <p className="card-description">{description}</p>}
      
      {data && Object.keys(data).length > 0 && data.title !== title && (
        <div className="card-data">
          {Object.entries(data)
            .filter(([key]) => key !== 'title')
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
  );
};

export default Card;