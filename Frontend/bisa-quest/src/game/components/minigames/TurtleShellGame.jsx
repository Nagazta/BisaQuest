// ─────────────────────────────────────────────────────────────────────────────
//  TurtleShellGame.jsx — "Turtle Shell Repair"
//  A single turtle in the centre has 5 broken shell slots.
//  10 shell pieces surround it — 5 correct (synonym concept), 3 neutral-wrong,
//  2 opposite-wrong (antonym concept). Player drags pieces to the turtle body.
//  Correct: snaps in with a glow. Neutral: slides off gently. Opposite: bounces.
//  After all 5 are placed, Lunti teaches synonyms then antonyms.
//  All pieces are pure SVG visuals — no text labels.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback } from "react";

// ── Shell piece SVG renderer ──────────────────────────────────────────────────
const ShellPiece = ({ variant, size = 54, dragging, shake, bounce }) => {
  const s = size;
  const cx = s / 2, cy = s / 2;

  const content = () => {
    switch (variant) {
      // ── Correct pieces (green turtle-shell shaped) ─────────────────────────
      case "smooth":
        return (
          <>
            <ellipse cx={cx} cy={cy} rx={cx - 3} ry={cy - 5} fill="#388e3c" />
            <ellipse cx={cx} cy={cy} rx={cx - 10} ry={cy - 12} fill="#2e7d32" opacity="0.6" />
          </>
        );
      case "lined":
        return (
          <>
            <ellipse cx={cx} cy={cy} rx={cx - 3} ry={cy - 5} fill="#43a047" />
            {[0, 1, 2].map((i) => (
              <line key={i}
                x1={8 + i * 14} y1={cy - 10}
                x2={8 + i * 14} y2={cy + 10}
                stroke="#2e7d32" strokeWidth="1.5" opacity="0.7"
              />
            ))}
          </>
        );
      case "cracked":
        return (
          <>
            <ellipse cx={cx} cy={cy} rx={cx - 3} ry={cy - 5} fill="#388e3c" />
            <path d={`M ${cx - 6} ${cy - 8} L ${cx - 2} ${cy} L ${cx - 7} ${cy + 8}`}
              stroke="#1b5e20" strokeWidth="2" fill="none" opacity="0.85" />
          </>
        );
      case "patched":
        return (
          <>
            <ellipse cx={cx} cy={cy} rx={cx - 3} ry={cy - 5} fill="#66bb6a" />
            <ellipse cx={cx - 6} cy={cy - 4} rx={7} ry={6} fill="#43a047" opacity="0.8" />
            <ellipse cx={cx + 5} cy={cy + 5} rx={6} ry={5} fill="#43a047" opacity="0.7" />
          </>
        );
      case "uneven":
        return (
          <>
            <path
              d={`M ${cx - 14} ${cy} Q ${cx - 16} ${cy - 14} ${cx} ${cy - 14} Q ${cx + 18} ${cy - 12} ${cx + 14} ${cy} Q ${cx + 12} ${cy + 14} ${cx} ${cy + 16} Q ${cx - 15} ${cy + 12} ${cx - 14} ${cy}`}
              fill="#4caf50"
            />
          </>
        );

      // ── Neutral-wrong pieces (different everyday shells) ───────────────────
      case "snail":
        return (
          <>
            <circle cx={cx} cy={cy} r={cx - 4} fill="#bcaaa4" />
            <path
              d={`M ${cx} ${cy} Q ${cx + 8} ${cy - 8} ${cx + 4} ${cy - 14} Q ${cx - 6} ${cy - 18} ${cx - 10} ${cy - 8} Q ${cx - 12} ${cy} ${cx - 4} ${cy + 4} Q ${cx + 4} ${cy + 8} ${cx + 6} ${cy}`}
              stroke="#795548" strokeWidth="2" fill="none"
            />
          </>
        );
      case "crab":
        return (
          <>
            <path
              d={`M ${cx - 16} ${cy + 8} Q ${cx} ${cy - 16} ${cx + 16} ${cy + 8} Z`}
              fill="#ef6c00"
            />
            <line x1={cx - 10} y1={cy + 6} x2={cx + 10} y2={cy + 6}
              stroke="#e65100" strokeWidth="2" />
            <line x1={cx - 6} y1={cy + 2} x2={cx + 6} y2={cy + 2}
              stroke="#e65100" strokeWidth="1.5" opacity="0.7" />
          </>
        );
      case "clam":
        return (
          <>
            <ellipse cx={cx} cy={cy - 2} rx={cx - 4} ry={cy - 10} fill="#e0e0e0" />
            <ellipse cx={cx} cy={cy + 8} rx={cx - 4} ry={cy - 12} fill="#bdbdbd" />
            <line x1={cx - (cx - 4)} y1={cy + 2} x2={cx + (cx - 4)} y2={cy + 2}
              stroke="#9e9e9e" strokeWidth="1.5" />
          </>
        );

      // ── Opposite-wrong pieces (dark, spiky, destructive) ──────────────────
      case "spiky":
        return (
          <>
            <polygon
              points={`${cx},${cy - 20} ${cx + 8},${cy - 6} ${cx + 22},${cy - 4} ${cx + 12},${cy + 6} ${cx + 14},${cy + 20} ${cx},${cy + 12} ${cx - 14},${cy + 20} ${cx - 12},${cy + 6} ${cx - 22},${cy - 4} ${cx - 8},${cy - 6}`}
              fill="#37474f"
            />
            <circle cx={cx} cy={cy} r={6} fill="#263238" />
          </>
        );
      case "jagged":
        return (
          <>
            <path
              d={`M ${cx - 18} ${cy + 12} L ${cx - 12} ${cy - 6} L ${cx - 4} ${cy + 2} L ${cx + 2} ${cy - 14} L ${cx + 8} ${cy - 2} L ${cx + 18} ${cy - 10} L ${cx + 14} ${cy + 14} Z`}
              fill="#4a4a4a" stroke="#212121" strokeWidth="1.5"
            />
            {/* crack slash */}
            <path d={`M ${cx - 6} ${cy - 4} L ${cx + 4} ${cy + 8}`}
              stroke="#b71c1c" strokeWidth="2.5" opacity="0.85" />
          </>
        );

      default:
        return <ellipse cx={cx} cy={cy} rx={cx - 3} ry={cy - 5} fill="#388e3c" />;
    }
  };

  return (
    <svg
      width={s} height={s} viewBox={`0 0 ${s} ${s}`}
      style={{
        cursor: dragging ? "grabbing" : "grab",
        filter: dragging
          ? "drop-shadow(0 4px 10px rgba(255,255,255,0.5))"
          : "drop-shadow(0 2px 5px rgba(0,0,0,0.5))",
        animation: shake
          ? "shell-shake 0.4s ease"
          : bounce
          ? "shell-bounce 0.4s ease"
          : undefined,
        userSelect: "none",
        display: "block",
      }}
    >
      {content()}
    </svg>
  );
};

