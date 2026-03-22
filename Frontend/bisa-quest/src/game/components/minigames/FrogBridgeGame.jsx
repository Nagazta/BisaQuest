// ─────────────────────────────────────────────────────────────────────────────
//  FrogBridgeGame.jsx — "Lily Pad Bridge"
//  Drag the frog from START onto the safe lily pad in each column.
//  Cannot skip columns. Flow: intro (preview) → playing → done.
//
//  Drag system: Pointer events (onPointerDown/Move/Up) — same approach as
//  TurtleShellGame. The frog visually follows the cursor in real-time;
//  no browser ghost image, no cursor icon change.
//
//  Hit-testing: on pointerUp we check the frog's centre against each
//  lily-pad's bounding rect to decide which pad (if any) was targeted.
//
//  ┌─── POSITION TUNING GUIDE ───────────────────────────────────────────────┐
//  │ START spot (frog initial position):                                      │
//  │   → FROG_START_LEFT / FROG_START_TOP (% of canvas, lines below)         │
//  │                                                                          │
//  │ Lily pad column container:                                               │
//  │   → PAD_AREA_LEFT  — how far from left edge                              │
//  │   → PAD_AREA_RIGHT — how far from right edge                             │
//  │   → PAD_AREA_TOP   — vertical centre of columns                         │
//  │                                                                          │
//  │ Lily pad image size:                                                     │
//  │   → PAD_SIZE_PX    — width in pixels of each pad image                  │
//  └─────────────────────────────────────────────────────────────────────────┘
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback } from "react";
import frogGameBg from "../../../assets/images/environments/scenario/frog-game.png";

import frogImg from "../../../assets/items/frog.png";
import lily1 from "../../../assets/items/lily1.png";
import lily2 from "../../../assets/items/lily2.png";
import lily3 from "../../../assets/items/lily3.png";
import lilyWilt1 from "../../../assets/items/lily-wilt1.png";
import lilyWilt2 from "../../../assets/items/lily-wilt2.png";
import lilyWilt3 from "../../../assets/items/lily-wilt3.png";

const SAFE_IMGS = [lily1, lily2, lily3];
const WILT_IMGS = [lilyWilt1, lilyWilt2, lilyWilt3];

// ── Tunable layout constants ──────────────────────────────────────────────────
const PAD_SIZE_PX = 88;        // width of each lily pad image (px)
const FROG_START_LEFT = 20;       // frog start X (% of canvas width)
const FROG_START_TOP = 55;       // frog start Y (% of canvas height)
const PAD_AREA_LEFT = "28%";     // left edge of pad column container
const PAD_AREA_RIGHT = "8%";      // right edge of pad column container
const PAD_AREA_TOP = "50%";     // vertical centre of pad column container

// NPC line shown when frog falls off an unsafe pad
const FELL_OFF_LINE = {
  bisayaText: "Nahulog ang baki! Nagbalik siya sa luwas nga dahon. 🐸💦",
  englishText: "The frog fell off and had to swim back to the safe lily pad!",
};

