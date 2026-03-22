// ─────────────────────────────────────────────────────────────────────────────
//  CaveLightGame.jsx — "Firefly Line-Up"
//  Drag 6 animated fireflies onto a diagonal guide line (smallest → largest)
//  to illuminate the Dark Cave.
//
//  Flow: intro → playing → checking → feedback (if wrong) / done (if correct)
//
//  Drag: pointer-events (same pattern as FrogBridgeGame).
//  Each firefly has a continuous CSS float animation while not placed.
//  Drop zones sit along a diagonal SVG guide line at low opacity.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback, useEffect } from "react";
import caveGameBg   from "../../../assets/images/environments/scenario/dark-cave-game.png";
import glowingCaveBg from "../../../assets/items/glowing-cave.png";
import fireflyImg   from "../../../assets/items/firefly.png";

// ── Firefly sizes (px widths) in correct order smallest → largest ─────────────
const FIREFLY_SIZES = [24, 34, 44, 56, 68, 80];

// Starting scattered positions (% of canvas). Each has { left, top }.
// These are the idle float anchor points — CSS animation adds ±6px oscillation.
const IDLE_POSITIONS = [
  { left: 12, top: 22 },
  { left: 75, top: 18 },
  { left: 88, top: 50 },
  { left: 60, top: 72 },
  { left: 30, top: 65 },
  { left: 18, top: 45 },
];

// ── Diagonal guide line endpoints (% of canvas) ───────────────────────────────
// Start: bottom-left area → End: upper-right centre (pointing toward cave mouth)
const LINE_START = { x: 8,  y: 88 };
const LINE_END   = { x: 62, y: 28 };

// Compute 6 evenly-spaced drop zone centres along the line
function computeZoneCentres() {
  const zones = [];
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    zones.push({
      x: LINE_START.x + (LINE_END.x - LINE_START.x) * t,
      y: LINE_START.y + (LINE_END.y - LINE_START.y) * t,
    });
  }
  return zones;
}
const ZONE_CENTRES = computeZoneCentres();
const DROP_RADIUS_PX = 38; // px — how close a firefly centre must be to snap

