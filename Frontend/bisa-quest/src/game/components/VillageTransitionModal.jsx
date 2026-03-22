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
            <h2 className="house-door-title">
              What would you like to do next?
            </h2>
            <div className="house-door-options">
              <button
                className="house-door-btn"
                style={{ background: "#e0e0e0", borderColor: "#888", color: "#333", boxShadow: "0 6px 0 #999" }}
                onClick={onClose}
              >
                Stay and Explore
              </button>

              {allCompleted && (
                <button
                    className="house-door-btn"
                    style={{ background: "#4caf50", borderColor: "#1b5e20", color: "#fff", boxShadow: "0 6px 0 #2e7d32" }}
                    onClick={onProceedToForest}
                >
                    Proceed to Forest 🌲
                </button>
              )}

              {currentRoom !== 'bedroom' && (
                  <button
                    className="house-door-btn"
                    onClick={() => navigate("/student/bedroom", { state: { returnTo: location.pathname } })}
                  >
                    Go to Bedroom 🛏️
                  </button>
              )}
              {currentRoom !== 'kitchen' && (
                  <button
                    className="house-door-btn"
                    onClick={() => navigate("/student/kitchen", { state: { returnTo: location.pathname } })}
                  >
                    Go to Kitchen 🍳
                  </button>
              )}
              {currentRoom !== 'house' && (
                  <button
                    className="house-door-btn"
                    onClick={() => navigate("/student/house", { state: { returnTo: location.pathname } })}
                  >
                    Go to Living Room 🛋️
                  </button>
              )}
            </div>
          </div>
        </div>
    );
};

export default VillageTransitionModal;
