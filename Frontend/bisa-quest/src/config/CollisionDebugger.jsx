import { useState } from 'react';
import './CollisionDebugger.css';

const CollisionDebugger = ({ 
  collisionZones, 
  playerPosition, 
  environmentType 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(0.3);
  const [showGrid, setShowGrid] = useState(true);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 10000,
          fontWeight: 'bold'
        }}
      >
        Show Debug
      </button>
    );
  }

  return (
    <>
      {/* Debug Control Panel */}
      <div className="debug-control-panel">
        <div className="debug-header">
          <h3>🐛 Collision Debugger</h3>
          <button onClick={() => setIsVisible(false)}>✕</button>
        </div>
        
        <div className="debug-info">
          <div className="info-row">
            <span className="label">Environment:</span>
            <span className="value">{environmentType}</span>
          </div>
          <div className="info-row">
            <span className="label">Player X:</span>
            <span className="value">{playerPosition.x.toFixed(2)}%</span>
          </div>
          <div className="info-row">
            <span className="label">Player Y:</span>
            <span className="value">{playerPosition.y.toFixed(2)}%</span>
          </div>
          <div className="info-row">
            <span className="label">Zones:</span>
            <span className="value">{collisionZones.length}</span>
          </div>
        </div>

        <div className="debug-controls">
          <label>
            Opacity:
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
            />
            <span>{(opacity * 100).toFixed(0)}%</span>
          </label>

          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            Show Grid
          </label>
        </div>

        <div className="debug-instructions">
          <h4>📝 Instructions:</h4>
          <ol>
            <li>Walk around to see player position</li>
            <li>Red boxes = collision zones</li>
            <li>Adjust opacity to see background</li>
            <li>Click zones to see coordinates</li>
            <li>Copy coordinates to config file</li>
          </ol>
        </div>

        <div className="debug-zone-list">
          <h4>Collision Zones:</h4>
          <div className="zone-list-scroll">
            {collisionZones.map((zone, i) => (
              <div key={i} className="zone-item">
                <div className="zone-name">
                  {i + 1}. {zone.name || 'Unnamed'}
                </div>
                <div className="zone-coords">
                  x: {zone.x}%, y: {zone.y}%<br/>
                  w: {zone.width}%, h: {zone.height}%
                </div>
                <button 
                  className="copy-btn"
                  onClick={() => {
                    const coords = `{ x: ${zone.x}, y: ${zone.y}, width: ${zone.width}, height: ${zone.height}, name: "${zone.name || 'Zone'}" }`;
                    navigator.clipboard.writeText(coords);
                    alert('Copied to clipboard!');
                  }}
                >
                  📋 Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Overlay */}
      {showGrid && (
        <div className="debug-grid">
          {/* Vertical lines every 10% */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="grid-line vertical"
              style={{ left: `${i * 10}%` }}
            >
              <span className="grid-label">{i * 10}</span>
            </div>
          ))}
          {/* Horizontal lines every 10% */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="grid-line horizontal"
              style={{ top: `${i * 10}%` }}
            >
              <span className="grid-label">{i * 10}</span>
            </div>
          ))}
        </div>
      )}

      {/* Collision Zone Overlays */}
      {collisionZones.map((zone, i) => (
        <div
          key={i}
          className="collision-zone-overlay"
          style={{
            position: 'absolute',
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            width: `${zone.width}%`,
            height: `${zone.height}%`,
            border: '2px solid red',
            background: `rgba(255, 0, 0, ${opacity})`,
            pointerEvents: 'all',
            zIndex: 999,
            cursor: 'pointer',
          }}
          onClick={() => {
            alert(`Zone #${i + 1}: ${zone.name}\nx: ${zone.x}%\ny: ${zone.y}%\nwidth: ${zone.width}%\nheight: ${zone.height}%`);
          }}
        >
          <div className="zone-label">
            #{i + 1}: {zone.name}
          </div>
          <div className="zone-corners">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
          </div>
        </div>
      ))}

      {/* Player Position Indicator */}
      <div
        className="player-debug-indicator"
        style={{
          position: 'absolute',
          left: `${playerPosition.x}%`,
          top: `${playerPosition.y}%`,
          width: '5%',
          height: '5%',
          border: '3px solid lime',
          background: 'rgba(0, 255, 0, 0.3)',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        <div className="player-crosshair">
          <div className="crosshair-h"></div>
          <div className="crosshair-v"></div>
        </div>
      </div>
    </>
  );
};

export default CollisionDebugger;