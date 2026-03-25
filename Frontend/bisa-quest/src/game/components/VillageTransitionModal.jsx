import { useNavigate, useLocation } from "react-router-dom";
import { hasLibroPage, getLibroPageCountForEnv } from "../../utils/playerStorage";
import "../../pages/Village/HousePage.css";

const VillageTransitionModal = ({ isOpen, currentRoom, onClose, onProceedToForest }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    if (!isOpen) return null;

    const isBedroomComplete = hasLibroPage('village', 'village_bedroom');
    const isKitchenComplete = hasLibroPage('village', 'village_kitchen');
    const isHouseComplete = hasLibroPage('village', 'village_house');
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
                  <button className={`house-door-btn ${isBedroomComplete ? "house-door-btn--complete" : ""}`}
                    onClick={() => navigate("/student/bedroom", { state: { returnTo: location.pathname } })}>
                    {isBedroomComplete && <div className="house-door-btn-complete">✓ Complete</div>}
                    <span className="house-door-btn-icon">🛏️</span>
                    <div className="house-door-btn-name">Kwarto</div>
                    <div className="house-door-btn-sub">Adto sa Bedroom!</div>
                  </button>
                )}

                {currentRoom !== 'kitchen' && (
                  <button className={`house-door-btn ${isKitchenComplete ? "house-door-btn--complete" : ""}`}
                    onClick={() => navigate("/student/kitchen", { state: { returnTo: location.pathname } })}>
                    {isKitchenComplete && <div className="house-door-btn-complete">✓ Complete</div>}
                    <span className="house-door-btn-icon">🍳</span>
                    <div className="house-door-btn-name">Kusina</div>
                    <div className="house-door-btn-sub">Adto sa Kitchen!</div>
                  </button>
                )}

                {currentRoom !== 'house' && (
                  <button className={`house-door-btn ${isHouseComplete ? "house-door-btn--complete" : ""}`}
                    onClick={() => navigate("/student/house", { state: { returnTo: location.pathname } })}>
                    {isHouseComplete && <div className="house-door-btn-complete">✓ Complete</div>}
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

          {allCompleted && (
            <div className="house-door-note house-door-note--outside">
              If you want to proceed to the next stage enter <b>forest</b> <br/>
              or if you want to explore more on the house click <b>Stay here / Dili muna</b>
            </div>
          )}
        </div>
    );
};

export default VillageTransitionModal;
