// ─────────────────────────────────────────────────────────────────────────────
//  RiverFlowGame.jsx — "Flow Restoration"
//  3 obstacles block the river. Player clicks each obstacle to remove it.
//  Each removal reveals a flowing water segment. When all 3 are cleared →
//  synonym lesson → antonym lesson → done.
//  Plain deep-blue background (placeholder).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";

// ── River SVG ─────────────────────────────────────────────────────────────────
const RiverSVG = ({ clearedIds, obstacles, totalZones }) => {
  const clearedCount = clearedIds.size;
  // Wave animation style
  return (
    <svg width="280" height="90" viewBox="0 0 280 90" style={{ display: "block" }}>
      {/* River bed */}
      <path d="M 0 50 Q 70 30 140 50 Q 210 70 280 50 L 280 90 L 0 90 Z"
        fill="rgba(30,80,140,0.5)" />

      {/* Flowing segments (one per zone, from left to right) */}
      {[0, 1, 2].map((idx) => {
        const cleared = clearedIds.has(`o${idx + 1}`);
        const xStart = idx * 93 + 5;
        return (
          <g key={idx}>
            {/* Base water */}
            <path
              d={`M ${xStart} 52 Q ${xStart + 25} 40 ${xStart + 47} 52 Q ${xStart + 70} 64 ${xStart + 93} 52`}
              stroke={cleared ? "#29b6f6" : "rgba(100,160,200,0.3)"}
              strokeWidth={cleared ? 3 : 1.5}
              fill="none"
              strokeLinecap="round"
            />
            {/* Ripple lines when cleared */}
            {cleared && [8, 16, 24].map((dy) => (
              <path key={dy}
                d={`M ${xStart + dy} 56 Q ${xStart + dy + 10} 50 ${xStart + dy + 20} 56`}
                stroke="rgba(120,210,255,0.6)" strokeWidth="1.5" fill="none"
                strokeLinecap="round"
              />
            ))}
          </g>
        );
      })}

      {/* Current flow indicator */}
      {clearedCount > 0 && (
        <text x="140" y="80" textAnchor="middle" fontSize="11" fill="rgba(120,210,255,0.8)"
          fontFamily="'Pixelify Sans', sans-serif">
          {clearedCount === 3 ? "Nagaagay na! · Flowing!" : `${clearedCount}/3 cleared`}
        </text>
      )}
    </svg>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const RiverFlowGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, synonymDialogue, antonymDialogue, obstacles } = quest;

  const [stage,        setStage]        = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);
  const [cleared,      setCleared]      = useState(new Set());
  const [shakeId,      setShakeId]      = useState(null);

  const clearedCount = cleared.size;

  const currentLines =
    stage === "intro"           ? introDialogue   :
    stage === "synonym_lesson"  ? synonymDialogue :
    stage === "antonym_lesson"  ? antonymDialogue : null;

  const dialogueLine = currentLines?.[dialogueStep] ?? null;

  const handleDialogueNext = () => {
    if (!currentLines) return;
    if (dialogueStep < currentLines.length - 1) {
      setDialogueStep((s) => s + 1);
    } else {
      if (stage === "intro")            { setStage("playing");        setDialogueStep(0); }
      else if (stage === "synonym_lesson") { setStage("antonym_lesson"); setDialogueStep(0); }
      else if (stage === "antonym_lesson") { setStage("done"); }
    }
  };

  const handleObstacleClick = (id) => {
    if (stage !== "playing" || cleared.has(id)) return;
    const next = new Set([...cleared, id]);
    setCleared(next);
    if (next.size >= obstacles.length) {
      setTimeout(() => { setStage("synonym_lesson"); setDialogueStep(0); }, 800);
    }
  };

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
          background: "linear-gradient(160deg, #0a1a2e 0%, #0d2240 100%)",
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
              {/* River visual */}
              <div style={{ marginBottom: 24, zIndex: 2 }}>
                <RiverSVG clearedIds={cleared} obstacles={obstacles} totalZones={obstacles.length} />
              </div>

              {/* Obstacle buttons */}
              <div style={{ display: "flex", gap: 20, zIndex: 2 }}>
                {obstacles.map((obs) => {
                  const isCleared = cleared.has(obs.id);
                  return (
                    <div
                      key={obs.id}
                      onClick={() => handleObstacleClick(obs.id)}
                      style={{
                        width: 70, height: 70,
                        borderRadius: 14,
                        background: isCleared
                          ? "rgba(41,182,246,0.2)"
                          : "rgba(100,80,60,0.7)",
                        border: isCleared
                          ? "2px solid rgba(41,182,246,0.7)"
                          : "2px solid rgba(180,140,80,0.5)",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 4,
                        cursor: isCleared ? "default" : "pointer",
                        transition: "all 0.3s ease",
                        filter: isCleared ? "grayscale(1) opacity(0.5)" : "none",
                        transform: isCleared ? "scale(0.9)" : "scale(1)",
                        animation: shakeId === obs.id ? "pad-shake 0.4s ease" : undefined,
                      }}
                      title={obs.label}
                    >
                      <span style={{ fontSize: 26 }}>{isCleared ? "💧" : obs.emoji}</span>
                      <span style={{
                        fontSize: 9, color: isCleared ? "#29b6f6" : "#c8a870",
                        fontFamily: "'Pixelify Sans', sans-serif", textAlign: "center",
                        lineHeight: 1.2,
                      }}>
                        {isCleared ? "Tangtang na!" : obs.label}
                      </span>
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

          {/* Synonym lesson */}
          {stage === "synonym_lesson" && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
            }}>
              {/* Full flowing river */}
              <RiverSVG clearedIds={new Set(["o1","o2","o3"])} obstacles={obstacles} totalZones={3} />
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {["Nagaagay", "Naglihok", "Kusog"].map((w, i) => (
                  <React.Fragment key={w}>
                    <span style={{ color: "#80deea", fontSize: 13, fontFamily: "'Pixelify Sans', sans-serif", fontWeight: "bold" }}>{w}</span>
                    {i < 2 && <span style={{ color: "#29b6f6", fontSize: 18, fontWeight: "bold" }}>≈</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Antonym lesson */}
          {stage === "antonym_lesson" && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 28,
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 38 }}>🧱</div>
                <div style={{ color: "#ef9a9a", fontSize: 11, marginTop: 6, fontWeight: "bold" }}>Gibabagan / Blocked</div>
              </div>
              <span style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>↔</span>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 38, filter: "drop-shadow(0 0 10px rgba(41,182,246,0.9))" }}>🌊</div>
                <div style={{ color: "#80deea", fontSize: 11, marginTop: 6, fontWeight: "bold" }}>Nagaagay / Flowing</div>
              </div>
            </div>
          )}

          {/* Done */}
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
                  <span className="iqm-dialogue-bisaya">I-klik ang mga babag aron tangtangon! ({clearedCount}/{obstacles.length})</span>
                  <span className="iqm-dialogue-english">Click the obstacles to clear them! ({clearedCount}/{obstacles.length})</span>
                </>
              ) : stage === "done" ? (
                <>
                  <span className="iqm-dialogue-bisaya">Nakaagay na ang suba! 🌊</span>
                  <span className="iqm-dialogue-english">The river flows again! 🌊</span>
                </>
              ) : null}
            </div>
            {(stage === "intro" || stage === "synonym_lesson" || stage === "antonym_lesson") && (
              <button className="iqm-next-btn" onClick={handleDialogueNext}>▶</button>
            )}
            {stage === "done" && (
              <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pad-shake {
          0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  );
};

export default RiverFlowGame;
