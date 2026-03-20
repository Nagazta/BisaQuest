// ─────────────────────────────────────────────────────────────────────────────
//  FrogBridgeGame.jsx — Bridge builder: place antonym stones on lily pads
//  A row of lily pads forms a bridge. Some have words, others are empty slots.
//  Player drags word-stones from the bottom to fill each empty slot with
//  the ANTONYM of the adjacent pad's word.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback } from "react";

const FrogBridgeGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { slots } = quest;

  // Build the bridge layout: [word pad, empty slot, word pad, empty slot, ...]
  const bridgeLayout = slots.flatMap((slot, i) => [
    { type: "pad", word: slot.padWord, meaning: slot.padMeaning, slotIndex: i },
    { type: "slot", expectedWord: slot.stoneWord, expectedMeaning: slot.stoneMeaning, slotIndex: i },
  ]);

  // Stones at the bottom (shuffled)
  const stonesRef = useRef(
    [...slots]
      .sort(() => Math.random() - 0.5)
      .map((slot, i) => ({
        id: `stone_${i}`,
        word: slot.stoneWord,
        meaning: slot.stoneMeaning,
        slotIndex: slot.padMeaning === slots.find(s => s.stoneWord === slot.stoneWord)?.padMeaning
          ? slots.findIndex(s => s.stoneWord === slot.stoneWord)
          : i,
        startX: 15 + i * 28,
        startY: 82,
      }))
  ).current;

  // Re-map slotIndex correctly
  const stones = stonesRef.map((stone) => ({
    ...stone,
    slotIndex: slots.findIndex((s) => s.stoneWord === stone.word),
  }));

  const [stage, setStage] = useState("intro");
  const [introStep, setIntroStep] = useState(0);
  const [positions, setPositions] = useState(
    Object.fromEntries(stones.map((s) => [s.id, { x: s.startX, y: s.startY }]))
  );
  const [filled, setFilled] = useState({}); // slotIndex → stoneId
  const [draggedId, setDraggedId] = useState(null);
  const [splashId, setSplashId] = useState(null);
  const [frogProgress, setFrogProgress] = useState(0);

  const containerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const introDialogue = [
    {
      bisayaText: `${item.emoji} ${item.labelBisaya}! Ang tulay sa mga baki nabuak!`,
      englishText: `${item.emoji} ${item.labelEnglish}! The frogs' bridge is broken!`,
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

  // Slot positions (percentage)
  const getSlotPos = (index) => {
    const totalItems = bridgeLayout.length;
    const spacing = 80 / totalItems;
    return { x: 10 + index * spacing, y: 40 };
  };

  const handlePointerDown = (id, e) => {
    if (stage !== "playing") return;
    // Don't allow dragging already-placed stones
    if (Object.values(filled).includes(id)) return;
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
    setPositions((prev) => ({ ...prev, [id]: { x: Math.min(Math.max(x, 2), 98), y: Math.min(Math.max(y, 2), 98) } }));
  };

  const handlePointerUp = useCallback(
    (id, e) => {
      if (draggedId !== id) return;
      setDraggedId(null);
      if (e?.currentTarget && e.pointerId != null) {
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
      }

      const stone = stones.find((s) => s.id === id);
      const pos = positions[id];
      if (!stone || !pos) return;

      // Check proximity to each empty slot
      const emptySlots = bridgeLayout
        .map((item, idx) => ({ ...item, layoutIdx: idx }))
        .filter((item) => item.type === "slot" && !filled[item.slotIndex]);

      for (const slot of emptySlots) {
        const slotPos = getSlotPos(slot.layoutIdx);
        const dist = Math.sqrt((pos.x - slotPos.x) ** 2 + (pos.y - slotPos.y) ** 2);

        if (dist < 12) {
          // Check if correct antonym
          if (stone.slotIndex === slot.slotIndex) {
            // Correct!
            setFilled((prev) => {
              const next = { ...prev, [slot.slotIndex]: id };
              const filledCount = Object.keys(next).length;
              setFrogProgress(filledCount);
              if (filledCount >= slots.length) {
                setTimeout(() => setStage("success"), 700);
              }
              return next;
            });
            // Snap stone into the slot position
            setPositions((prev) => ({ ...prev, [id]: slotPos }));
            return;
          } else {
            // Wrong — splash animation
            setSplashId(id);
            setTimeout(() => setSplashId(null), 600);
            setPositions((prev) => ({ ...prev, [id]: { x: stone.startX, y: stone.startY } }));
            return;
          }
        }
      }

      // Not near any slot — snap back
      setPositions((prev) => ({ ...prev, [id]: { x: stone.startX, y: stone.startY } }));
    },
    [draggedId, positions, stones, filled, bridgeLayout, slots]
  );

  const getDialogueText = () => {
    if (stage === "intro") return introDialogue[introStep];
    if (stage === "success")
      return {
        bisayaText: "Maayo kaayo! Nakatabok na ang mga baki! 🐸🌿",
        englishText: "Great job! The frogs crossed safely! 🐸🌿",
      };
    return {
      bisayaText: `${quest.instructionBisaya} (${frogProgress}/${slots.length})`,
      englishText: `${quest.instructionEnglish} (${frogProgress}/${slots.length})`,
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
          <span className="iqm-mechanic-badge" style={{ background: "#66BB6A" }}>
            Antonym Bridge
          </span>
        </div>

        <div
          className="iqm-scene-canvas"
          ref={containerRef}
          style={{
            background: "linear-gradient(180deg, #4a148c 0%, #1a237e 30%, #0d47a1 60%, #01579b 100%)",
            borderRadius: "12px",
            position: "relative",
          }}
        >
          {/* Water surface */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
            background: "linear-gradient(180deg, rgba(1,87,155,0.3) 0%, rgba(0,96,100,0.5) 100%)",
            borderRadius: "0 0 12px 12px", pointerEvents: "none",
          }} />

          {/* Bridge layout */}
          {(stage === "playing" || stage === "success") &&
            bridgeLayout.map((layoutItem, idx) => {
              const pos = getSlotPos(idx);
              const isFilled = layoutItem.type === "slot" && filled[layoutItem.slotIndex];

              return (
                <div
                  key={`bridge_${idx}`}
                  style={{
                    position: "absolute",
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: "translate(-50%, -50%)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                    pointerEvents: "none",
                  }}
                >
                  {/* Lily pad */}
                  <span style={{
                    fontSize: layoutItem.type === "pad" ? "30px" : "26px",
                    opacity: layoutItem.type === "slot" && !isFilled ? 0.4 : 1,
                  }}>
                    🍃
                  </span>

                  {/* Word label */}
                  {layoutItem.type === "pad" && (
                    <span style={{
                      background: "rgba(76,175,80,0.85)", color: "#fff",
                      padding: "2px 8px", borderRadius: "8px", fontSize: "11px",
                      fontFamily: "'Pixelify Sans', sans-serif", fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}>
                      {layoutItem.word}
                      <span style={{ fontSize: "9px", opacity: 0.8, marginLeft: "3px" }}>
                        ({layoutItem.meaning})
                      </span>
                    </span>
                  )}

                  {/* Empty slot marker */}
                  {layoutItem.type === "slot" && !isFilled && (
                    <span style={{
                      border: "2px dashed rgba(255,255,255,0.4)",
                      padding: "2px 14px", borderRadius: "8px", fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "'Pixelify Sans', sans-serif",
                    }}>
                      ???
                    </span>
                  )}

                  {/* Frog on completed sections */}
                  {layoutItem.type === "slot" && isFilled && (
                    <span style={{ fontSize: "18px", marginTop: "-26px" }}>🐸</span>
                  )}
                </div>
              );
            })}

          {/* Draggable stones at bottom */}
          {(stage === "playing" || stage === "success") &&
            stones.map((stone) => {
              const pos = positions[stone.id];
              const isPlaced = Object.values(filled).includes(stone.id);
              const isDragging = draggedId === stone.id;
              const isSplash = splashId === stone.id;

              if (isPlaced) return null;

              return (
                <div
                  key={stone.id}
                  style={{
                    position: "absolute",
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) ${isSplash ? "scale(0.7)" : ""}`,
                    cursor: isDragging ? "grabbing" : "grab",
                    zIndex: isDragging ? 20 : 10,
                    transition: isDragging ? "none" : "left 0.3s ease, top 0.3s ease, transform 0.3s ease",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
                    opacity: isSplash ? 0.5 : 1,
                    userSelect: "none",
                  }}
                  onPointerDown={(e) => handlePointerDown(stone.id, e)}
                  onPointerMove={(e) => handlePointerMove(stone.id, e)}
                  onPointerUp={(e) => handlePointerUp(stone.id, e)}
                  onPointerCancel={(e) => handlePointerUp(stone.id, e)}
                >
                  <span style={{ fontSize: "22px" }}>🪨</span>
                  <span style={{
                    background: "rgba(121,85,72,0.9)", color: "#fff",
                    padding: "2px 8px", borderRadius: "8px", fontSize: "11px",
                    fontFamily: "'Pixelify Sans', sans-serif", fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}>
                    {stone.word}
                  </span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
                    ({stone.meaning})
                  </span>
                </div>
              );
            })}

          {/* Progress pips */}
          {stage === "playing" && (
            <div className="iqm-sweep-progress" style={{ top: "8%", bottom: "auto" }}>
              {slots.map((_, i) => (
                <div key={i} className={`iqm-sweep-pip ${filled[i] ? "iqm-sweep-pip--done" : ""}`} />
              ))}
            </div>
          )}

          {/* Success overlay */}
          {stage === "success" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🐸🌿🐸</div>
                <div className="iqm-scene-success-text">Nakatabok na ang mga Baki!</div>
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
      </div>
    </div>
  );
};

export default FrogBridgeGame;
