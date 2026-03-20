// ─────────────────────────────────────────────────────────────────────────────
//  FishPairGame.jsx — Drag fish to their synonym partner
//  Fish swim around with word labels. Drag one onto its synonym → they pair
//  up and swim away together. Wrong pairs bounce with a ripple.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback, useEffect } from "react";

const COLORS = [
  "#4FC3F7", "#81C784", "#FFB74D", "#E57373",
  "#BA68C8", "#4DD0E1", "#AED581", "#FF8A65",
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const FishPairGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { pairs } = quest;

  // Build fish array from pairs — each pair produces 2 fish
  const allFish = useRef(
    shuffle(
      pairs.flatMap((pair, i) => [
        { id: `a_${i}`, word: pair.wordA, meaning: pair.meaningA, pairIndex: i, side: "A" },
        { id: `b_${i}`, word: pair.wordB, meaning: pair.meaningB, pairIndex: i, side: "B" },
      ])
    ).map((fish, idx) => ({
      ...fish,
      color: COLORS[idx % COLORS.length],
      baseX: 10 + (idx % 4) * 22,
      baseY: 20 + Math.floor(idx / 4) * 35,
    }))
  ).current;

  const [stage, setStage] = useState("intro"); // intro | playing | success
  const [introStep, setIntroStep] = useState(0);
  const [positions, setPositions] = useState(
    Object.fromEntries(allFish.map((f) => [f.id, { x: f.baseX, y: f.baseY }]))
  );
  const [paired, setPaired] = useState(new Set());
  const [draggedId, setDraggedId] = useState(null);
  const [shake, setShake] = useState(null);

  const containerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const introDialogue = [
    {
      bisayaText: `${item.emoji} ${item.labelBisaya}! Ang mga isda nagka-away!`,
      englishText: `${item.emoji} ${item.labelEnglish}! The fish are fighting!`,
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

  // ── Swim animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== "playing") return;
    const interval = setInterval(() => {
      setPositions((prev) => {
        const next = { ...prev };
        allFish.forEach((fish) => {
          if (paired.has(fish.id) || draggedId === fish.id) return;
          const p = next[fish.id];
          next[fish.id] = {
            x: fish.baseX + Math.sin(Date.now() / 1200 + fish.baseX) * 4,
            y: p.y + Math.sin(Date.now() / 1000 + fish.baseY) * 0.3,
          };
        });
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [stage, paired, draggedId, allFish]);

  // ── Pointer drag ──────────────────────────────────────────────────────────
  const handlePointerDown = (id, e) => {
    if (stage !== "playing" || paired.has(id)) return;
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
    const container = containerRef.current;
    if (!container) return;
    const r = container.getBoundingClientRect();
    const x = ((e.clientX - dragOffset.current.x - r.left) / r.width) * 100;
    const y = ((e.clientY - dragOffset.current.y - r.top) / r.height) * 100;
    setPositions((prev) => ({
      ...prev,
      [id]: { x: Math.min(Math.max(x, 3), 97), y: Math.min(Math.max(y, 3), 97) },
    }));
  };

  const handlePointerUp = useCallback(
    (id, e) => {
      if (draggedId !== id) return;
      setDraggedId(null);
      if (e?.currentTarget && e.pointerId != null) {
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
      }

      // Check if overlapping with another fish
      const draggedFish = allFish.find((f) => f.id === id);
      const dragPos = positions[id];
      if (!draggedFish || !dragPos) return;

      for (const other of allFish) {
        if (other.id === id || paired.has(other.id)) continue;
        const otherPos = positions[other.id];
        const dist = Math.sqrt((dragPos.x - otherPos.x) ** 2 + (dragPos.y - otherPos.y) ** 2);
        if (dist < 10) {
          // Check if they are a synonym pair
          if (draggedFish.pairIndex === other.pairIndex && draggedFish.side !== other.side) {
            // Correct pair!
            setPaired((prev) => {
              const next = new Set([...prev, draggedFish.id, other.id]);
              if (next.size >= allFish.length) {
                setTimeout(() => setStage("success"), 600);
              }
              return next;
            });
            return;
          } else {
            // Wrong pair — shake!
            setShake(id);
            setTimeout(() => setShake(null), 600);
            // Bounce back
            setPositions((prev) => ({
              ...prev,
              [id]: { x: draggedFish.baseX, y: draggedFish.baseY },
            }));
            return;
          }
        }
      }

      // No overlap — snap back
      setPositions((prev) => ({
        ...prev,
        [id]: { x: draggedFish.baseX, y: draggedFish.baseY },
      }));
    },
    [draggedId, positions, allFish, paired]
  );

  const getDialogueText = () => {
    if (stage === "intro") return introDialogue[introStep];
    if (stage === "success")
      return {
        bisayaText: "Maayo kaayo! Nagkasinabtanay na ang mga isda! 🐟✨",
        englishText: "Great job! The fish are friends now! 🐟✨",
      };
    const done = paired.size / 2;
    return {
      bisayaText: `${quest.instructionBisaya} (${done}/${pairs.length})`,
      englishText: `${quest.instructionEnglish} (${done}/${pairs.length})`,
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
          <span className="iqm-mechanic-badge" style={{ background: "#4FC3F7" }}>
            Synonym Pairs
          </span>
        </div>

        <div className="iqm-scene-canvas" ref={containerRef} style={{ background: "linear-gradient(180deg, #1a5276 0%, #1b4f72 40%, #154360 100%)", borderRadius: "12px" }}>
          {/* Water ripple effect */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "12px",
            background: "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 20px)",
            pointerEvents: "none",
          }} />

          {/* Fish */}
          {(stage === "playing" || stage === "success") &&
            allFish.map((fish) => {
              const pos = positions[fish.id];
              const isPaired = paired.has(fish.id);
              const isDragging = draggedId === fish.id;
              const isShaking = shake === fish.id;

              if (isPaired && stage !== "success") return null;

              return (
                <div
                  key={fish.id}
                  style={{
                    position: "absolute",
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) ${isShaking ? "rotate(10deg)" : ""} ${isPaired ? "scale(0.8)" : ""}`,
                    cursor: isPaired ? "default" : isDragging ? "grabbing" : "grab",
                    zIndex: isDragging ? 20 : 10,
                    transition: isDragging ? "none" : "left 0.4s ease, top 0.4s ease, transform 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    opacity: isPaired ? 0.4 : 1,
                    animation: isShaking ? "fish-shake 0.3s ease 2" : undefined,
                    userSelect: "none",
                  }}
                  onPointerDown={(e) => handlePointerDown(fish.id, e)}
                  onPointerMove={(e) => handlePointerMove(fish.id, e)}
                  onPointerUp={(e) => handlePointerUp(fish.id, e)}
                  onPointerCancel={(e) => handlePointerUp(fish.id, e)}
                >
                  <span style={{ fontSize: "32px", filter: `drop-shadow(0 2px 4px ${fish.color})` }}>🐟</span>
                  <span
                    style={{
                      background: fish.color,
                      color: "#fff",
                      fontSize: "11px",
                      fontFamily: "'Pixelify Sans', sans-serif",
                      fontWeight: "bold",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      whiteSpace: "nowrap",
                      boxShadow: `0 2px 6px ${fish.color}44`,
                    }}
                  >
                    {fish.word}
                  </span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
                    ({fish.meaning})
                  </span>
                </div>
              );
            })}

          {/* Progress pips */}
          {stage === "playing" && (
            <div className="iqm-sweep-progress" style={{ top: "8%", bottom: "auto" }}>
              {pairs.map((_, i) => (
                <div
                  key={i}
                  className={`iqm-sweep-pip ${paired.has(`a_${i}`) ? "iqm-sweep-pip--done" : ""}`}
                />
              ))}
            </div>
          )}

          {/* Success overlay */}
          {stage === "success" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🐟✨🐟</div>
                <div className="iqm-scene-success-text">Mga Isda Nagkahiusa Na!</div>
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
            {stage === "intro" && (
              <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>
            )}
            {stage === "success" && (
              <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fish-shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          25% { transform: translate(-50%, -50%) rotate(-15deg); }
          75% { transform: translate(-50%, -50%) rotate(15deg); }
        }
      `}</style>
    </div>
  );
};

export default FishPairGame;
