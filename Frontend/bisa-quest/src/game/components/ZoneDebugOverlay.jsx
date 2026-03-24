import { useState, useEffect } from "react";
import { ZONE_REGISTRY } from "../dragDropConstants";

const ZoneDebugOverlay = ({ activeZoneIds, containerRef }) => {
  const [cursorPct, setCursorPct] = useState(null);

  // Track cursor position as % of container so you can read exact coords
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      setCursorPct({
        x: (((e.clientX - rect.left) / rect.width) * 100).toFixed(1),
        y: (((e.clientY - rect.top) / rect.height) * 100).toFixed(1),
      });
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [containerRef]);

  return (
    <>
      {/* ── Zone overlays ────────────────────────────────────────────────── */}
      {Object.entries(ZONE_REGISTRY).map(([id, zone]) => {
        const isActive = activeZoneIds.includes(id);
        return (
          <div
            key={id}
            style={{
              position: "absolute",
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.w}%`,
              height: `${zone.h}%`,
              border: isActive ? "2px solid #00ff88" : "2px dashed #ff9900",
              background: isActive ? "rgba(0,255,136,0.12)" : "rgba(255,153,0,0.10)",
              boxSizing: "border-box",
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            {/* Zone id — top-left */}
            <span style={{
              position: "absolute", top: 2, left: 3,
              fontSize: "10px", fontWeight: "bold",
              color: isActive ? "#00ff88" : "#ff9900",
              background: "rgba(0,0,0,0.55)",
              padding: "1px 3px", borderRadius: 3, lineHeight: 1.2,
            }}>
              {id}
            </span>

            {/* Label — center */}
            <span style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              fontSize: "11px", fontWeight: "600", color: "#fff",
              background: "rgba(0,0,0,0.55)",
              padding: "2px 5px", borderRadius: 3, whiteSpace: "nowrap",
            }}>
              {zone.label}
            </span>

            {/* Coordinates — bottom-left */}
            <span style={{
              position: "absolute", bottom: 2, left: 3,
              fontSize: "9px", color: "#ddd",
              background: "rgba(0,0,0,0.55)",
              padding: "1px 3px", borderRadius: 3,
              lineHeight: 1.3, fontFamily: "monospace",
            }}>
              x{zone.x} y{zone.y} w{zone.w} h{zone.h}
            </span>

            {/* Active badge — top-right */}
            {isActive && (
              <span style={{
                position: "absolute", top: 2, right: 3,
                fontSize: "9px", color: "#00ff88",
                background: "rgba(0,0,0,0.55)",
                padding: "1px 3px", borderRadius: 3,
              }}>
                ● active
              </span>
            )}
          </div>
        );
      })}

      {/* ── Live cursor readout — top-center ─────────────────────────────── */}
      {cursorPct && (
        <div style={{
          position: "absolute", top: 6, left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.75)", color: "#fff",
          fontSize: "11px", fontFamily: "monospace",
          padding: "3px 8px", borderRadius: 4,
          pointerEvents: "none", zIndex: 100, whiteSpace: "nowrap",
        }}>
          x: {cursorPct.x}% &nbsp; y: {cursorPct.y}%
        </div>
      )}

      {/* ── Legend — bottom-left ──────────────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 6, left: 6,
        background: "rgba(0,0,0,0.75)", color: "#fff",
        fontSize: "10px", padding: "4px 8px", borderRadius: 4,
        pointerEvents: "none", zIndex: 100, lineHeight: 1.6,
      }}>
        <span style={{ color: "#00ff88" }}>█</span> active zone &nbsp;
        <span style={{ color: "#ff9900" }}>▨</span> inactive zone
      </div>
    </>
  );
};

export default ZoneDebugOverlay;