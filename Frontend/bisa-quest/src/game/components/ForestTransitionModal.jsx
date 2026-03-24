import "../../pages/Village/HousePage.css";

const ForestTransitionModal = ({ isOpen, sceneName = "this area", onStay, onGoBack }) => {
  if (!isOpen) return null;

  return (
    <div className="house-door-overlay" onClick={onStay}>
      <div className="house-door-modal" onClick={e => e.stopPropagation()}>
        <button className="house-door-close" onClick={onStay}>✕</button>

        <div className="house-door-header">
          <div className="house-door-title">Unsa ang sunod? 🗺️</div>
        </div>

        <div className="house-door-body">
          <div className="house-door-grid">

            {/* Stay and explore more */}
            <button className="house-door-btn" onClick={onStay}>
              <span className="house-door-btn-icon">🔍</span>
              <div className="house-door-btn-name">Explore Pa</div>
              <div className="house-door-btn-sub">Stay in {sceneName}!</div>
            </button>

            {/* Go back to forest map */}
            <button className="house-door-btn house-door-btn--forest" onClick={onGoBack}>
              <span className="house-door-btn-icon">🌲</span>
              <div className="house-door-btn-name" style={{ color: "#2d6a4f" }}>Forest Map</div>
              <div className="house-door-btn-sub house-door-btn-sub--forest">Balik sa Kagubatan!</div>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForestTransitionModal;
