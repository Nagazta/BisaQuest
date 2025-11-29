import React from 'react';
import '../components/styles/ProgressBar.css';

const ProgressBar = ({ progress = 0 }) => {
  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar-fill"
        style={{ width: `${progress}%` }}
      >
        {progress > 15 && (
          <span className="progress-text">{progress}%</span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
