// ─────────────────────────────────────────────────────────────────────────────
//  CaveLightGame.jsx — "Cave Light"
//  Player picks a light source from a top bar, then clicks one of 3 dark cave
//  zones to place it. Correct (torch/lantern/stone/crystal) → zone lights up.
//  Wrong (rock/leaf/drop/wood) → gentle shake. All 3 lit → lessons → done.
//  Plain dark background (placeholder).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";

// ── Cave SVG zone ─────────────────────────────────────────────────────────────
const CaveZone = ({ zone, lit, selected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      position: "absolute",
      left: `${zone.x}%`, top: `${zone.y}%`,
      transform: "translate(-50%, -50%)",
      width: 72, height: 72,
      borderRadius: "50%",
      background: lit
        ? "radial-gradient(circle, rgba(255,220,80,0.85) 0%, rgba(200,120,0,0.3) 70%, transparent 100%)"
        : "radial-gradient(circle, rgba(20,20,30,0.9) 0%, rgba(10,5,20,0.7) 100%)",
      border: selected && !lit ? "2px dashed rgba(255,180,0,0.6)" : "2px solid rgba(255,255,255,0.1)",
      cursor: selected && !lit ? "pointer" : "default",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background 0.5s ease, filter 0.3s ease",
      filter: lit ? "drop-shadow(0 0 16px rgba(255,200,50,0.9))" : "none",
      zIndex: 5,
    }}
  >
    {lit && <span style={{ fontSize: 22 }}>💡</span>}
    {!lit && selected && <span style={{ fontSize: 11, color: "rgba(255,180,0,0.8)", fontFamily: "'Pixelify Sans', sans-serif" }}>Click here</span>}
    {!lit && !selected && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Pixelify Sans', sans-serif" }}>Dark</span>}
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const CaveLightGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, synonymDialogue, antonymDialogue, zones, items } = quest;

  const [stage,        setStage]        = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null); // id of chosen item
  const [litZones,     setLitZones]     = useState(new Set());
  const [shakeItem,    setShakeItem]    = useState(null);

  const correctItems = items.filter((i) => i.correct);
  const wrongItems   = items.filter((i) => !i.correct);
  const litCount     = litZones.size;

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

  const handleZoneClick = (zoneId) => {
    if (stage !== "playing" || !selectedItem || litZones.has(zoneId)) return;
    const chosen = items.find((i) => i.id === selectedItem);
    if (!chosen) return;

    if (chosen.correct) {
      const next = new Set([...litZones, zoneId]);
      setLitZones(next);
      setSelectedItem(null);
      if (next.size >= zones.length) {
        setTimeout(() => { setStage("synonym_lesson"); setDialogueStep(0); }, 700);
      }
    } else {
      setShakeItem(selectedItem);
      setTimeout(() => { setShakeItem(null); setSelectedItem(null); }, 500);
    }
  };

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#f57f17" }}>Cave Light</span>
        </div>

        {/* ── Game Canvas ───────────────────────────────────────────────── */}
        <div className="iqm-scene-canvas" style={{
          background: "linear-gradient(160deg, #0a0612 0%, #120820 100%)",
          borderRadius: "12px", position: "relative", overflow: "hidden",
        }}>
          {stage === "playing" && (
            <>
              {/* Item picker row (top) */}
              <div style={{
                position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: 8, zIndex: 15,
              }}>
                {items.map((it) => (
                  <div
                    key={it.id}
                    onClick={() => setSelectedItem(it.id === selectedItem ? null : it.id)}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: selectedItem === it.id
                        ? "rgba(255,200,50,0.35)"
                        : "rgba(255,255,255,0.08)",
                      border: selectedItem === it.id
                        ? "2px solid rgba(255,200,50,0.9)"
                        : "1px solid rgba(255,255,255,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, cursor: "pointer",
                      animation: shakeItem === it.id ? "pad-shake 0.4s ease" : undefined,
                      transition: "background 0.2s",
                    }}
                    title={it.label}
                  >
                    {it.emoji}
                  </div>
                ))}
              </div>

              {/* Cave zones */}
              {zones.map((z) => (
                <CaveZone
                  key={z.id}
                  zone={z}
                  lit={litZones.has(z.id)}
                  selected={!!selectedItem && !litZones.has(z.id)}
                  onClick={() => handleZoneClick(z.id)}
                />
              ))}

              {/* Progress pips */}
              <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
                {zones.map((_, i) => (
                  <div key={i} className={`iqm-sweep-pip ${i < litCount ? "iqm-sweep-pip--done" : ""}`} />
                ))}
              </div>

              {/* Hint */}
              {!selectedItem && (
                <div style={{
                  position: "absolute", bottom: "8%", left: "50%", transform: "translateX(-50%)",
                  color: "rgba(255,220,80,0.7)", fontSize: 11, fontFamily: "'Pixelify Sans', sans-serif",
                  whiteSpace: "nowrap",
                }}>
                  Pilia ang tinubdan sa kahayag · Pick a light source
                </div>
              )}
            </>
          )}

          {/* Synonym lesson */}
          {stage === "synonym_lesson" && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
            }}>
              {correctItems.map((it, i) => (
                <React.Fragment key={it.id}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, filter: "drop-shadow(0 0 8px rgba(255,220,80,0.9))" }}>{it.emoji}</div>
                    <div style={{ color: "#ffeb80", fontSize: 10, marginTop: 4, fontWeight: "bold" }}>{it.label}</div>
                  </div>
                  {i < correctItems.length - 1 && <span style={{ color: "#ffeb80", fontSize: 20, fontWeight: "bold" }}>≈</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Antonym lesson */}
          {stage === "antonym_lesson" && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 28,
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, filter: "drop-shadow(0 0 12px rgba(255,220,80,0.9))" }}>🔦</div>
                <div style={{ color: "#ffeb80", fontSize: 11, marginTop: 6, fontWeight: "bold" }}>Kahayag / Light</div>
              </div>
              <span style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>↔</span>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36 }}>🌑</div>
                <div style={{ color: "#ef9a9a", fontSize: 11, marginTop: 6, fontWeight: "bold" }}>Kangitngit / Dark</div>
              </div>
            </div>
          )}

          {/* Done */}
          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">💡✨💡</div>
                <div className="iqm-scene-success-text">Nahayagan na ang Langob! · Cave Illuminated!</div>
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
                  <span className="iqm-dialogue-bisaya">Pilia ang kahayag ug ibutang sa ngitngit! ({litCount}/{zones.length})</span>
                  <span className="iqm-dialogue-english">Pick a light source and place it in the darkness! ({litCount}/{zones.length})</span>
                </>
              ) : stage === "done" ? (
                <>
                  <span className="iqm-dialogue-bisaya">Nahayagan na ang langob! ✨</span>
                  <span className="iqm-dialogue-english">The cave is lit! ✨</span>
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
          0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)}
        }
      `}</style>
    </div>
  );
};

export default CaveLightGame;
