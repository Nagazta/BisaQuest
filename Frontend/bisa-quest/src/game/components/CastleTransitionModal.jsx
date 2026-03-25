import "../../pages/Village/HousePage.css";

const CastleTransitionModal = ({
  isOpen,
  sceneName = "this area",
  onStay,
  onGoBack,
  onNextScene,
  nextSceneName,
}) => {
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

            {/* Proceed to next scene (only shown when available) */}
            {onNextScene && nextSceneName && (
              <button
                className="house-door-btn house-door-btn--highlight"
                style={{ position: 'relative' }}
                onClick={onNextScene}
              >
                <div className="house-door-btn-badge">Next</div>
                <span className="house-door-btn-icon">🚪</span>
                <div className="house-door-btn-name" style={{ color: "#2e7d32" }}>
                  {nextSceneName}
                </div>
                <div className="house-door-btn-sub">Padayon sa sunod!</div>
              </button>
            )}

            {/* Go back to castle map */}
            <button className="house-door-btn house-door-btn--forest" onClick={onGoBack}>
              <span className="house-door-btn-icon">🏰</span>
              <div className="house-door-btn-name" style={{ color: "#6d4c1d" }}>Castle Map</div>
              <div className="house-door-btn-sub house-door-btn-sub--forest">Balik sa Kastilyo!</div>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CastleTransitionModal;
