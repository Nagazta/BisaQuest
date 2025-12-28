// components/LoadingScreen.jsx
// Themed loading screen for BisaQuest

import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ message = "Loading BisaQuest..." }) => {
  return (
    <div className="loading-screen">
      <div className="loading-background"></div>
      
      <div className="loading-content">
        <h1 className="loading-title">BisaQuest</h1>
        
        <div className="loading-spinner-container">
          <div className="loading-spinner">
            <div className="spinner-coin"></div>
            <div className="spinner-coin"></div>
            <div className="spinner-coin"></div>
          </div>
        </div>
        
        <p className="loading-message">{message}</p>
        
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;