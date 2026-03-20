// ─────────────────────────────────────────────────────────────────────────────
//  TurtleShellGame.jsx — Drag shell halves to repair turtle shells (synonyms)
//  Turtles sit on rocks, each showing a shell half with a word.
//  Loose shell halves with words are scattered on the ground.
//  Player drags the correct half (synonym) to the matching turtle.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback } from "react";

const TurtleShellGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { pairs } = quest;

  // Turtle positions (fixed spots on the scene)
  const turtleSpots = pairs.map((_, i) => ({
    x: 15 + i * 30,
    y: 30,
  }));

  // Loose shell halves (shuffled, at the bottom)
  const shellsRef = useRef(
    [...pairs]
      .map((pair, i) => ({
        id: `shell_${i}`,
        word: pair.shellWord,
        meaning: pair.shellMeaning,
        turtleIndex: i,
        startX: 12 + i * 30,
        startY: 78,
      }))
      .sort(() => Math.random() - 0.5)
  ).current;

  const [stage, setStage] = useState("intro");
  const [introStep, setIntroStep] = useState(0);
  const [positions, setPositions] = useState(
    Object.fromEntries(shellsRef.map((s) => [s.id, { x: s.startX, y: s.startY }]))
  );
  const [repaired, setRepaired] = useState(new Set()); // set of turtleIndex
  const [draggedId, setDraggedId] = useState(null);
  const [wrongShake, setWrongShake] = useState(null);

  const containerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const introDialogue = [
    {
      bisayaText: `${item.emoji} ${item.labelBisaya}! Ang mga bao sa pawikan nabuak!`,
      englishText: `${item.emoji} ${item.labelEnglish}! The turtles' shells are cracked!`,
    },
    {
      bisayaText: quest.instructionBisaya,
      englishText: quest.instructionEnglish,
    },
  ];

  const handleIntroNext = () => {
    if (introStep < introDialogue.length - 1) setIntroStep((s) => s + 1);
    else setStage("playing");
  };

  // Hit zone for each turtle (percentage-based)
  const getTurtleZone = (idx) => ({
    x: turtleSpots[idx].x - 8,
    y: turtleSpots[idx].y - 10,
    w: 16,
    h: 25,
  });

  const inZone = (pos, zone) =>
    pos.x > zone.x && pos.x < zone.x + zone.w &&
    pos.y > zone.y && pos.y < zone.y + zone.h;

  const handlePointerDown = (id, e) => {
    if (stage !== "playing") return;
    const shell = shellsRef.find((s) => s.id === id);
    if (!shell || repaired.has(shell.turtleIndex)) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 };
    setDraggedId(id);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (id, e) => {
    if (draggedId !== id) return;
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const r = container.getBoundingClientRect();
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
      if (e?.currentTarget && e.pointerId != null) {
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
      }

      const shell = shellsRef.find((s) => s.id === id);
      const pos = positions[id];
      if (!shell || !pos) return;

      // Check if dropped on any turtle
      for (let i = 0; i < pairs.length; i++) {
        if (repaired.has(i)) continue;
        const zone = getTurtleZone(i);
        if (inZone(pos, zone)) {
          if (shell.turtleIndex === i) {
            // Correct match!
            setRepaired((prev) => {
              const next = new Set([...prev, i]);
              if (next.size >= pairs.length) {
                setTimeout(() => setStage("success"), 600);
              }
              return next;
            });
            // Snap into turtle position
            setPositions((prev) => ({
              ...prev,
              [id]: { x: turtleSpots[i].x, y: turtleSpots[i].y + 10 },
            }));
            return;
          } else {
            // Wrong turtle — jiggle
            setWrongShake(id);
            setTimeout(() => setWrongShake(null), 600);
            setPositions((prev) => ({
              ...prev,
              [id]: { x: shell.startX, y: shell.startY },
            }));
            return;
          }
        }
      }

      // Not on any turtle — snap back
      setPositions((prev) => ({
        ...prev,
        [id]: { x: shell.startX, y: shell.startY },
      }));
    },
    [draggedId, positions, shellsRef, repaired, pairs, turtleSpots]
  );

  const getDialogueText = () => {
    if (stage === "intro") return introDialogue[introStep];
    if (stage === "success")
      return {
        bisayaText: "Maayo kaayo! Nataod na ang mga bao! 🐢💚",
        englishText: "Great job! The shells are fixed! 🐢💚",
      };
    return {
      bisayaText: `${quest.instructionBisaya} (${repaired.size}/${pairs.length})`,
      englishText: `${quest.instructionEnglish} (${repaired.size}/${pairs.length})`,
    };
  };

  const dialogueText = getDialogueText();

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>
        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#26A69A" }}>
            Synonym Repair
          </span>
        </div>

        <div
          className="iqm-scene-canvas"
          ref={containerRef}
          style={{
            background: "linear-gradient(180deg, #1B5E20 0%, #2E7D32 40%, #1565C0 70%, #0D47A1 100%)",
            borderRadius: "12px",
            position: "relative",
          }}
        >
          {/* Beach / rocks area */}
          <div style={{
            position: "absolute", top: "15%", left: 0, right: 0, height: "35%",
            background: "linear-gradient(180deg, rgba(141,110,99,0.4) 0%, rgba(141,110,99,0.1) 100%)",
            pointerEvents: "none",
          }} />

          {/* Turtles */}
          {(stage === "playing" || stage === "success") &&
            pairs.map((pair, i) => {
              const spot = turtleSpots[i];
              const isRepaired = repaired.has(i);

              return (
                <div
                  key={`turtle_${i}`}
                  style={{
                    position: "absolute",
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "3px",
                    pointerEvents: "none",
                    zIndex: 5,
                  }}
                >
                  <span style={{
                    fontSize: isRepaired ? "40px" : "34px",
                    transition: "font-size 0.3s ease",
                    filter: isRepaired ? "brightness(1.2)" : "brightness(0.8) saturate(0.6)",
                  }}>
                    🐢
                  </span>

                  {/* Turtle's shell half word */}
                  <span style={{
                    background: isRepaired ? "rgba(76,175,80,0.85)" : "rgba(121,85,72,0.85)",
                    color: "#fff",
                    padding: "3px 10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: "'Pixelify Sans', sans-serif",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    border: isRepaired ? "2px solid #4CAF50" : "2px dashed rgba(255,255,255,0.4)",
                  }}>
                    {isRepaired ? "✓ " : ""}{pair.turtleWord}
                  </span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
                    ({pair.turtleMeaning})
                  </span>

                  {/* "Needs repair" indicator */}
                  {!isRepaired && (
                    <span style={{
                      fontSize: "10px",
                      color: "#FFAB91",
                      fontFamily: "'Pixelify Sans', sans-serif",
                      animation: "pulse-text 1.5s ease-in-out infinite",
                    }}>
                      💔 Nabuak!
                    </span>
                  )}
                </div>
              );
            })}

          {/* Loose shell halves */}
          {(stage === "playing" || stage === "success") &&
            shellsRef.map((shell) => {
              const pos = positions[shell.id];
              const isPlaced = repaired.has(shell.turtleIndex);
              const isDragging = draggedId === shell.id;
              const isShaking = wrongShake === shell.id;

              if (isPlaced) return null;

              return (
                <div
                  key={shell.id}
                  style={{
                    position: "absolute",
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) ${isShaking ? "rotate(12deg)" : ""}`,
                    cursor: isDragging ? "grabbing" : "grab",
                    zIndex: isDragging ? 20 : 10,
                    transition: isDragging ? "none" : "left 0.3s ease, top 0.3s ease, transform 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    userSelect: "none",
                  }}
                  onPointerDown={(e) => handlePointerDown(shell.id, e)}
                  onPointerMove={(e) => handlePointerMove(shell.id, e)}
                  onPointerUp={(e) => handlePointerUp(shell.id, e)}
                  onPointerCancel={(e) => handlePointerUp(shell.id, e)}
                >
                  <span style={{
                    fontSize: "24px",
                    transform: "scaleX(-1)",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                  }}>
                    🐚
                  </span>
                  <span style={{
                    background: "rgba(0,0,0,0.7)",
                    color: "#a5d6a7",
                    fontSize: "11px",
                    fontFamily: "'Pixelify Sans', sans-serif",
                    fontWeight: "bold",
                    padding: "2px 8px",
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                  }}>
                    {shell.word}
                  </span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
                    ({shell.meaning})
                  </span>
                </div>
              );
            })}

          {/* Progress pips */}
          {stage === "playing" && (
            <div className="iqm-sweep-progress" style={{ top: "8%", bottom: "auto" }}>
              {pairs.map((_, i) => (
                <div key={i} className={`iqm-sweep-pip ${repaired.has(i) ? "iqm-sweep-pip--done" : ""}`} />
              ))}
            </div>
          )}

          {/* Success overlay */}
          {stage === "success" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🐢💚🐢</div>
                <div className="iqm-scene-success-text">Nataod na ang mga Bao!</div>
              </div>
            </div>
          )}
        </div>

        {/* Dialogue */}
        <div className="iqm-dialogue-row">
          <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
          <div className="iqm-dialogue-bubble">
            <div className="iqm-dialogue-speaker">{npcName}</div>
            <div className="iqm-dialogue-text">
              <span className="iqm-dialogue-bisaya">{dialogueText.bisayaText}</span>
              <span className="iqm-dialogue-english">{dialogueText.englishText}</span>
            </div>
            {stage === "intro" && <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>}
            {stage === "success" && <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>}
          </div>
        </div>

        <style>{`
          @keyframes pulse-text {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TurtleShellGame;
