import React, { useState, useRef, useCallback } from "react";

const SquirrelSortGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { data } = quest;
  const { zoneA, zoneB, nuts } = data;

  const [stage, setStage] = useState("intro");
  const [introStep, setIntroStep] = useState(0);
  const [positions, setPositions] = useState(
    Object.fromEntries(
      nuts.map((n, i) => [
        n.id,
        { x: 35 + (i % 2) * 30, y: 30 + Math.floor(i / 2) * 25 },
      ])
    )
  );
  const [placed, setPlaced] = useState(new Set());
  const [draggedId, setDraggedId] = useState(null);
  const [wrongFlash, setWrongFlash] = useState(null);

  const containerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const introDialogue = [
    {
      bisayaText: `${item.emoji} ${item.labelBisaya}! Ang mga unggoy nasagol ang ilang bunga!`,
      englishText: `${item.emoji} ${item.labelEnglish}! The squirrels' nuts got mixed up!`,
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

  // Zone bounds (percentage-based)
  const ZONE_A = { x: 2, y: 20, w: 22, h: 60 };
  const ZONE_B = { x: 76, y: 20, w: 22, h: 60 };

  const inZone = (pos, zone) =>
    pos.x > zone.x && pos.x < zone.x + zone.w &&
    pos.y > zone.y && pos.y < zone.y + zone.h;

  const handlePointerDown = (id, e) => {
    if (stage !== "playing" || placed.has(id)) return;
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
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { }
      }

      const nut = nuts.find((n) => n.id === id);
      const pos = positions[id];
      if (!nut || !pos) return;

      const droppedInA = inZone(pos, ZONE_A);
      const droppedInB = inZone(pos, ZONE_B);

      const correctZone = nut.correctZone; // "A" or "B"
      const isCorrect = (correctZone === "A" && droppedInA) || (correctZone === "B" && droppedInB);

      if (droppedInA || droppedInB) {
        if (isCorrect) {
          setPlaced((prev) => {
            const next = new Set([...prev, id]);
            if (next.size >= nuts.length) {
              setTimeout(() => setStage("success"), 500);
            }
            return next;
          });
        } else {
          // Wrong zone — flash and bounce back
          setWrongFlash(id);
          setTimeout(() => setWrongFlash(null), 600);
          const origIdx = nuts.findIndex((n) => n.id === id);
          setPositions((prev) => ({
            ...prev,
            [id]: { x: 35 + (origIdx % 2) * 30, y: 30 + Math.floor(origIdx / 2) * 25 },
          }));
        }
      } else {
        // Not in any zone — snap back
        const origIdx = nuts.findIndex((n) => n.id === id);
        setPositions((prev) => ({
          ...prev,
          [id]: { x: 35 + (origIdx % 2) * 30, y: 30 + Math.floor(origIdx / 2) * 25 },
        }));
      }
    },
    [draggedId, positions, nuts]
  );

  const getDialogueText = () => {
    if (stage === "intro") return introDialogue[introStep];
    if (stage === "success")
      return {
        bisayaText: "Maayo kaayo! Nabahin na ang mga bunga sa husto! 🐿️🥜",
        englishText: "Great job! The nuts are properly sorted! 🐿️🥜",
      };
    return {
      bisayaText: `${quest.instructionBisaya} (${placed.size}/${nuts.length})`,
      englishText: `${quest.instructionEnglish} (${placed.size}/${nuts.length})`,
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
          <span className="iqm-mechanic-badge" style={{ background: "#FF7043" }}>
            Antonym Sort
          </span>
        </div>

        <div
          className="iqm-scene-canvas"
          ref={containerRef}
          style={{
            background: "linear-gradient(180deg, #2E7D32 0%, #1B5E20 50%, #33691E 100%)",
            borderRadius: "12px",
            position: "relative",
          }}
        >
          {/* Zone A — Left squirrel hollow */}
          {stage !== "intro" && (
            <div style={{
              position: "absolute", left: `${ZONE_A.x}%`, top: `${ZONE_A.y}%`,
              width: `${ZONE_A.w}%`, height: `${ZONE_A.h}%`,
              border: "3px dashed rgba(255,255,255,0.4)", borderRadius: "20px",
              backgroundColor: "rgba(139,69,19,0.3)",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "flex-start", paddingTop: "8px",
              pointerEvents: "none",
            }}>
              <span style={{ fontSize: "28px" }}>🐿️</span>
              <span style={{
                background: "rgba(0,0,0,0.6)", color: "#FFD54F",
                padding: "3px 10px", borderRadius: "8px", fontSize: "13px",
                fontFamily: "'Pixelify Sans', sans-serif", fontWeight: "bold",
                marginTop: "4px",
              }}>
                {zoneA.word}
              </span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>
                ({zoneA.meaning})
              </span>
            </div>
          )}

          {/* Zone B — Right squirrel hollow */}
          {stage !== "intro" && (
            <div style={{
              position: "absolute", left: `${ZONE_B.x}%`, top: `${ZONE_B.y}%`,
              width: `${ZONE_B.w}%`, height: `${ZONE_B.h}%`,
              border: "3px dashed rgba(255,255,255,0.4)", borderRadius: "20px",
              backgroundColor: "rgba(139,69,19,0.3)",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "flex-start", paddingTop: "8px",
              pointerEvents: "none",
            }}>
              <span style={{ fontSize: "28px" }}>🐿️</span>
              <span style={{
                background: "rgba(0,0,0,0.6)", color: "#FFD54F",
                padding: "3px 10px", borderRadius: "8px", fontSize: "13px",
                fontFamily: "'Pixelify Sans', sans-serif", fontWeight: "bold",
                marginTop: "4px",
              }}>
                {zoneB.word}
              </span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>
                ({zoneB.meaning})
              </span>
            </div>
          )}

          {/* Nuts */}
          {(stage === "playing" || stage === "success") &&
            nuts.map((nut) => {
              const pos = positions[nut.id];
              const isPlaced = placed.has(nut.id);
              const isDragging = draggedId === nut.id;
              const isWrong = wrongFlash === nut.id;

              return (
                <div
                  key={nut.id}
                  style={{
                    position: "absolute",
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) ${isWrong ? "rotate(15deg)" : ""}`,
                    cursor: isPlaced ? "default" : isDragging ? "grabbing" : "grab",
                    zIndex: isDragging ? 20 : 10,
                    transition: isDragging ? "none" : "left 0.3s ease, top 0.3s ease, transform 0.3s ease",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
                    opacity: isPlaced ? 0.5 : 1,
                    userSelect: "none",
                  }}
                  onPointerDown={(e) => handlePointerDown(nut.id, e)}
                  onPointerMove={(e) => handlePointerMove(nut.id, e)}
                  onPointerUp={(e) => handlePointerUp(nut.id, e)}
                  onPointerCancel={(e) => handlePointerUp(nut.id, e)}
                >
                  <span style={{ fontSize: "26px" }}>🥜</span>
                  <span style={{
                    background: isPlaced ? "rgba(76,175,80,0.8)" : "rgba(0,0,0,0.7)",
                    color: "#fff", fontSize: "11px",
                    fontFamily: "'Pixelify Sans', sans-serif", fontWeight: "bold",
                    padding: "2px 8px", borderRadius: "8px", whiteSpace: "nowrap",
                  }}>
                    {isPlaced ? "✓ " : ""}{nut.word}
                  </span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
                    ({nut.meaning})
                  </span>
                </div>
              );
            })}

          {/* Progress pips */}
          {stage === "playing" && (
            <div className="iqm-sweep-progress" style={{ top: "8%", bottom: "auto" }}>
              {nuts.map((n) => (
                <div key={n.id} className={`iqm-sweep-pip ${placed.has(n.id) ? "iqm-sweep-pip--done" : ""}`} />
              ))}
            </div>
          )}

          {/* Success overlay */}
          {stage === "success" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🐿️🥜🐿️</div>
                <div className="iqm-scene-success-text">Nabahin na ang Bunga!</div>
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

export default SquirrelSortGame;
