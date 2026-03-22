// ─────────────────────────────────────────────────────────────────────────────
//  FishPairGame.jsx — "Fish Family Sort"
//  Drag 6 baby fish to the correct mother (small vs big).
//  Flow: intro dialogue → playing → done.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback, useEffect } from "react";
import fishGameBg from "../../../assets/images/environments/scenario/fish-game.png";
import fish4 from "../../../assets/items/fish-4.png";   // small baby fish
import fish5 from "../../../assets/items/fish-5.png";   // big baby fish

// ── helpers ───────────────────────────────────────────────────────────────────
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Wrong-drop feedback pool (NPC lines)
const WRONG_LINES = [
  {
    bisayaText: "Wala niya makilala ang iyang mama! Milayas siya balik!",
    englishText: "It didn't recognize its mother! It swam away!",
  },
  {
    bisayaText: "Sayop! Dili kini ang iyang pamilya. Mibalik siya!",
    englishText: "Wrong! That's not its family. It swam back!",
  },
  {
    bisayaText: "Nahadlok ang gamayng isda — gipalayo sa maling mama!",
    englishText: "The little fish got scared — chased off by the wrong mother!",
  },
  {
    bisayaText: "Wala ma-accept! Milayas ang isda!",
    englishText: "Not accepted! The fish swam away!",
  },
];

// ── Swimming animation keyframes injected once ────────────────────────────────
const SWIM_STYLE = `
  @keyframes fish-swim {
    0%   { transform: translate(-50%,-50%) translateX(0px) translateY(0px) rotate(0deg); }
    20%  { transform: translate(-50%,-50%) translateX(5px)  translateY(-4px) rotate(3deg); }
    40%  { transform: translate(-50%,-50%) translateX(-4px) translateY(3px)  rotate(-2deg); }
    60%  { transform: translate(-50%,-50%) translateX(6px)  translateY(2px)  rotate(2deg); }
    80%  { transform: translate(-50%,-50%) translateX(-3px) translateY(-3px) rotate(-3deg); }
    100% { transform: translate(-50%,-50%) translateX(0px)  translateY(0px)  rotate(0deg); }
  }
  @keyframes zone-shake {
    0%,100% { transform: scale(1); }
    20%     { transform: scale(1.06) rotate(-4deg); }
    40%     { transform: scale(1.06) rotate(4deg); }
    60%     { transform: scale(1.03) rotate(-3deg); }
    80%     { transform: scale(1.03) rotate(3deg); }
  }
  @keyframes zone-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
    50%     { box-shadow: 0 0 16px 4px rgba(255,255,150,0.35); }
  }
  @keyframes placed-pop {
    0%   { transform: translate(-50%,-50%) scale(0.6); opacity:0.5; }
    60%  { transform: translate(-50%,-50%) scale(1.15); opacity:1; }
    100% { transform: translate(-50%,-50%) scale(1); opacity:1; }
  }
`;

// ── Drop zone (transparent, faint outline) ───────────────────────────────────
const DropZone = ({ shaking }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      borderRadius: 14,
      border: "2px dashed rgba(255, 239, 100, 0.27)",
      background: "rgba(255,255,255,0.03)",
      animation: shaking
        ? "zone-shake 0.45s ease"
        : "zone-pulse 2.5s ease-in-out infinite",
      transition: "border-color 0.2s",
    }}
  />
);



