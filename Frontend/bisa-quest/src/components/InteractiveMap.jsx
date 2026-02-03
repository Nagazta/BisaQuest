import React, { useState, useRef, useEffect } from 'react';
import './InteractiveMap.css';
import './MapDebug.css'; // Import debug styles
import DashboardMap from '../../src/assets/images/environments/Dashboard.png';

const InteractiveMap = ({ quests, onQuestClick, moduleProgress }) => {
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
  const [zoom, setZoom] = useState(1); // Start at 1x to show full image

  // Define clickable areas for each quest on the map
  // Coordinates are in percentages for responsiveness
  const clickableAreas = [
    {
      id: 1,
      name: "Village",
      title: "Vocabulary Quest",
      // Village area (bottom-left cluster of red houses)
      polygon: [
        { x: 23, y: 55 },
        { x: 40, y: 55 },
        { x: 40, y: 95 },
        { x: 23, y: 95 }
      ],
      center: { x: 27.5, y: 85 } // For tooltip positioning
    },
    {
      id: 2,
      name: "Forest",
      title: "Synonyms & Antonyms Quest",
      // Forest area (right side dense trees)
      polygon: [
        { x: 50, y: 50 },
        { x: 80, y: 50 },
        { x: 80, y: 100 },
        { x: 50, y: 100 }
      ],
      center: { x: 77.5, y: 72.5 }
    },
    {
      id: 3,
      name: "Castle",
      title: "Compound Quest",
      // Castle area (top-left with moat)
      polygon: [
        { x: 60, y:  0 },
        { x: 40, y:  0 },
        { x: 40, y: 25 },
        { x: 60, y: 25 }
      ],
      center: { x: 25, y: 25 }
    },
   
  ];

  // Check if a point is inside a polygon
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

  // Pan handlers
  const handleMouseDown = (e) => {
    setIsPanning(true);
    setDragStarted(false);
    setStartPan({
      x: e.clientX - mapPosition.x,
      y: e.clientY - mapPosition.y
    });
  };

  const handleMouseMove = (e) => {
  // Track mouse position for debug mode
  if (debugMode && mapRef.current) {
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x: x.toFixed(2), y: y.toFixed(2) });
  }

  if (isPanning) {
    const rect = mapRef.current.getBoundingClientRect();
    const mapContentWidth = rect.width * zoom;
    const mapContentHeight = rect.height * zoom;
    
    let newX = e.clientX - startPan.x;
    let newY = e.clientY - startPan.y;
    
    // Always constrain both X and Y to prevent white space
    const maxX = 0;
    const minX = -(mapContentWidth - rect.width);
    const maxY = 0;
    const minY = -(mapContentHeight - rect.height);
    
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));
    
    // Check if actually dragging (moved more than 5px)
    const dragDistance = Math.sqrt(
      Math.pow(newX - mapPosition.x, 2) + Math.pow(newY - mapPosition.y, 2)
    );
    
    if (dragDistance > 5) {
      setDragStarted(true);
    }
    
    setMapPosition({ x: newX, y: newY });
  } else {
    // Only show hover tooltip when not panning
    handleMapHover(e);
  }
};

  const handleMouseUp = (e) => {
    if (isPanning && !dragStarted) {
      // This was a click, not a drag
      handleMapClick(e);
    }
    setIsPanning(false);
    setDragStarted(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setDragStarted(false);
      setStartPan({
        x: e.touches[0].clientX - mapPosition.x,
        y: e.touches[0].clientY - mapPosition.y
      });
    }
  };

 const handleTouchMove = (e) => {
  if (isPanning && e.touches.length === 1) {
    e.preventDefault();
    
    const rect = mapRef.current.getBoundingClientRect();
    const mapContentWidth = rect.width * zoom;
    const mapContentHeight = rect.height * zoom;
    
    let newX = e.touches[0].clientX - startPan.x;
    let newY = e.touches[0].clientY - startPan.y;
    
    // Always constrain both X and Y to prevent white space
    const maxX = 0;
    const minX = -(mapContentWidth - rect.width);
    const maxY = 0;
    const minY = -(mapContentHeight - rect.height);
    
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));
    
    const dragDistance = Math.sqrt(
      Math.pow(newX - mapPosition.x, 2) + Math.pow(newY - mapPosition.y, 2)
    );
    
    if (dragDistance > 5) {
      setDragStarted(true);
    }
    
    setMapPosition({ x: newX, y: newY });
  }
};

  const handleTouchEnd = (e) => {
    if (isPanning && !dragStarted) {
      handleMapClick(e.changedTouches[0]);
    }
    setIsPanning(false);
    setDragStarted(false);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => {
      const newZoom = Math.min(prev + 0.2, 2);
      // Reset position when zooming to prevent going out of bounds
      constrainPosition(newZoom);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.2, 0.5);
      constrainPosition(newZoom);
      return newZoom;
    });
  };

  const constrainPosition = (newZoom) => {
  if (!mapRef.current) return;
  
  const rect = mapRef.current.getBoundingClientRect();
  const mapContentWidth = rect.width * newZoom;
  const mapContentHeight = rect.height * newZoom;
  
  const maxX = 0;
  const minX = -(mapContentWidth - rect.width);
  const maxY = 0;
  const minY = -(mapContentHeight - rect.height);
  
  setMapPosition(prev => ({
    x: Math.max(minX, Math.min(maxX, prev.x)),
    y: Math.max(minY, Math.min(maxY, prev.y))
  }));
};

  const handleResetView = () => {
    setZoom(1); // Reset to 1x to show full image
    setMapPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(2, zoom + delta));
    setZoom(newZoom);
    constrainPosition(newZoom);
  };

  const handleMapClick = (e) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check which area was clicked (in reverse order so smaller areas take priority)
    for (let i = clickableAreas.length - 1; i >= 0; i--) {
      const area = clickableAreas[i];
      if (isPointInPolygon({ x, y }, area.polygon)) {
        onQuestClick(area.id);
        break;
      }
    }
  };

  const handleMapHover = (e) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Find which area is being hovered
    let found = null;
    for (let i = clickableAreas.length - 1; i >= 0; i--) {
      const area = clickableAreas[i];
      if (isPointInPolygon({ x, y }, area.polygon)) {
        found = area;
        break;
      }
    }

    setHoveredQuest(found);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMapLeave = () => {
    setHoveredQuest(null);
  };

  // Get quest data
  const getQuestData = (questId) => {
    return quests.find(q => q.id === questId);
  };

  return (
    <div className="interactive-map-container">
      {/* Debug Toggle Button */}
      <button 
        className={`debug-toggle ${debugMode ? 'active' : ''}`}
        onClick={() => setDebugMode(!debugMode)}
      >
        {debugMode ? '✓ Debug ON' : 'Debug OFF'}
      </button>

      {/* Debug Info Panel */}
      {debugMode && (
        <div className="debug-info">
          <h4>🔧 Debug Mode</h4>
          <p className="coords">Mouse: x: {mousePosition.x}%, y: {mousePosition.y}%</p>
          <p>Zoom: {zoom.toFixed(2)}x</p>
          <div className="area-info">
            <p><strong>Clickable Areas:</strong></p>
            {clickableAreas.map(area => (
              <p key={area.id}>
                {area.id}. {area.name} - {area.polygon.length} points
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Pure Map - Click anywhere to interact, Drag to pan */}
      <div 
        ref={mapRef}
        className={`map-wrapper ${isPanning ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsPanning(false);
          setHoveredQuest(null);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div 
          className="map-content"
          style={{
            transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoom})`,
            transition: isPanning ? 'none' : 'transform 0.3s ease'
          }}
        >
          <img 
            src={DashboardMap}
            alt="Quest Map"
            className="map-image"
            draggable={false}
          />

          {/* Invisible clickable areas with subtle hover effect */}
          <svg className="map-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            {clickableAreas.map((area) => {
              const isLocked = area.id !== 1 && area.id !== 4;
              const isHovered = hoveredQuest?.id === area.id;

              return (
                <polygon
                  key={area.id}
                  points={area.polygon.map(p => `${p.x},${p.y}`).join(' ')}
                  className={`map-area ${isHovered ? 'hovered' : ''} ${isLocked ? 'locked' : 'unlocked'}`}
                  style={{
                    fill: isHovered ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
                    stroke: isHovered ? '#FFD700' : 'transparent',
                    strokeWidth: isHovered ? '0.3' : '0',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              );
            })}
          </svg>

          {/* Debug Overlay - Shows clickable areas */}
          {debugMode && (
            <svg className="debug-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
              {clickableAreas.map((area) => (
                <g key={`debug-${area.id}`}>
                  {/* Polygon outline */}
                  <polygon
                    points={area.polygon.map(p => `${p.x},${p.y}`).join(' ')}
                    className="debug-area"
                  />
                  {/* Center point */}
                  <circle
                    cx={area.center.x}
                    cy={area.center.y}
                    r="1"
                    className="debug-center"
                  />
                  {/* Label */}
                  <text
                    x={area.center.x}
                    y={area.center.y}
                    className="debug-label"
                  >
                    {area.id}. {area.name}
                  </text>
                </g>
              ))}
            </svg>
          )}
        </div>
      </div>

      {/* Tooltip on hover - only UI element */}
      {hoveredQuest && (
        <div 
          className="map-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x + 20}px`,
            top: `${tooltipPosition.y - 20}px`,
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          <div className="tooltip-content">
            <h3>{hoveredQuest.title}</h3>
            <p className="tooltip-subtitle">{hoveredQuest.name} Theme</p>
            {moduleProgress[hoveredQuest.id] > 0 && (
              <div className="tooltip-progress">
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${moduleProgress[hoveredQuest.id]}%` }}
                  />
                </div>
                <span className="progress-text">
                  {Math.round(moduleProgress[hoveredQuest.id])}% Complete
                </span>
              </div>
            )}
            {hoveredQuest.id !== 1 && hoveredQuest.id !== 4 && (
              <p className="tooltip-locked">🔒 Complete previous quest to unlock</p>
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default InteractiveMap;