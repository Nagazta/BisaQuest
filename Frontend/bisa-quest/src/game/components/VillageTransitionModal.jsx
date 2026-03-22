import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { hasLibroPage, getLibroPageCountForEnv } from "../../utils/playerStorage";
import "../../pages/Village/HousePage.css";

const VillageTransitionModal = ({ isOpen, currentRoom, onClose, onProceedToForest }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    if (!isOpen) return null;

    const completedHouse = hasLibroPage('village', 'village_house');
    const completedBedroom = hasLibroPage('village', 'village_bedroom');
    const completedKitchen = hasLibroPage('village', 'village_kitchen');
    
    const allCompleted = getLibroPageCountForEnv('village') >= 3;

    return (
        <div className="house-door-overlay" onClick={onClose}>
          <div className="house-door-modal" onClick={e => e.stopPropagation()}>
            <button className="house-door-close" onClick={onClose}>✕</button>

            <div className="house-door-header">
              <div className="house-door-title">Asa ka muadto next? 🗺️</div>
            </div>

            <div className="house-door-body">
              <div className="house-door-grid">

                {currentRoom !== 'bedroom' && (
                  <button className="house-door-btn"
                    onClick={() => navigate("/student/bedroom", { state: { returnTo: location.pathname } })}>
                    <span className="house-door-btn-icon">🛏️</span>
                    <div className="house-door-btn-name">Kwarto</div>
                    <div className="house-door-btn-sub">Adto sa Bedroom!</div>
                  </button>
                )}

                {currentRoom !== 'kitchen' && (
                  <button className="house-door-btn"
                    onClick={() => navigate("/student/kitchen", { state: { returnTo: location.pathname } })}>
                    <span className="house-door-btn-icon">🍳</span>
                    <div className="house-door-btn-name">Kusina</div>
                    <div className="house-door-btn-sub">Adto sa Kitchen!</div>
                  </button>
                )}

                {currentRoom !== 'house' && (
                  <button className="house-door-btn"
                    onClick={() => navigate("/student/house", { state: { returnTo: location.pathname } })}>
                    <span className="house-door-btn-icon">🛋️</span>
                    <div className="house-door-btn-name">Sala</div>
                    <div className="house-door-btn-sub">Adto sa Living Room!</div>
                  </button>
                )}

                {allCompleted && (
                  <button className="house-door-btn house-door-btn--forest"
                    onClick={onProceedToForest}>
                    <span className="house-door-btn-icon">🌲</span>
                    <div className="house-door-btn-name" style={{ color: "#2d6a4f" }}>Forest</div>
                    <div className="house-door-btn-sub house-door-btn-sub--forest">Adto sa Kagubatan!</div>
                  </button>
                )}

              </div>

              <div className="house-door-divider" />

              <button className="house-door-stay" onClick={onClose}>
                🏠 Dili muna — Stay here
              </button>
            </div>
          </div>
        </div>
    );
};

export default VillageTransitionModal;