// ── Shuffle helper ─────────────────────────────────────────────────────────────
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build initial firefly objects with shuffled sizes
function buildFireflies() {
  const order = shuffled([0, 1, 2, 3, 4, 5]); // index into FIREFLY_SIZES
  return order.map((sizeIdx, i) => ({
    id: i,                     // stable id
    sizeIdx,                   // index into FIREFLY_SIZES
    size:  FIREFLY_SIZES[sizeIdx],
    idlePos: IDLE_POSITIONS[i], // anchor for float animation
    cur: { ...IDLE_POSITIONS[i] }, // current rendered position (% of canvas)
    placed: false,             // true once snapped into a zone
    zoneIdx: null,             // which zone it is in
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────
const CaveLightGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const {
    introDialogue,
    feedbackDialogue,
    completionDialogue,
    synonymDialogue,
    antonymDialogue,
  } = quest;

  const doneLines = completionDialogue
    || [...(synonymDialogue || []), ...(antonymDialogue || [])];

  const [stage,        setStage]        = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);
  const [fireflies,    setFireflies]    = useState(() => buildFireflies());
  const [zones,        setZones]        = useState(Array(6).fill(null)); // zone[i] = fireflyId or null
  const [draggingId,   setDraggingId]   = useState(null);

  const canvasRef   = useRef(null);
  const dragOffset  = useRef({ x: 0, y: 0 });

  // Track dragging state in a ref too (stable for pointer callbacks)
  const draggingIdRef = useRef(null);
  useEffect(() => { draggingIdRef.current = draggingId; }, [draggingId]);

  // ── Dialogue helpers ──────────────────────────────────────────────────────
  const currentLines =
    stage === "intro"     ? introDialogue :
    stage === "feedback"  ? feedbackDialogue :
    stage === "done"      ? doneLines :
    null;
  const dialogueLine = currentLines?.[dialogueStep] ?? null;

  const handleDialogueNext = () => {
    if (!currentLines) return;
    if (dialogueStep < currentLines.length - 1) {
      setDialogueStep(s => s + 1);
    } else {
      if (stage === "intro") {
        setStage("playing");
        setDialogueStep(0);
      } else if (stage === "feedback") {
        // Reset fireflies back to idle positions
        setFireflies(buildFireflies());
        setZones(Array(6).fill(null));
        setStage("playing");
        setDialogueStep(0);
      } else if (stage === "done") {
        onComplete(item);
      }
    }
  };

  // ── Drag helpers ──────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e, flyId) => {
    if (stage !== "playing") return;
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top  - rect.height / 2,
    };

    // Remove from zone if was placed
    setZones(prev => {
      const next = [...prev];
      for (let i = 0; i < next.length; i++) {
        if (next[i] === flyId) next[i] = null;
      }
      return next;
    });
    setFireflies(prev => prev.map(f =>
      f.id === flyId ? { ...f, placed: false, zoneIdx: null } : f
    ));
    setDraggingId(flyId);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [stage]);

  const handlePointerMove = useCallback((e) => {
    const flyId = draggingIdRef.current;
    if (flyId === null) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();

    const leftPct = ((e.clientX - dragOffset.current.x - cr.left) / cr.width)  * 100;
    const topPct  = ((e.clientY - dragOffset.current.y - cr.top)  / cr.height) * 100;

    setFireflies(prev => prev.map(f =>
      f.id === flyId
        ? { ...f, cur: {
            left: Math.min(Math.max(leftPct, 2), 96),
            top:  Math.min(Math.max(topPct,  2), 95),
          }}
        : f
    ));
  }, []);

  const handlePointerUp = useCallback((e) => {
    const flyId = draggingIdRef.current;
    if (flyId === null) return;

    try { e?.currentTarget?.releasePointerCapture(e.pointerId); } catch (_) {}
    setDraggingId(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();

    // Centre of released position in px relative to canvas
    const relX = e.clientX - dragOffset.current.x - cr.left;
    const relY = e.clientY - dragOffset.current.y - cr.top;

    // Find nearest empty zone within DROP_RADIUS_PX
    let bestZone = null;
    let bestDist = DROP_RADIUS_PX;

    ZONE_CENTRES.forEach((zc, zi) => {
      const zpx = zc.x / 100 * cr.width;
      const zpy = zc.y / 100 * cr.height;
      const dist = Math.hypot(relX - zpx, relY - zpy);
      if (dist < bestDist) {
        bestDist = dist;
        bestZone = zi;
      }
    });

    // Check if best zone is occupied
    setZones(prevZones => {
      if (bestZone === null || prevZones[bestZone] !== null) {
        // Snap back to idle
        setFireflies(prev => prev.map(f =>
          f.id === flyId ? { ...f, cur: { ...f.idlePos }, placed: false } : f
        ));
        return prevZones;
      }

      // Snap into zone
      const newZones = [...prevZones];
      newZones[bestZone] = flyId;

      setFireflies(prev => prev.map(f =>
        f.id === flyId
          ? { ...f, placed: true, zoneIdx: bestZone,
              cur: { ...ZONE_CENTRES[bestZone] } }
          : f
      ));

      // Check if all zones filled
      const allFilled = newZones.every(z => z !== null);
      if (allFilled) {
        setStage("checking"); // block dragging while checking

        // Actual check deferred with setTimeout so state settles
        setTimeout(() => {
          setFireflies(latestFlies => {
            const isCorrect = newZones.every((fId, zi) => {
              const fly = latestFlies.find(f => f.id === fId);
              return fly && fly.sizeIdx === zi;
            });

            if (isCorrect) {
              setTimeout(() => { setStage("done"); setDialogueStep(0); }, 600);
            } else {
              setTimeout(() => { setStage("feedback"); setDialogueStep(0); }, 600);
            }
            return latestFlies;
          });
        }, 100);
      }

      return newZones;
    });
  }, []);

  const placedCount = zones.filter(z => z !== null).length;
  const isGlowing   = stage === "done";

  // ── Playing stage dialogue ─────────────────────────────────────────────────
  const playingDialogueLine = {
    bisayaText:  `I-drag ang mga alitaptap gikan gamay ngadto sa dako! (${placedCount}/6)`,
    englishText: `Drag the fireflies from smallest to largest! (${placedCount}/6)`,
  };

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background:"#1a237e", color:"#e8eaf6" }}>Firefly Line-Up</span>
        </div>

        {/* ── Game Canvas ──────────────────────────────────────────────────── */}
        <div
          ref={canvasRef}
          className="iqm-scene-canvas"
          style={{
            background: `url(${isGlowing ? glowingCaveBg : caveGameBg}) center/cover no-repeat`,
            borderRadius: "12px",
            position: "relative",
            overflow: "hidden",
            transition: "background 0.6s ease",
            userSelect: "none",
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* ── SVG guide line + drop zones ──────────────────────────────── */}
          {(stage === "playing" || stage === "checking" || stage === "feedback") && (
            <svg
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                pointerEvents: "none",
                zIndex: 3,
                opacity: 0.38,
              }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Dashed diagonal guide line */}
              <line
                x1={LINE_START.x} y1={LINE_START.y}
                x2={LINE_END.x}   y2={LINE_END.y}
                stroke="rgba(255,230,120,0.9)"
                strokeWidth="0.6"
                strokeDasharray="2 1.5"
              />
              {/* Drop zone circles */}
              {ZONE_CENTRES.map((zc, zi) => (
                <g key={zi}>
                  <circle
                    cx={zc.x} cy={zc.y} r="3.8"
                    fill={zones[zi] !== null ? "rgba(255,220,80,0.3)" : "rgba(40,20,80,0.45)"}
                    stroke="rgba(255,220,80,0.75)"
                    strokeWidth="0.5"
                  />
                  {/* Zone number */}
                  <text
                    x={zc.x} y={zc.y + 1.1}
                    textAnchor="middle"
                    fontSize="2.8"
                    fill="rgba(255,230,150,0.85)"
                    fontFamily="'Pixelify Sans', sans-serif"
                  >
                    {zi + 1}
                  </text>
                </g>
              ))}
            </svg>
          )}

          {/* ── Fireflies ─────────────────────────────────────────────────── */}
          {(stage === "playing" || stage === "checking" || stage === "feedback") &&
            fireflies.map(fly => {
              const isDragging = draggingId === fly.id;
              return (
                <div
                  key={fly.id}
                  onPointerDown={e => handlePointerDown(e, fly.id)}
                  style={{
                    position: "absolute",
                    left: `${fly.cur.left}%`,
                    top:  `${fly.cur.top}%`,
                    transform: "translate(-50%, -50%)",
                    width: fly.size,
                    height: fly.size,
                    zIndex: isDragging ? 30 : fly.placed ? 10 : 12,
                    cursor: stage !== "playing" ? "default" : isDragging ? "grabbing" : "grab",
                    touchAction: "none",
                    userSelect: "none",
                    transition: isDragging
                      ? "none"
                      : fly.placed
                        ? "left 0.35s ease, top 0.35s ease"
                        : "left 0.5s ease, top 0.5s ease",
                    filter: fly.placed
                      ? `drop-shadow(0 0 ${fly.size * 0.18}px rgba(255,230,80,0.9))`
                      : "drop-shadow(0 0 6px rgba(180,255,150,0.75))",
                    animation: fly.placed || isDragging
                      ? "none"
                      : `ff-float-${fly.id % 3} ${2.4 + (fly.id % 3) * 0.5}s ease-in-out infinite alternate`,
                    pointerEvents: stage !== "playing" ? "none" : "auto",
                  }}
                >
                  <img
                    src={fireflyImg}
                    alt="firefly"
                    draggable={false}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                </div>
              );
            })
          }

          {/* ── Success overlay (shown when done, behind dialogue) ───────── */}
          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">✨🌟✨</div>
                <div className="iqm-scene-success-text">Hayag na ang Langob! · Cave Illuminated!</div>
              </div>
            </div>
          )}
        </div>

        {/* ── NPC Dialogue ─────────────────────────────────────────────────── */}
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
              ) : stage === "playing" || stage === "checking" ? (
                <>
                  <span className="iqm-dialogue-bisaya">{playingDialogueLine.bisayaText}</span>
                  <span className="iqm-dialogue-english">{playingDialogueLine.englishText}</span>
                </>
              ) : null}
            </div>
            {(stage === "intro" || stage === "feedback" || stage === "done") && (
              <button className="iqm-next-btn" onClick={handleDialogueNext}>
                {stage === "done" && dialogueStep === doneLines.length - 1 ? "✓" : "▶"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Float keyframes (3 variants) ─────────────────────────────────────── */}
      <style>{`
        @keyframes ff-float-0 {
          from { transform: translate(-50%, -50%) translateY(0px)   rotate(-4deg); }
          to   { transform: translate(-50%, -50%) translateY(-8px)  rotate(4deg);  }
        }
        @keyframes ff-float-1 {
          from { transform: translate(-50%, -50%) translateY(-5px)  rotate(3deg);  }
          to   { transform: translate(-50%, -50%) translateY(5px)   rotate(-3deg); }
        }
        @keyframes ff-float-2 {
          from { transform: translate(-50%, -50%) translateY(4px)   rotate(-2deg); }
          to   { transform: translate(-50%, -50%) translateY(-7px)  rotate(5deg);  }
        }
      `}</style>
    </div>
  );
};

export default CaveLightGame;
