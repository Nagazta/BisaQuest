// ─────────────────────────────────────────────────────────────────────────────
//  FishPairGame.jsx — "Fish Families of Meaning"
//  Drag baby fish to their matching mother fish (small → small mother,
//  big → big mother).  After all are sorted, Lunti teaches synonyms then
//  antonyms through a short dialogue sequence.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback, useEffect } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Spread baby fish loosely in the centre strip (20%–80% x, 15%–75% y)
const initialPositions = (fish) => {
  const cols = 3;
  return Object.fromEntries(
    fish.map((f, i) => [
      f.id,
      {
        x: 22 + (i % cols) * 22 + Math.random() * 6 - 3,
        y: 22 + Math.floor(i / cols) * 30 + Math.random() * 6 - 3,
      },
    ])
  );
};

// ── component ─────────────────────────────────────────────────────────────────
const FishPairGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, synonymDialogue, antonymDialogue, babyFish } = quest;

  // Shuffle fish once on mount
  const fishList = useRef(shuffle(babyFish)).current;

  // ── stage machine ──────────────────────────────────────────────────────────
  // intro → playing → synonym_lesson → antonym_lesson → done
  const [stage, setStage] = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);

  // ── drag state ─────────────────────────────────────────────────────────────
  const [positions, setPositions] = useState(() => initialPositions(fishList));
  const [placed, setPlaced] = useState({}); // id → "small" | "big"
  const [draggedId, setDraggedId] = useState(null);
  const [shake, setShake] = useState(null);  // id of shaking fish
  const [hoveredId, setHoveredId] = useState(null);

  const containerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // ── swim animation (idle fish only) ───────────────────────────────────────
  useEffect(() => {
    if (stage !== "playing") return;
    const t = setInterval(() => {
      setPositions((prev) => {
        const next = { ...prev };
        fishList.forEach((f, idx) => {
          if (placed[f.id] || draggedId === f.id) return;
          const base = { x: 22 + (idx % 3) * 22, y: 22 + Math.floor(idx / 3) * 30 };
          next[f.id] = {
            x: base.x + Math.sin(Date.now() / 1300 + idx * 1.3) * 3,
            y: base.y + Math.sin(Date.now() / 1000 + idx * 0.9) * 2,
          };
        });
        return next;
      });
    }, 80);
    return () => clearInterval(t);
  }, [stage, placed, draggedId, fishList]);

  // ── dialogue advance ───────────────────────────────────────────────────────
  const currentDialogue = () => {
    if (stage === "intro") return introDialogue;
    if (stage === "synonym_lesson") return synonymDialogue;
    if (stage === "antonym_lesson") return antonymDialogue;
    return null;
  };

  const handleDialogueNext = () => {
    const lines = currentDialogue();
    if (!lines) return;
    if (dialogueStep < lines.length - 1) {
      setDialogueStep((s) => s + 1);
    } else {
      // Advance stage
      if (stage === "intro") { setStage("playing"); setDialogueStep(0); }
      else if (stage === "synonym_lesson") { setStage("antonym_lesson"); setDialogueStep(0); }
      else if (stage === "antonym_lesson") { setStage("done"); }
    }
  };

  // ── drag handlers ──────────────────────────────────────────────────────────
  const handlePointerDown = (id, e) => {
    if (stage !== "playing" || placed[id]) return;
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
      [id]: { x: Math.min(Math.max(x, 3), 97), y: Math.min(Math.max(y, 3), 97) },
    }));
  };

  const handlePointerUp = useCallback(
    (id, e) => {
      if (draggedId !== id) return;
      setDraggedId(null);
      try { e?.currentTarget?.releasePointerCapture(e.pointerId); } catch (_) {}

      const fish = fishList.find((f) => f.id === id);
      const pos = positions[id];
      if (!fish || !pos) return;

      // Drop zones: small mother = left 0%–18%, big mother = right 82%–100%
      const inSmallZone = pos.x < 18;
      const inBigZone = pos.x > 82;

      if (inSmallZone || inBigZone) {
        const targetZone = inSmallZone ? "small" : "big";
        if (fish.size === targetZone) {
          // ✅ Correct — snap to zone
          const newPlaced = { ...placed, [id]: targetZone };
          setPlaced(newPlaced);
          if (Object.keys(newPlaced).length >= fishList.length) {
            setTimeout(() => { setStage("synonym_lesson"); setDialogueStep(0); }, 700);
          }
        } else {
          // ❌ Wrong — shake and bounce back
          setShake(id);
          setTimeout(() => setShake(null), 600);
          setPositions((prev) => {
            const idx = fishList.findIndex((f) => f.id === id);
            const base = { x: 22 + (idx % 3) * 22, y: 22 + Math.floor(idx / 3) * 30 };
            return { ...prev, [id]: base };
          });
        }
      } else {
        // Dropped nowhere useful — snap back
        setPositions((prev) => {
          const idx = fishList.findIndex((f) => f.id === id);
          const base = { x: 22 + (idx % 3) * 22, y: 22 + Math.floor(idx / 3) * 30 };
          return { ...prev, [id]: base };
        });
      }
    },
    [draggedId, positions, fishList, placed]
  );

  // ── render helpers ─────────────────────────────────────────────────────────
  const placedSmall = fishList.filter((f) => placed[f.id] === "small");
  const placedBig = fishList.filter((f) => placed[f.id] === "big");
  const placedCount = Object.keys(placed).length;
  const total = fishList.length;

  const dialogueLine = currentDialogue()?.[dialogueStep];

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#2980b9" }}>
            Fish Families
          </span>
        </div>

        {/* ── Game Canvas ───────────────────────────────────────────────── */}
        <div
          className="iqm-scene-canvas"
          ref={containerRef}
          style={{
            background: "#1a6fa8",   /* plain blue pond water */
            borderRadius: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle water shimmer overlay */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "12px",
            background: "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.04) 20px, rgba(255,255,255,0.04) 22px)",
            pointerEvents: "none",
          }} />

          {/* ── Small Mother Fish (left) ───────────────────────────────── */}
          <div style={{
            position: "absolute", left: "1%", top: "15%",
            width: "15%", height: "70%",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 6,
            background: "rgba(255,255,255,0.10)",
            border: "2px dashed rgba(255,255,255,0.35)",
            borderRadius: 14,
          }}>
            <span style={{ fontSize: 38 }}>🐟</span>
            <span style={{ fontSize: 11, color: "#fff", fontWeight: "bold", textAlign: "center", lineHeight: 1.3 }}>
              Small<br />Mother
            </span>
            {/* placed small fish peek */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, marginTop: 4 }}>
              {placedSmall.map((f) => (
                <span key={f.id} style={{ fontSize: 16 }}>🐡</span>
              ))}
            </div>
          </div>

          {/* ── Big Mother Fish (right) ────────────────────────────────── */}
          <div style={{
            position: "absolute", right: "1%", top: "15%",
            width: "15%", height: "70%",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 6,
            background: "rgba(255,255,255,0.10)",
            border: "2px dashed rgba(255,255,255,0.35)",
            borderRadius: 14,
          }}>
            <span style={{ fontSize: 54 }}>🐠</span>
            <span style={{ fontSize: 11, color: "#fff", fontWeight: "bold", textAlign: "center", lineHeight: 1.3 }}>
              Big<br />Mother
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, marginTop: 4 }}>
              {placedBig.map((f) => (
                <span key={f.id} style={{ fontSize: 22 }}>🐡</span>
              ))}
            </div>
          </div>

          {/* ── Baby Fish ──────────────────────────────────────────────── */}
          {stage === "playing" &&
            fishList.map((fish) => {
              if (placed[fish.id]) return null;
              const pos = positions[fish.id];
              const isSmall = fish.size === "small";
              const isDragging = draggedId === fish.id;
              const isShaking = shake === fish.id;
              const isHovered = hoveredId === fish.id;

              return (
                <div
                  key={fish.id}
                  style={{
                    position: "absolute",
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) ${isShaking ? "rotate(12deg) scale(1.1)" : ""}`,
                    cursor: isDragging ? "grabbing" : "grab",
                    zIndex: isDragging ? 30 : isHovered ? 20 : 10,
                    transition: isDragging ? "none" : "left 0.35s ease, top 0.35s ease, transform 0.25s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    userSelect: "none",
                    animation: isShaking ? "fish-shake 0.3s ease 2" : undefined,
                  }}
                  onPointerDown={(e) => handlePointerDown(fish.id, e)}
                  onPointerMove={(e) => handlePointerMove(fish.id, e)}
                  onPointerUp={(e) => handlePointerUp(fish.id, e)}
                  onPointerCancel={(e) => handlePointerUp(fish.id, e)}
                  onMouseEnter={() => !isDragging && setHoveredId(fish.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <span style={{
                    fontSize: isSmall ? 22 : 36,
                    filter: isDragging
                      ? "drop-shadow(0 4px 8px rgba(255,255,255,0.6))"
                      : "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                  }}>
                    🐟
                  </span>

                  {/* Hover tooltip */}
                  {isHovered && !isDragging && (
                    <div style={{
                      position: "absolute",
                      bottom: "110%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0,0,0,0.82)",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "5px 10px",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      zIndex: 50,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: "bold", color: "#7ecfff" }}>
                        {fish.tooltipBisaya}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
                        {fish.tooltipEnglish}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          }

          {/* ── Antonym lesson: show both groups side-by-side ─────────── */}
          {stage === "antonym_lesson" && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 32,
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>🐟</div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: "bold", marginTop: 4 }}>
                  Gamay / Small
                </div>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 6 }}>
                  {[0, 1, 2].map((i) => <span key={i} style={{ fontSize: 18 }}>🐡</span>)}
                </div>
              </div>
              <div style={{
                color: "#fff", fontSize: 28, fontWeight: "bold",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}>
                ≠
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64 }}>🐠</div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: "bold", marginTop: 4 }}>
                  Dako / Big
                </div>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 6 }}>
                  {[0, 1, 2].map((i) => <span key={i} style={{ fontSize: 24 }}>🐡</span>)}
                </div>
              </div>
            </div>
          )}

          {/* ── Synonym lesson: show single grouped success view ───────── */}
          {stage === "synonym_lesson" && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 42, marginBottom: 8 }}>🐟✨🐟</div>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>
                  Mga pamilya nagtapok na! · Fish families united!
                </div>
              </div>
            </div>
          )}

          {/* ── Progress bar (playing) ─────────────────────────────────── */}
          {stage === "playing" && (
            <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
              {fishList.map((f) => (
                <div
                  key={f.id}
                  className={`iqm-sweep-pip ${placed[f.id] ? "iqm-sweep-pip--done" : ""}`}
                />
              ))}
            </div>
          )}

          {/* ── Done success overlay ───────────────────────────────────── */}
          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🌟🐟🌟</div>
                <div className="iqm-scene-success-text">Natun-an na! · Lesson Complete!</div>
              </div>
            </div>
          )}
        </div>

        {/* ── NPC Dialogue Row ──────────────────────────────────────────── */}
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
                    I-drag ang bata nga isda sa ilang mama! ({placedCount}/{total})
                  </span>
                  <span className="iqm-dialogue-english">
                    Drag the baby fish to their mother! ({placedCount}/{total})
                  </span>
                </>
              ) : stage === "done" ? (
                <>
                  <span className="iqm-dialogue-bisaya">Nahuman na! Maayo kaayo! 🎉</span>
                  <span className="iqm-dialogue-english">All done! Great work! 🎉</span>
                </>
              ) : null}
            </div>

            {/* Advance button during dialogue stages */}
            {(stage === "intro" || stage === "synonym_lesson" || stage === "antonym_lesson") && (
              <button className="iqm-next-btn" onClick={handleDialogueNext}>▶</button>
            )}
            {/* Finish button */}
            {stage === "done" && (
              <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fish-shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
          25%       { transform: translate(-50%, -50%) rotate(-14deg) scale(1.1); }
          75%       { transform: translate(-50%, -50%) rotate(14deg) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default FishPairGame;