// ── Component ─────────────────────────────────────────────────────────────────
const FrogBridgeGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, completionDialogue, synonymDialogue, antonymDialogue, padRows } = quest;

  const doneLines = completionDialogue
    || [...(synonymDialogue || []), ...(antonymDialogue || [])];

  const [stage, setStage] = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);
  const [frogCol, setFrogCol] = useState(-1);           // -1 = start, 0..N = on pad col
  const [frogPos, setFrogPos] = useState({ leftPct: FROG_START_LEFT, topPct: FROG_START_TOP });
  const [clearedCols, setClearedCols] = useState([]);
  const [shakeCol, setShakeCol] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [feedbackLine, setFeedbackLine] = useState(null);  // temporary NPC fell-off message

  // Stable per-column layout (safe/wilt image + which is on top) — never re-shuffled
  const columns = useRef(
    padRows.map((_, i) => ({
      safeOnTop: Math.random() > 0.5,
      safeImg: SAFE_IMGS[i] ?? lily1,
      wiltImg: WILT_IMGS[i] ?? lilyWilt1,
    }))
  ).current;

  const canvasRef = useRef(null);
  const frogRef = useRef(null);
  const padRefs = useRef({});   // { "colIdx-safe": el, "colIdx-wilt": el, … }
  const dragOffset = useRef({ x: 0, y: 0 });
  const feedbackTimer = useRef(null);

  const rows = padRows;

  // Store last committed frog position so we can snap back on bad drops
  const lastSafePos = useRef({ leftPct: FROG_START_LEFT, topPct: FROG_START_TOP });

  // ── Dialogue ──────────────────────────────────────────────────────────────
  const currentLines = stage === "intro" ? introDialogue : stage === "done" ? doneLines : null;
  const dialogueLine = currentLines?.[dialogueStep] ?? null;

  const handleDialogueNext = () => {
    if (!currentLines) return;
    if (dialogueStep < currentLines.length - 1) {
      setDialogueStep(s => s + 1);
    } else {
      if (stage === "intro") { setStage("playing"); setDialogueStep(0); }
      else if (stage === "done") onComplete(item);
    }
  };

  // ── Show fell-off feedback for a limited time ─────────────────────────────
  const showFellOff = () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedbackLine(FELL_OFF_LINE);
    feedbackTimer.current = setTimeout(() => setFeedbackLine(null), 2500);
  };

  // ── Pointer events (frog) ─────────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    if (stage !== "playing") return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    // Offset so the frog anchors under where you grab, not by top-left
    dragOffset.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [stage]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    const leftPct = ((e.clientX - dragOffset.current.x - cr.left) / cr.width) * 100;
    const topPct = ((e.clientY - dragOffset.current.y - cr.top) / cr.height) * 100;
    setFrogPos({
      leftPct: Math.min(Math.max(leftPct, 2), 98),
      topPct: Math.min(Math.max(topPct, 2), 98),
    });
  }, [isDragging]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);
    try { e?.currentTarget?.releasePointerCapture(e.pointerId); } catch (_) { }

    if (stage !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();

    // Frog centre in viewport coords (where the pointer was released)
    const frogCentreX = e.clientX - dragOffset.current.x;
    const frogCentreY = e.clientY - dragOffset.current.y;

    // Hit-test every pad
    let hitColIdx = null;
    let hitIsSafe = null;

    for (const [key, el] of Object.entries(padRefs.current)) {
      if (!el) continue;
      const pr = el.getBoundingClientRect();
      if (
        frogCentreX >= pr.left && frogCentreX <= pr.right &&
        frogCentreY >= pr.top && frogCentreY <= pr.bottom
      ) {
        const [colStr, type] = key.split("-");
        hitColIdx = Number(colStr);
        hitIsSafe = type === "safe";
        break;
      }
    }

    if (hitColIdx === null || hitColIdx !== frogCol + 1 || clearedCols.includes(hitColIdx)) {
      // Missed all pads or wrong column — snap back
      setFrogPos({ ...lastSafePos.current });
      return;
    }

    // Compute landing position: frog sits ON the pad (top 25% of pad height)
    const padEl = padRefs.current[`${hitColIdx}-${hitIsSafe ? "safe" : "wilt"}`];
    if (padEl) {
      const pr = padEl.getBoundingClientRect();
      const leftPct = ((pr.left + pr.width / 2 - cr.left) / cr.width) * 100;
      // transform: translate(-50%, -100%) → frog bottom aligns with this Y
      // We want frog bottom ~25% down from pad top so it looks seated
      const topPct = ((pr.top + pr.height * 0.52 - cr.top) / cr.height) * 100;
      const landPos = { leftPct, topPct };

      if (hitIsSafe) {
        const next = [...clearedCols, hitColIdx];
        setClearedCols(next);
        setFrogCol(hitColIdx);
        setFrogPos(landPos);
        lastSafePos.current = landPos;
        if (next.length >= rows.length) {
          setTimeout(() => { setStage("done"); setDialogueStep(0); }, 900);
        }
      } else {
        // Shake the unsafe pad, frog bounces back
        setShakeCol(hitColIdx);
        setTimeout(() => setShakeCol(null), 500);
        setFrogPos({ ...lastSafePos.current });
        showFellOff();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, stage, frogCol, clearedCols, rows.length]);

  const isIntro = stage === "intro";
  const showGame = stage === "intro" || stage === "playing";

  // ── Dialogue line shown in playing stage ──────────────────────────────────
  const playingDialogue = feedbackLine ?? {
    bisayaText: `I-drag ang baki sa luwas nga dahon! (${clearedCols.length}/${rows.length})`,
    englishText: `Drag the frog onto the safe lily pad! (${clearedCols.length}/${rows.length})`,
  };

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#2e7d32" }}>Lily Pad Bridge</span>
        </div>

        {/* ── Game Canvas ─────────────────────────────────────────────────── */}
        <div
          ref={canvasRef}
          className="iqm-scene-canvas"
          style={{
            background: `url(${frogGameBg}) center/cover no-repeat`,
            borderRadius: "12px", position: "relative", overflow: "hidden",
          }}
        >
          {showGame && (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>

              {/* START label */}
              <div style={{
                position: "absolute", left: "20%", top: "60%",
                transform: "translate(-50%, 0%)",
                zIndex: 5, pointerEvents: "none",
              }}>
                <div style={{
                  background: "rgba(0,0,0,0.55)", border: "2px solid rgba(150,255,150,0.4)",
                  borderRadius: 8, padding: "3px 8px",
                  color: "#a5d6a7", fontSize: 9, fontFamily: "'Pixelify Sans',sans-serif", textAlign: "center",
                }}>Start</div>
              </div>

              {/* END label */}
              <div style={{
                position: "absolute", right: "5%", top: "55%",
                transform: "translateY(-50%)",
                zIndex: 5, pointerEvents: "none",
              }}>
                <div style={{
                  background: clearedCols.length >= rows.length
                    ? "rgba(50,150,50,0.75)" : "rgba(0,0,0,0.55)",
                  border: "2px solid rgba(150,255,150,0.5)",
                  borderRadius: 8, padding: "3px 8px",
                  color: "#c8e6c9", fontSize: 9, fontFamily: "'Pixelify Sans',sans-serif", textAlign: "center",
                  transition: "background 0.4s",
                }}>End</div>
              </div>

              {/* ── Frog (pointer-draggable) ── */}
              <div
                ref={frogRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  position: "absolute",
                  left: `${frogPos.leftPct}%`,
                  top: `${frogPos.topPct}%`,
                  transform: "translate(-50%, -100%)",
                  zIndex: 20,
                  width: 64,
                  cursor: isIntro ? "default" : isDragging ? "grabbing" : "grab",
                  transition: isDragging ? "none" : "left 0.45s cubic-bezier(0.34,1.56,0.64,1), top 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.65))",
                  userSelect: "none",
                  touchAction: "none",
                }}
              >
                <img src={frogImg} alt="Frog" draggable={false} style={{ width: "100%", height: "auto", display: "block" }} />
              </div>

              {/* ── Lily pad columns ── */}
              <div style={{
                position: "absolute",
                left: PAD_AREA_LEFT, right: PAD_AREA_RIGHT, top: PAD_AREA_TOP,
                transform: "translateY(-50%)",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                zIndex: 4,
              }}>
                {columns.map((col, colIdx) => {
                  const isCleared = clearedCols.includes(colIdx);
                  const isNext = colIdx === frogCol + 1;

                  const makePad = (isSafe) => {
                    const src = isSafe ? col.safeImg : col.wiltImg;
                    const shaking = shakeCol === colIdx && !isSafe;
                    const refKey = `${colIdx}-${isSafe ? "safe" : "wilt"}`;
                    return (
                      <div
                        key={isSafe ? "s" : "w"}
                        ref={el => { padRefs.current[refKey] = el; }}
                        style={{
                          width: PAD_SIZE_PX,
                          cursor: isCleared || isIntro ? "default" : isNext ? "copy" : "not-allowed",
                          opacity: isCleared ? 0.35 : !isNext ? 0.5 : 1,
                          transition: "opacity 0.3s, transform 0.2s",
                          filter: isNext && !isIntro
                            ? (isSafe
                              ? "drop-shadow(0 0 8px rgba(100,255,120,0.6))"
                              : "drop-shadow(0 0 8px rgba(255,80,80,0.3))")
                            : "drop-shadow(0 2px 5px rgba(0,0,0,0.5))",
                          animation: shaking ? "pad-shake 0.4s ease" : undefined,
                          userSelect: "none",
                        }}
                      >
                        <img src={src} alt={isSafe ? "safe pad" : "wilt pad"} draggable={false}
                          style={{ width: "100%", height: "auto", display: "block" }} />
                      </div>
                    );
                  };

                  return (
                    <div key={colIdx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      {col.safeOnTop ? makePad(true) : makePad(false)}
                      {col.safeOnTop ? makePad(false) : makePad(true)}
                    </div>
                  );
                })}
              </div>

              {/* Progress pips */}
              {!isIntro && (
                <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
                  {rows.map((_, i) => (
                    <div key={i} className={`iqm-sweep-pip ${clearedCols.includes(i) ? "iqm-sweep-pip--done" : ""}`} />
                  ))}
                </div>
              )}
            </div>
          )}

          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🐸💚🐸</div>
                <div className="iqm-scene-success-text">Nakatawid na ang Baki! · Frog Crossed!</div>
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
              ) : stage === "playing" ? (
                <>
                  <span className="iqm-dialogue-bisaya">{playingDialogue.bisayaText}</span>
                  <span className="iqm-dialogue-english">{playingDialogue.englishText}</span>
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
        @keyframes pad-shake {
          0%,100% { transform: translateX(0) scale(1); }
          25%      { transform: translateX(-9px) scale(0.97); }
          75%      { transform: translateX(9px) scale(0.97); }
        }
      `}</style>
    </div>
  );
};

export default FrogBridgeGame;