// ── Component ─────────────────────────────────────────────────────────────────
const FishPairGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, completionDialogue, synonymDialogue, antonymDialogue, babyFish } = quest;

  const doneLines = completionDialogue
    || [...(synonymDialogue || []), ...(antonymDialogue || [])];

  const [stage, setStage] = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);
  const [babies, setBabies] = useState(() => shuffle(babyFish.map(f => ({ ...f, placed: false }))));
  const [draggedId, setDraggedId] = useState(null);
  const [positions, setPositions] = useState({});
  const [shakeZone, setShakeZone] = useState(null); // "small" | "big"
  const [wrongLine, setWrongLine] = useState(null); // { bisayaText, englishText }

  // Stable swim animation params (computed once, not on every render)
  const swimParams = useRef(
    Object.fromEntries(
      babyFish.map(f => [f.id, {
        duration: (3 + Math.random() * 2).toFixed(2) + "s",
        delay: (Math.random() * 1.5).toFixed(2) + "s",
      }])
    )
  );

  const containerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const wrongTimer = useRef(null);

  // Scatter positions (in % of container)
  useEffect(() => {
    const pos = {};
    babyFish.forEach((f, i) => {
      // Scatter across the middle band (x 27–73%, y 15–85%), avoiding the drop zone columns
      pos[f.id] = {
        x: 27 + Math.random() * 46,
        y: 15 + Math.random() * 70,
      };
    });
    setPositions(pos);
  }, []);

  const placed = babies.filter(b => b.placed);
  const unplaced = babies.filter(b => !b.placed);
  const smallPlaced = placed.filter(b => b.size === "small").length;
  const bigPlaced = placed.filter(b => b.size === "big").length;

  const currentLines = stage === "intro" ? introDialogue : stage === "done" ? doneLines : null;
  const dialogueLine = currentLines?.[dialogueStep] ?? null;

  // Show wrong-drop line temporarily, overriding the instruction line
  const showWrong = (line) => {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    setWrongLine(line);
    wrongTimer.current = setTimeout(() => setWrongLine(null), 2800);
  };

  const handleDialogueNext = () => {
    if (!currentLines) return;
    if (dialogueStep < currentLines.length - 1) {
      setDialogueStep(s => s + 1);
    } else {
      if (stage === "intro") { setStage("playing"); setDialogueStep(0); }
      else if (stage === "done") onComplete(item);
    }
  };

  // ── pointer handlers ────────────────────────────────────────────────────────
  const handlePointerDown = (id, e) => {
    if (stage !== "playing") return;
    const baby = babies.find(b => b.id === id);
    if (baby?.placed) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    };
    setDraggedId(id);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (id, e) => {
    if (draggedId !== id) return;
    e.preventDefault();
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - dragOffset.current.x - r.left) / r.width) * 100;
    const y = ((e.clientY - dragOffset.current.y - r.top) / r.height) * 100;
    setPositions(prev => ({
      ...prev,
      [id]: { x: Math.min(Math.max(x, 1), 99), y: Math.min(Math.max(y, 1), 99) },
    }));
  };

  const handlePointerUp = useCallback((id, e) => {
    if (draggedId !== id) return;
    setDraggedId(null);
    try { e?.currentTarget?.releasePointerCapture(e.pointerId); } catch (_) { }

    const baby = babies.find(b => b.id === id);
    const pos = positions[id];
    if (!baby || !pos) return;

    // Drop zones:
    //   Small-mother zone: left column  x < 24%, y 25–85%
    //   Big-mother zone:   right column x > 76%, y 25–85%
    const inSmall = pos.x < 24 && pos.y > 25 && pos.y < 85;
    const inBig = pos.x > 76 && pos.y > 25 && pos.y < 85;

    const correct =
      (inSmall && baby.size === "small") ||
      (inBig && baby.size === "big");

    const wrongZone =
      (inSmall && baby.size !== "small") ||
      (inBig && baby.size !== "big");

    if (correct) {
      // Snap fish to a random spot inside the correct zone column, then mark placed
      const zoneX = inSmall
        ? 2 + Math.random() * 18   // left zone: 2–20%
        : 78 + Math.random() * 18;  // right zone: 78–96%
      const zoneY = 28 + Math.random() * 52;  // 28–80% vertically
      setPositions(prev => ({ ...prev, [id]: { x: zoneX, y: zoneY } }));
      const next = babies.map(b => b.id === id ? { ...b, placed: true } : b);
      setBabies(next);
      const allDone =
        next.filter(b => b.size === "small").every(b => b.placed) &&
        next.filter(b => b.size === "big").every(b => b.placed);
      if (allDone) setTimeout(() => { setStage("done"); setDialogueStep(0); }, 600);
    } else if (wrongZone) {
      const zone = inSmall ? "small" : "big";
      setShakeZone(zone);
      setTimeout(() => setShakeZone(null), 500);
      const line = WRONG_LINES[Math.floor(Math.random() * WRONG_LINES.length)];
      showWrong(line);
      // Bounce back to a random center position
      setPositions(prev => ({
        ...prev,
        [id]: {
          x: 27 + Math.random() * 46,
          y: 15 + Math.random() * 70,
        },
      }));
    }
    // else: dropped in open water — stays put, no feedback
  }, [draggedId, positions, babies]);

  // ── render ──────────────────────────────────────────────────────────────────
  const displayLine = wrongLine
    ? wrongLine
    : dialogueLine
      ? dialogueLine
      : stage === "playing"
        ? {
          bisayaText: `I-drag ang mga bata nga isda sa ilang mama! (${placed.length}/6)`,
          englishText: `Drag the baby fish to their mother! (${placed.length}/6)`,
        }
        : null;

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#1565c0", color: "#e3f2fd", borderColor: "#42a5f5" }}>
            Fish Reunite
          </span>
        </div>

        {/* ── Scene canvas ───────────────────────────────────────────────── */}
        <div
          className="iqm-scene-canvas"
          ref={containerRef}
          style={{
            background: `url(${fishGameBg}) center/cover no-repeat`,
            borderRadius: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {stage === "playing" && (<>

            {/* ── Progress pips ──────────────────────────────────────────── */}
            <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
              {babies.map((b, i) => (
                <div key={i} className={`iqm-sweep-pip ${b.placed ? "iqm-sweep-pip--done" : ""}`} />
              ))}
            </div>

            {/* ── Small mother zone (left column) ────────────────────────────── */}
            <div
              style={{
                position: "absolute",
                left: "1%",
                top: "25%",
                width: "22%",
                height: "60%",
                zIndex: 5,
              }}
            >
              <DropZone shaking={shakeZone === "small"} />
            </div>

            {/* ── Big mother zone (right column) ─────────────────────────────── */}
            <div
              style={{
                position: "absolute",
                right: "1%",
                top: "25%",
                width: "22%",
                height: "60%",
                zIndex: 5,
              }}
            >
              <DropZone shaking={shakeZone === "big"} />
            </div>

            {/* ── Baby fish (unplaced + placed) ──────────────────────────────── */}
            {babies.map(baby => {
              const pos = positions[baby.id] || { x: 50, y: 50 };
              const isDrag = draggedId === baby.id;
              const imgSrc = baby.size === "small" ? fish4 : fish5;
              const imgW = baby.size === "small" ? 57 : 70;
              const swim = swimParams.current[baby.id];

              return (
                <div
                  key={baby.id}
                  style={{
                    position: "absolute",
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: "translate(-50%,-50%)",
                    zIndex: isDrag ? 30 : baby.placed ? 7 : 10,
                    cursor: baby.placed ? "default" : isDrag ? "grabbing" : "grab",
                    transition: isDrag ? "none" : "left 0.4s ease, top 0.4s ease",
                    userSelect: "none",
                    touchAction: "none",
                    pointerEvents: baby.placed ? "none" : "auto",
                    opacity: baby.placed ? 0.88 : 1,
                    animation: isDrag ? "none" : `fish-swim ${swim?.duration ?? "3.5s"} ${swim?.delay ?? "0s"} ease-in-out infinite`,
                  }}
                  onPointerDown={e => handlePointerDown(baby.id, e)}
                  onPointerMove={e => handlePointerMove(baby.id, e)}
                  onPointerUp={e => handlePointerUp(baby.id, e)}
                  onPointerCancel={e => handlePointerUp(baby.id, e)}
                >
                  <img
                    src={imgSrc}
                    alt={`${baby.size} baby fish`}
                    draggable={false}
                    style={{
                      width: imgW,
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                      filter: isDrag
                        ? "drop-shadow(0 6px 16px rgba(255,255,255,0.7)) brightness(1.1)"
                        : baby.placed
                          ? "drop-shadow(0 2px 8px rgba(255,255,255,0.3)) brightness(1.05)"
                          : "drop-shadow(0 3px 6px rgba(0,0,0,0.6))",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />
                </div>
              );
            })}

          </>)}

          {/* ── Success overlay ────────────────────────────────────────────── */}
          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🐟💙🐟</div>
                <div className="iqm-scene-success-text">
                  Nahiusa na ang Pamilya! · Family Reunited!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Dialogue row ───────────────────────────────────────────────── */}
        <div className="iqm-dialogue-row">
          <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
          <div className="iqm-dialogue-bubble">
            <div className="iqm-dialogue-speaker">{npcName}</div>
            <div className="iqm-dialogue-text">
              {displayLine && (
                <>
                  <span className="iqm-dialogue-bisaya">{displayLine.bisayaText}</span>
                  <span className="iqm-dialogue-english">{displayLine.englishText}</span>
                </>
              )}
            </div>
            {(stage === "intro" || stage === "done") && (
              <button className="iqm-next-btn" onClick={handleDialogueNext}>
                {stage === "done" && dialogueStep === doneLines.length - 1 ? "✓" : "▶"}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{SWIM_STYLE}</style>
    </div>
  );
};

export default FishPairGame;
