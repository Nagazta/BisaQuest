import React, { useState, useRef, useEffect } from 'react';
import './InteractiveMap.css';
import './MapDebug.css';
import AssetManifest from "../services/AssetManifest";
import { isEnvironmentUnlocked } from '../utils/playerStorage';

// Quest ID → environment key
const QUEST_ENV = {
  1: 'village',
  2: 'forest',
  3: 'castle',
};

const InteractiveMap = ({ quests, onQuestClick, moduleProgress, devMode = false }) => {
  const [hoveredQuest, setHoveredQuest] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

  // Debug mode state
  const [debugMode, setDebugMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Pan/Drag state
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [dragStarted, setDragStarted] = useState(false);


  const clickableAreas = [
    {
      id: 1,
      name: "Village",
      title: "Vocabulary Quest",
      polygon: [
        { x: 38, y: 50 }, { x: 63, y: 50 },
        { x: 63, y: 80 }, { x: 38, y: 80 }
      ],
      center: { x: 27.5, y: 85 }
    },
    {
      id: 2,
      name: "Forest",
      title: "Synonyms & Antonyms Quest",
      polygon: [
        { x: 70, y: 20 }, { x: 70, y: 45 },
        { x: 45, y: 45 }, { x: 45, y: 20 }
      ],
      center: { x: 77.5, y: 72.5 }
    },
    {
      id: 3,
      name: "Castle",
      title: "Compound Quest",
      polygon: [
        { x: 40, y: 7 }, { x: 40, y: 29 },
        { x: 25, y: 29 }, { x: 25, y: 7 }
      ],
      center: { x: 25, y: 25 }
    },
  ];

  // ── Lock check — reads from playerStorage, bypassed in dev mode ────────────
  const isAreaLocked = (areaId) => {
    if (devMode) return false;
    const env = QUEST_ENV[areaId];
    return env ? !isEnvironmentUnlocked(env) : false;
  };

  // ── Tooltip lock message ───────────────────────────────────────────────────
  const getLockMessage = (areaId) => {
    if (areaId === 2) return "Complete 3 Village Scenarios to unlock";
    if (areaId === 3) return "Complete the Forest to unlock";
    return "Complete previous quest to unlock";
  };

  const isPointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const handleMouseDown = (e) => {
    setIsPanning(true);
    setDragStarted(false);
    setStartPan({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y });
  };

  const handleMouseMove = (e) => {
    if (debugMode && mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      setMousePosition({
        x: (((e.clientX - rect.left) / rect.width) * 100).toFixed(2),
        y: (((e.clientY - rect.top) / rect.height) * 100).toFixed(2),
      });
    }
    if (isPanning) {
      const rect = mapRef.current.getBoundingClientRect();
      let newX = e.clientX - startPan.x;
      let newY = e.clientY - startPan.y;
      newX = Math.max(0, Math.min(0, newX));
      newY = Math.max(0, Math.min(0, newY));
      if (Math.sqrt(Math.pow(newX - mapPosition.x, 2) + Math.pow(newY - mapPosition.y, 2)) > 5) setDragStarted(true);
      setMapPosition({ x: newX, y: newY });
    } else {
      handleMapHover(e);
    }
  };

  const handleMouseUp = (e) => {
    if (isPanning && !dragStarted) handleMapClick(e);
    setIsPanning(false);
    setDragStarted(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setDragStarted(false);
      setStartPan({ x: e.touches[0].clientX - mapPosition.x, y: e.touches[0].clientY - mapPosition.y });
    }
  };

  const handleTouchMove = (e) => {
    if (isPanning && e.touches.length === 1) {
      e.preventDefault();
      const rect = mapRef.current.getBoundingClientRect();
      let newX = e.touches[0].clientX - startPan.x;
      let newY = e.touches[0].clientY - startPan.y;
      newX = Math.max(0, Math.min(0, newX));
      newY = Math.max(0, Math.min(0, newY));
      if (Math.sqrt(Math.pow(newX - mapPosition.x, 2) + Math.pow(newY - mapPosition.y, 2)) > 5) setDragStarted(true);
      setMapPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = (e) => {
    if (isPanning && !dragStarted) handleMapClick(e.changedTouches[0]);
    setIsPanning(false);
    setDragStarted(false);
  };



  const handleMapClick = (e) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    for (let i = clickableAreas.length - 1; i >= 0; i--) {
      if (isPointInPolygon({ x, y }, clickableAreas[i].polygon)) {
        onQuestClick(clickableAreas[i].id);
        break;
      }
    }
  };

  const handleMapHover = (e) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    let found = null;
    for (let i = clickableAreas.length - 1; i >= 0; i--) {
      if (isPointInPolygon({ x, y }, clickableAreas[i].polygon)) { found = clickableAreas[i]; break; }
    }
    setHoveredQuest(found);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="interactive-map-container">

      {/* Debug Toggle */}
      {/* <button
        className={`debug-toggle ${debugMode ? 'active' : ''}`}
        onClick={() => setDebugMode(!debugMode)}
      >
        {debugMode ? '✓ Debug ON' : 'Debug OFF'}
      </button> */}

      {debugMode && (
        <div className="debug-info">
          <h4>🔧 Debug Mode</h4>
          <p className="coords">Mouse: x: {mousePosition.x}%, y: {mousePosition.y}%</p>

          <div className="area-info">
            <p><strong>Clickable Areas:</strong></p>
            {clickableAreas.map(area => (
              <p key={area.id}>{area.id}. {area.name} — {isAreaLocked(area.id) ? 'Locked' : 'Unlocked'}</p>
            ))}
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className={`map-wrapper ${isPanning ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setIsPanning(false); setHoveredQuest(null); }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}

      >
        <div
          className="map-content"
          style={{
            transform: `translate(${mapPosition.x}px, ${mapPosition.y}px)`,
            transition: isPanning ? 'none' : 'transform 0.3s ease',
          }}
        >
          <img src={AssetManifest.ui.dashboardMap} alt="Quest Map" className="map-image" draggable={false} />

          {/* Clickable area polygons */}
          <svg className="map-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            {clickableAreas.map((area) => {
              const locked = isAreaLocked(area.id);
              const isHovered = hoveredQuest?.id === area.id;
              return (
                <polygon
                  key={area.id}
                  points={area.polygon.map(p => `${p.x},${p.y}`).join(' ')}
                  className={`map-area ${isHovered ? 'hovered' : ''} ${locked ? 'locked' : 'unlocked'}`}
                  style={{
                    fill: isHovered ? (locked ? 'rgba(255,80,80,0.15)' : 'rgba(255,215,0,0.15)') : 'transparent',
                    stroke: isHovered ? (locked ? '#ff5050' : '#FFD700') : 'transparent',
                    strokeWidth: isHovered ? '0.3' : '0',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              );
            })}
          </svg>

          {/* Lock icons overlaid on locked areas */}
          <svg className="map-overlay map-lock-icons" viewBox="0 0 100 100" preserveAspectRatio="none">
            {clickableAreas.map((area) => {
              if (!isAreaLocked(area.id)) return null;
              // Place lock at center of each polygon bounding box
              const xs = area.polygon.map(p => p.x);
              const ys = area.polygon.map(p => p.y);
              const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
              const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
              return (
                <text
                  key={`lock-${area.id}`}
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="5"
                  style={{ pointerEvents: 'none', userSelect: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
                >

                </text>
              );
            })}
          </svg>

          {/* Debug overlay */}
          {debugMode && (
            <svg className="debug-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
              {clickableAreas.map((area) => (
                <g key={`debug-${area.id}`}>
                  <polygon points={area.polygon.map(p => `${p.x},${p.y}`).join(' ')} className="debug-area" />
                  <circle cx={area.center.x} cy={area.center.y} r="1" className="debug-center" />
                  <text x={area.center.x} y={area.center.y} className="debug-label">
                    {area.id}. {area.name}
                  </text>
                </g>
              ))}
            </svg>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredQuest && (
        <div
          className="map-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x + 20}px`,
            top: `${tooltipPosition.y - 20}px`,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <div className="tooltip-content">
            <h3>{hoveredQuest.title}</h3>
            <p className="tooltip-subtitle">{hoveredQuest.name} Theme</p>
            {(moduleProgress[hoveredQuest.id] || 0) > 0 && (
              <div className="tooltip-progress">
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${moduleProgress[hoveredQuest.id]}%` }} />
                </div>
                <span className="map-progress-text">{Math.round(moduleProgress[hoveredQuest.id])}% Complete</span>
              </div>
            )}
            {/* Lock message — only if actually locked */}
            {isAreaLocked(hoveredQuest.id) && (
              <p className="tooltip-locked">{getLockMessage(hoveredQuest.id)}</p>
            )}
            {/* Unlocked badge */}
            {!isAreaLocked(hoveredQuest.id) && hoveredQuest.id !== 1 && (
              <p className="tooltip-unlocked">Unlocked — Ready to explore!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;