// ── Slot SVG (empty broken shell section on turtle) ───────────────────────────
const ShellSlot = ({ filled, glowing, index }) => {
  // 5 slots arranged in a dome pattern on the turtle back
  return (
    <div style={{
      width: 28, height: 22,
      borderRadius: "50%",
      background: filled ? "rgba(76,175,80,0.7)" : "rgba(0,0,0,0.35)",
      border: filled
        ? "2px solid #a5d6a7"
        : "2px dashed rgba(255,255,255,0.4)",
      filter: glowing ? "drop-shadow(0 0 8px #69f0ae)" : "none",
      transition: "background 0.3s, filter 0.3s",
    }} />
  );
};

// ── Scatter starting positions for 10 pieces ──────────────────────────────────
// Pieces circle the turtle which sits at ~50% x, ~42% y
const PIECE_STARTS = [
  // Top arc
  { x: 20, y: 12 }, { x: 38, y: 8  }, { x: 55, y: 8  }, { x: 72, y: 12 }, { x: 84, y: 20 },
  // Bottom arc
  { x: 15, y: 72 }, { x: 30, y: 82 }, { x: 50, y: 85 }, { x: 68, y: 82 }, { x: 82, y: 72 },
];

// ── Component ─────────────────────────────────────────────────────────────────
const TurtleShellGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, synonymDialogue, antonymDialogue, pieces } = quest;

  // Shuffle pieces once on mount and assign starting positions
  const pieceList = useRef(
    [...pieces]
      .sort(() => Math.random() - 0.5)
      .map((p, i) => ({ ...p, startX: PIECE_STARTS[i].x, startY: PIECE_STARTS[i].y }))
  ).current;

  // ── Stage machine: intro → playing → synonym_lesson → antonym_lesson → done
  const [stage, setStage] = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);

  // ── Piece positions & placement state ─────────────────────────────────────
  const [positions, setPositions] = useState(
    Object.fromEntries(pieceList.map((p) => [p.id, { x: p.startX, y: p.startY }]))
  );
  const [placed, setPlaced] = useState([]); // list of piece ids correctly placed (max 5)
  const [removedIds, setRemovedIds] = useState(new Set()); // pieces permanently dismissed (neutral/opposite)
  const [draggedId, setDraggedId] = useState(null);
  const [shakePieceId, setShakePieceId] = useState(null);   // neutral wrong
  const [bouncePieceId, setBouncePieceId] = useState(null); // opposite wrong

  // Track if the antonym lesson has been triggered (once an opposite piece is tried)
  const antonymShownRef = useRef(false);
  const [showAntonymHint, setShowAntonymHint] = useState(false);
  const antonymHintLine = antonymDialogue[0]; // show first line as hint during play

  const containerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // ── Drop target: turtle centre zone ──────────────────────────────────────
  // Turtle SVG is centered at ~50%, 42%
  const TURTLE_ZONE = { x: 36, y: 26, w: 28, h: 30 }; // % coords

  const inTurtleZone = (pos) =>
    pos.x > TURTLE_ZONE.x && pos.x < TURTLE_ZONE.x + TURTLE_ZONE.w &&
    pos.y > TURTLE_ZONE.y && pos.y < TURTLE_ZONE.y + TURTLE_ZONE.h;

  // ── Dialogue helpers ──────────────────────────────────────────────────────
  const currentLines =
    stage === "intro" ? introDialogue :
    stage === "synonym_lesson" ? synonymDialogue :
    stage === "antonym_lesson" ? antonymDialogue : null;

  const dialogueLine = currentLines?.[dialogueStep] ?? null;

  const handleDialogueNext = () => {
    if (!currentLines) return;
    if (dialogueStep < currentLines.length - 1) {
      setDialogueStep((s) => s + 1);
    } else {
      if (stage === "intro")              { setStage("playing");        setDialogueStep(0); }
      else if (stage === "synonym_lesson") { setStage("antonym_lesson"); setDialogueStep(0); }
      else if (stage === "antonym_lesson") { setStage("done"); }
    }
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handlePointerDown = (id, e) => {
    if (stage !== "playing") return;
    if (placed.includes(id) || removedIds.has(id)) return;
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
    setPositions((prev) => ({
      ...prev,
      [id]: { x: Math.min(Math.max(x, 2), 98), y: Math.min(Math.max(y, 2), 98) },
    }));
  };

  const handlePointerUp = useCallback(
    (id, e) => {
      if (draggedId !== id) return;
      setDraggedId(null);
      try { e?.currentTarget?.releasePointerCapture(e.pointerId); } catch (_) {}

      const piece = pieceList.find((p) => p.id === id);
      const pos = positions[id];
      if (!piece || !pos) return;

      if (inTurtleZone(pos)) {
        if (piece.type === "correct") {
          // ✅ Snap into a slot
          const newPlaced = [...placed, id];
          setPlaced(newPlaced);
          // Snap piece to turtle centre (will be hidden behind turtle, slots show progress)
          setPositions((prev) => ({ ...prev, [id]: { x: 50, y: 42 } }));
          if (newPlaced.length >= 5) {
            setTimeout(() => { setStage("synonym_lesson"); setDialogueStep(0); }, 700);
          }
        } else if (piece.type === "neutral") {
          // ⚠️ Gentle slide off
          setShakePieceId(id);
          setTimeout(() => setShakePieceId(null), 500);
          setPositions((prev) => ({ ...prev, [id]: { x: piece.startX, y: piece.startY } }));
        } else if (piece.type === "opposite") {
          // ❌ Strong bounce — also flash antonym hint once
          setBouncePieceId(id);
          setTimeout(() => setBouncePieceId(null), 500);
          setPositions((prev) => ({ ...prev, [id]: { x: piece.startX, y: piece.startY } }));
          if (!antonymShownRef.current) {
            antonymShownRef.current = true;
            setShowAntonymHint(true);
            setTimeout(() => setShowAntonymHint(false), 3500);
          }
        }
      } else {
        // Dropped outside zone — snap back
        setPositions((prev) => ({ ...prev, [id]: { x: piece.startX, y: piece.startY } }));
      }
    },
    [draggedId, positions, pieceList, placed]
  );

  // ── Turtle SVG (centre) ───────────────────────────────────────────────────
  const TurtleSVG = () => (
    <svg width="90" height="90" viewBox="0 0 90 90">
      {/* Body */}
      <ellipse cx="45" cy="52" rx="22" ry="18" fill="#558b2f" />
      {/* Head */}
      <circle cx="45" cy="30" r="11" fill="#558b2f" />
      <circle cx="41" cy="27" r="2.5" fill="#212121" />
      <circle cx="49" cy="27" r="2.5" fill="#212121" />
      {/* Feet */}
      <ellipse cx="24" cy="58" rx="8" ry="5" fill="#558b2f" transform="rotate(-20, 24, 58)" />
      <ellipse cx="66" cy="58" rx="8" ry="5" fill="#558b2f" transform="rotate(20, 66, 58)" />
      <ellipse cx="28" cy="70" rx="7" ry="4" fill="#558b2f" transform="rotate(10, 28, 70)" />
      <ellipse cx="62" cy="70" rx="7" ry="4" fill="#558b2f" transform="rotate(-10, 62, 70)" />
      {/* Tail */}
      <ellipse cx="45" cy="72" rx="5" ry="8" fill="#558b2f" />
      {/* Shell dome — show brokenness */}
      <ellipse cx="45" cy="46" rx="20" ry="17" fill="#8bc34a" opacity="0.9" />
      {/* Crack lines on shell */}
      <path d="M 35 38 L 40 46 L 35 54" stroke="#33691e" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M 50 36 L 48 46 L 55 52" stroke="#33691e" strokeWidth="2" fill="none" opacity="0.7" />
    </svg>
  );

  // ── Rendering ─────────────────────────────────────────────────────────────
  const correctCount = placed.length;

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#558b2f" }}>
            Shell Repair
          </span>
        </div>

        {/* ── Game Canvas ─────────────────────────────────────────────────── */}
        <div
          className="iqm-scene-canvas"
          ref={containerRef}
          style={{ background: "#1a6fa8", borderRadius: "12px", position: "relative", overflow: "hidden" }}
        >
          {/* Water shimmer */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "12px",
            background: "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.04) 20px, rgba(255,255,255,0.04) 22px)",
            pointerEvents: "none",
          }} />

          {/* ── Playing stage ─────────────────────────────────── */}
          {stage === "playing" && (
            <>
              {/* Turtle + shell slots in centre */}
              <div style={{
                position: "absolute", left: "50%", top: "42%",
                transform: "translate(-50%, -50%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                zIndex: 5, pointerEvents: "none",
              }}>
                <TurtleSVG />
                {/* Shell slots row */}
                <div style={{ display: "flex", gap: 4, marginTop: -4 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <ShellSlot key={i} filled={i < correctCount} glowing={i === correctCount - 1} />
                  ))}
                </div>
              </div>

              {/* Draggable shell pieces */}
              {pieceList.map((piece) => {
                const pos = positions[piece.id];
                if (placed.includes(piece.id)) return null;
                const isDragging = draggedId === piece.id;
                const isShake  = shakePieceId  === piece.id;
                const isBounce = bouncePieceId === piece.id;

                return (
                  <div
                    key={piece.id}
                    style={{
                      position: "absolute",
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isDragging ? 30 : 10,
                      transition: isDragging ? "none" : "left 0.3s ease, top 0.3s ease",
                      userSelect: "none",
                    }}
                    onPointerDown={(e) => handlePointerDown(piece.id, e)}
                    onPointerMove={(e) => handlePointerMove(piece.id, e)}
                    onPointerUp={(e) => handlePointerUp(piece.id, e)}
                    onPointerCancel={(e) => handlePointerUp(piece.id, e)}
                  >
                    <ShellPiece
                      variant={piece.variant}
                      size={isDragging ? 60 : 50}
                      dragging={isDragging}
                      shake={isShake}
                      bounce={isBounce}
                    />
                  </div>
                );
              })}

              {/* Drop zone hint ring */}
              <div style={{
                position: "absolute", left: "50%", top: "42%",
                transform: "translate(-50%, -50%)",
                width: 90, height: 90,
                borderRadius: "50%",
                border: "2px dashed rgba(255,255,255,0.2)",
                pointerEvents: "none",
              }} />

              {/* Antonym hint toast */}
              {showAntonymHint && (
                <div style={{
                  position: "absolute", top: "6%", left: "50%", transform: "translateX(-50%)",
                  background: "rgba(183,28,28,0.85)", color: "#fff",
                  borderRadius: 10, padding: "6px 14px", fontSize: 11,
                  fontFamily: "'Pixelify Sans', sans-serif", fontWeight: "bold",
                  zIndex: 40, whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
                  animation: "fade-in-out 3.5s ease",
                }}>
                  ❌ Kini nga piraso lahi kaayo! · This piece is very different!
                </div>
              )}

              {/* Progress pips */}
              <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`iqm-sweep-pip ${i < correctCount ? "iqm-sweep-pip--done" : ""}`} />
                ))}
              </div>
            </>
          )}

          {/* ── Synonym lesson canvas ─────────────────────────── */}
          {stage === "synonym_lesson" && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            }}>
              {["smooth", "lined", "cracked", "patched", "uneven"].map((v, i) => (
                <React.Fragment key={v}>
                  <div style={{ textAlign: "center" }}>
                    <ShellPiece variant={v} size={52} />
                  </div>
                  {i < 4 && (
                    <span style={{ color: "#a5d6a7", fontSize: 18, fontWeight: "bold" }}>≈</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ── Antonym lesson canvas ─────────────────────────── */}
          {stage === "antonym_lesson" && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 32,
            }}>
              <div style={{ textAlign: "center" }}>
                <ShellPiece variant="smooth" size={68} />
                <div style={{ color: "#a5d6a7", fontSize: 11, marginTop: 6, fontWeight: "bold" }}>
                  Angay / Belongs
                </div>
              </div>
              <div style={{ color: "#fff", fontSize: 28, fontWeight: "bold", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                ≠
              </div>
              <div style={{ textAlign: "center" }}>
                <ShellPiece variant="spiky" size={68} />
                <div style={{ color: "#ef9a9a", fontSize: 11, marginTop: 6, fontWeight: "bold" }}>
                  Dili angay / Opposite
                </div>
              </div>
            </div>
          )}

          {/* ── Done overlay ──────────────────────────────────── */}
          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🐢💚🐢</div>
                <div className="iqm-scene-success-text">Nataod na ang Kabhang! · Shell Repaired!</div>
              </div>
            </div>
          )}
        </div>

        {/* ── NPC Dialogue Row ─────────────────────────────────────────────── */}
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
                    I-drag ang sakto nga piraso sa pawikan! ({correctCount}/5)
                  </span>
                  <span className="iqm-dialogue-english">
                    Drag the right shell piece to the turtle! ({correctCount}/5)
                  </span>
                </>
              ) : stage === "done" ? (
                <>
                  <span className="iqm-dialogue-bisaya">Nataod na ang kabhang! 🎉</span>
                  <span className="iqm-dialogue-english">The shell is fixed! 🎉</span>
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
        @keyframes shell-shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          25%       { transform: translate(-50%, -50%) rotate(-12deg); }
          75%       { transform: translate(-50%, -50%) rotate(12deg); }
        }
        @keyframes shell-bounce {
          0%   { transform: translate(-50%, -50%) scale(1); }
          30%  { transform: translate(-50%, -50%) scale(1.25) rotate(8deg); }
          60%  { transform: translate(-50%, -50%) scale(0.85) rotate(-6deg); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes fade-in-out {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default TurtleShellGame;
