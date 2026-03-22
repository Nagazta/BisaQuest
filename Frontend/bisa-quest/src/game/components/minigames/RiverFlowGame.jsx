// ─────────────────────────────────────────────────────────────────────────────
//  RiverFlowGame.jsx — "Flow Restoration"
//  3 obstacles block the river. Player holds down on each obstacle to remove it.
//  Obstacles use real image assets; fade out on removal.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback } from "react";
import riverGameBg from "../../../assets/images/environments/scenario/river-game.png";
import logImg from "../../../assets/items/log.png";
import driedGrass from "../../../assets/items/dried-grass.png";
import boulderImg from "../../../assets/items/boulder.png";

// Map obs.id → imported image
const OBSTACLE_IMAGES = {
  o1: boulderImg,
  o2: logImg,
  o3: driedGrass,
};

const HOLD_DURATION = 1200; // ms the player must hold to clear an obstacle

// ── Circular hold-progress ring ───────────────────────────────────────────────
const HoldRing = ({ progress }) => {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(progress, 1);
  return (
    <svg
      width={110} height={110}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {/* track */}
      <circle cx={55} cy={55} r={r} fill="none"
        stroke="rgba(255,255,255,0.2)" strokeWidth={5} />
      {/* fill */}
      <circle cx={55} cy={55} r={r} fill="none"
        stroke="#29b6f6" strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        style={{ transition: "stroke-dasharray 0.05s linear" }}
      />
    </svg>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const RiverFlowGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, completionDialogue, synonymDialogue, antonymDialogue, obstacles } = quest;

  const doneLines = completionDialogue
    || [...(synonymDialogue || []), ...(antonymDialogue || [])];

  const [stage, setStage] = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);
  const [cleared, setCleared] = useState(new Set());
  const [fading, setFading] = useState(new Set()); // ids currently fading out
  const [holding, setHolding] = useState({});        // { [id]: progress 0-1 }

  const holdTimers = useRef({});  // { [id]: intervalId }
  const holdStart = useRef({});  // { [id]: timestamp }

  const clearedCount = cleared.size;

  const currentLines = stage === "intro" ? introDialogue : stage === "done" ? doneLines : null;
  const dialogueLine = currentLines?.[dialogueStep] ?? null;

  const handleDialogueNext = () => {
    if (!currentLines) return;
    if (dialogueStep < currentLines.length - 1) {
      setDialogueStep((s) => s + 1);
    } else {
      if (stage === "intro") { setStage("playing"); setDialogueStep(0); }
      else if (stage === "done") onComplete(item);
    }
  };

  // ── Hold mechanics ────────────────────────────────────────────────────────
  const startHold = useCallback((id) => {
    if (stage !== "playing" || cleared.has(id) || fading.has(id)) return;
    holdStart.current[id] = performance.now();

    holdTimers.current[id] = setInterval(() => {
      const elapsed = performance.now() - holdStart.current[id];
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setHolding((prev) => ({ ...prev, [id]: progress }));

      if (progress >= 1) {
        clearInterval(holdTimers.current[id]);
        delete holdTimers.current[id];
        // Trigger fade
        setFading((prev) => new Set([...prev, id]));
        setHolding((prev) => { const n = { ...prev }; delete n[id]; return n; });
        // After fade completes, mark cleared
        setTimeout(() => {
          setCleared((prev) => {
            const next = new Set([...prev, id]);
            if (next.size >= obstacles.length) {
              setTimeout(() => { setStage("done"); setDialogueStep(0); }, 300);
            }
            return next;
          });
          setFading((prev) => { const n = new Set(prev); n.delete(id); return n; });
        }, 600);
      }
    }, 30);
  }, [stage, cleared, fading, obstacles.length]);

  const stopHold = useCallback((id) => {
    if (holdTimers.current[id]) {
      clearInterval(holdTimers.current[id]);
      delete holdTimers.current[id];
    }
    setHolding((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }, []);

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#0277bd" }}>Flow Restoration</span>
        </div>

        {/* ── Game Canvas ───────────────────────────────────────────────── */}
        <div className="iqm-scene-canvas" style={{
          background: `url(${riverGameBg}) center/cover no-repeat`,
          borderRadius: "12px", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          {/* Shimmer overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(41,182,246,0.04) 40px, rgba(41,182,246,0.04) 42px)",
            pointerEvents: "none",
          }} />

          {stage === "playing" && (
            <>
              {/* Obstacle images — huddled cluster */}
              <div style={{ position: "absolute", zIndex: 2, top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                {obstacles.map((obs) => {
                  const isCleared = cleared.has(obs.id);
                  const isFading = fading.has(obs.id);
                  const holdProg = holding[obs.id] ?? 0;

                  // Cluster just below the sweep progress pips (~top 30%)
                  const OFFSETS = [
                    { dx: -58, dy: 10 },  // o1 boulder – left
                    { dx: 0, dy: -8 },  // o2 log – centre
                    { dx: 58, dy: 10 },  // o3 dried grass – right
                  ];
                  const idx = obstacles.indexOf(obs);
                  const off = OFFSETS[idx] ?? { dx: 0, dy: 0 };
                  const anchorX = 50; // % – horizontally centred
                  const anchorY = 30; // % – just below pips

                  return (
                    <div
                      key={obs.id}
                      onMouseDown={() => startHold(obs.id)}
                      onMouseUp={() => stopHold(obs.id)}
                      onMouseLeave={() => stopHold(obs.id)}
                      onTouchStart={(e) => { e.preventDefault(); startHold(obs.id); }}
                      onTouchEnd={() => stopHold(obs.id)}
                      style={{
                        width: 250, height: 250,
                        borderRadius: 12,
                        position: "absolute",
                        left: `calc(${anchorX}% + ${off.dx}px)`,
                        top: `calc(${anchorY}% + ${off.dy}px)`,
                        transform: "translate(-50%, -50%)",
                        cursor: isCleared ? "default" : "pointer",
                        userSelect: "none",
                        opacity: isCleared ? 0 : isFading ? 0 : 1,
                        transition: isFading ? "opacity 0.6s ease" : "opacity 0.1s",
                        pointerEvents: isCleared ? "none" : "auto",
                      }}
                    >
                      {/* Image */}
                      {!isCleared && (
                        <img
                          src={OBSTACLE_IMAGES[obs.id]}
                          alt={obs.label}
                          draggable={false}
                          style={{
                            width: "100%", height: "100%",
                            objectFit: "contain",
                            borderRadius: 10,
                            filter: holdProg > 0
                              ? `brightness(${1 + holdProg * 0.4}) drop-shadow(0 0 ${Math.round(holdProg * 12)}px #29b6f6)`
                              : "drop-shadow(0 2px 6px rgba(0,0,0,0.55)) drop-shadow(0 0 8px rgba(255,240,180,0.18))",
                            transition: "filter 0.05s linear",
                          }}
                        />
                      )}

                      {/* Hold-progress ring */}
                      {holdProg > 0 && !isCleared && (
                        <HoldRing progress={holdProg} />
                      )}

                      {/* Label removed */}
                      {false && (
                        <div style={{
                          position: "absolute", bottom: -20, left: 0, right: 0,
                          textAlign: "center",
                          fontSize: 9, color: "#e0d4b0",
                          fontFamily: "'Pixelify Sans', sans-serif",
                          textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                          whiteSpace: "nowrap",
                        }}>
                          {obs.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress pips */}
              <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
                {obstacles.map((_, i) => (
                  <div key={i} className={`iqm-sweep-pip ${i < clearedCount ? "iqm-sweep-pip--done" : ""}`} />
                ))}
              </div>
            </>
          )}

          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🌊💧🌊</div>
                <div className="iqm-scene-success-text">Nakaagay na ang Suba! · River Restored!</div>
              </div>
            </div>
          )}
        </div>

        {/* ── NPC Dialogue ──────────────────────────────────────────────── */}
        <div className="iqm-dialogue-row">
          <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
          <div className="iqm-dialogue-bubble">
            <div className="iqm-dialogue-speaker">{npcName}</div>
            <div className="iqm-dialogue-text">
              {dialogueLine ? (
                <>
                  <span className="iqm-dialogue-bisaya">{dialogueLine.bisayaText}</span>
                  <span className="iqm-dialogue-english">{dialogueLine.englishText}</span>
                </>
              ) : stage === "playing" ? (
                <>
                  <span className="iqm-dialogue-bisaya">
                    Piksa ang mga babag — i-hold ang matag usa aron tangtangon! ({clearedCount}/{obstacles.length})
                  </span>
                  <span className="iqm-dialogue-english">
                    Hold down on each obstacle to clear it! ({clearedCount}/{obstacles.length})
                  </span>
                </>
              ) : null}
            </div>
            {(stage === "intro" || stage === "done") && (
              <button className="iqm-next-btn" onClick={handleDialogueNext}>
                {stage === "done" && dialogueStep === doneLines.length - 1 ? "✓" : "▶"}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes river-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(41,182,246,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(41,182,246,0); }
        }
      `}</style>
    </div>
  );
};

export default RiverFlowGame;
