import React from 'react';
import '../components/styles/ProgressBar.css';

const ProgressBar = ({ progress = 0, variant = 'default', showLabel = false }) => {
  return (
    <div className={`progress-bar-wrapper ${variant}`}>
      {showLabel && (
        <div className="progress-bar-label">
          <span className='progress-txt'> Progress</span>
          <span className="progress-bar-percentage">{progress}%</span>
        </div>
      )}
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        >
          {progress > 15 && !showLabel && (
            <span className="progress-text">{progress}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;