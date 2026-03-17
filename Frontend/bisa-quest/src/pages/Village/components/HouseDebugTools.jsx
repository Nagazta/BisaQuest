import { useState } from "react";
import "./HouseDebugTools.css";

const HouseDebugTools = ({ debugMode, setDebugMode, selectedRegion, setSelectedRegion }) => {
  const [hoverCell, setHoverCell] = useState(null);

  return (
    <>
      {/* ── Debug toggle ─────────────────────────────────────────────────── */}
      <button
        className={`house-grid-btn ${debugMode ? "house-grid-btn--on" : ""}`}
        onClick={() => { setDebugMode(p => !p); setSelectedRegion(null); }}
      >
        {debugMode ? "📐 Debug ON" : "📐 Debug"}
      </button>

      {/* ── Debug grid ───────────────────────────────────────────────────── */}
      {debugMode && (
        <div
          className="house-grid-overlay"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverCell({
              x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
              y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
            });
          }}
          onMouseLeave={() => setHoverCell(null)}
        >
          {Array.from({ length: 11 }, (_, i) => (
            <div key={`v${i}`} className="house-grid-line house-grid-line--v" style={{ left: `${i * 10}%` }} />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <div key={`h${i}`} className="house-grid-line house-grid-line--h" style={{ top: `${i * 10}%` }} />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <span key={`xl${i}`} className="house-grid-label house-grid-label--x"
              style={{ left: `${i * 10 + 5}%`, top: 4 }}>{i * 10 + 5}</span>
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <span key={`yl${i}`} className="house-grid-label house-grid-label--y"
              style={{ top: `${i * 10 + 5}%`, left: 4 }}>{i * 10 + 5}</span>
          ))}
          {hoverCell && (
            <>
              <div className="house-grid-crosshair house-grid-crosshair--v" style={{ left: `${hoverCell.x}%` }} />
              <div className="house-grid-crosshair house-grid-crosshair--h" style={{ top: `${hoverCell.y}%` }} />
              <div className="house-grid-coord" style={{
                left: `${Math.min(hoverCell.x + 1, 70)}%`,
                top: `${Math.max(hoverCell.y - 7, 2)}%`,
              }}>
                x: {hoverCell.x}, y: {hoverCell.y}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Debug inspector ───────────────────────────────────────────────── */}
      {debugMode && selectedRegion && (
        <div className="house-debug-inspector">
          <button className="house-debug-inspector-close"
            onClick={() => setSelectedRegion(null)}>✕</button>
          <div className="house-debug-inspector-title">{selectedRegion.id}</div>
          <div className="house-debug-inspector-row">
            <span className="house-debug-inspector-key">Bisaya</span>
            <span className="house-debug-inspector-val">{selectedRegion.labelBisaya}</span>
          </div>
          <div className="house-debug-inspector-row">
            <span className="house-debug-inspector-key">English</span>
            <span className="house-debug-inspector-val">{selectedRegion.labelEnglish}</span>
          </div>
          <div className="house-debug-inspector-divider" />
          {["x", "y", "w", "h"].map(k => (
            <div key={k} className="house-debug-inspector-row">
              <span className="house-debug-inspector-key">{k}</span>
              <span className="house-debug-inspector-val house-debug-inspector-val--code">
                {selectedRegion[k]}%
              </span>
            </div>
          ))}
          <div className="house-debug-inspector-divider" />
          <div className="house-debug-inspector-copy"
            onClick={() => navigator.clipboard?.writeText(
              `x: ${selectedRegion.x}, y: ${selectedRegion.y}, w: ${selectedRegion.w}, h: ${selectedRegion.h}`
            )}>
            📋 Copy coords
          </div>
        </div>
      )}
    </>
  );
};

export default HouseDebugTools;
