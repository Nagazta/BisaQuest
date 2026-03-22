// ─────────────────────────────────────────────────────────────────────────────
//  LanternGuideGame.jsx — "Guiding the Light"
//  A central lantern can be rotated in 45° steps with ◀ / ▶ buttons.
//  3 targets are positioned around it. When the beam angle matches a target,
//  clicking the ✓ "confirm" button lights that target up.
//  All 3 lit → synonym lesson → antonym lesson → done.
//  Plain dark-purple background (placeholder).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";

// ── Lantern + Beam SVG ────────────────────────────────────────────────────────
const LanternSVG = ({ angle, litTargets, targets }) => {
  const cx = 100, cy = 100, beamLen = 75;
  const rad = (angle - 90) * (Math.PI / 180);
  const beamX = cx + Math.cos(rad) * beamLen;
  const beamY = cy + Math.sin(rad) * beamLen;

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {/* Dark background ring */}
      <circle cx={cx} cy={cy} r={90} fill="rgba(10,5,30,0.5)" />

      {/* Targets */}
      {targets.map((t) => {
        const tRad = (t.requiredAngle - 90) * (Math.PI / 180);
        const dist = 74;
        const tx = cx + Math.cos(tRad) * dist;
        const ty = cy + Math.sin(tRad) * dist;
        const isLit = litTargets.has(t.id);
        return (
          <g key={t.id}>
            <circle cx={tx} cy={ty} r={14}
              fill={isLit ? "rgba(255,220,80,0.35)" : "rgba(50,30,80,0.8)"}
              stroke={isLit ? "rgba(255,220,80,0.9)" : "rgba(150,100,200,0.5)"}
              strokeWidth="2"
            />
            {isLit && (
              <circle cx={tx} cy={ty} r={14} fill="none"
                stroke="rgba(255,220,80,0.6)" strokeWidth="4"
                style={{ filter: "blur(2px)" }}
              />
            )}
            <text x={tx} y={ty + 5} textAnchor="middle" fontSize="14">
              {t.emoji}
            </text>
          </g>
        );
      })}

      {/* Light beam */}
      <line
        x1={cx} y1={cy} x2={beamX} y2={beamY}
        stroke="rgba(255,230,100,0.7)" strokeWidth="8" strokeLinecap="round"
        style={{ filter: "blur(3px)" }}
      />
      <line
        x1={cx} y1={cy} x2={beamX} y2={beamY}
        stroke="rgba(255,245,200,0.9)" strokeWidth="3" strokeLinecap="round"
      />

      {/* Lantern body */}
      <rect x={cx - 12} y={cy - 16} width={24} height={32} rx={5}
        fill="#f9a825" stroke="#f57f17" strokeWidth="2" />
      <rect x={cx - 8}  y={cy - 12} width={16} height={24} rx={3}
        fill="rgba(255,250,200,0.85)" />
      {/* Handle */}
      <path d={`M ${cx - 6} ${cy - 16} Q ${cx} ${cy - 26} ${cx + 6} ${cy - 16}`}
        stroke="#f57f17" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const LanternGuideGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, synonymDialogue, antonymDialogue, targets, rotationStep } = quest;

  const [stage,        setStage]        = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);
  const [angle,        setAngle]        = useState(0);
  const [litTargets,   setLitTargets]   = useState(new Set());

  const litCount = litTargets.size;

  // Normalise angle to 0-359
  const normalise = (a) => ((a % 360) + 360) % 360;

  const targetAtAngle = targets.find(
    (t) => !litTargets.has(t.id) && Math.abs(normalise(angle) - t.requiredAngle) < rotationStep / 2
  );

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

  const rotate = (dir) => {
    if (stage !== "playing") return;
    setAngle((a) => normalise(a + dir * rotationStep));
  };

  const confirmLight = () => {
    if (!targetAtAngle) return;
    const next = new Set([...litTargets, targetAtAngle.id]);
    setLitTargets(next);
    if (next.size >= targets.length) {
      setTimeout(() => { setStage("synonym_lesson"); setDialogueStep(0); }, 700);
    }
  };

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#6a1b9a" }}>Guiding Light</span>
        </div>

        {/* ── Game Canvas ───────────────────────────────────────────────── */}
        <div className="iqm-scene-canvas" style={{
          background: "linear-gradient(160deg, #0f0120 0%, #1a0535 100%)",
          borderRadius: "12px", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          {/* Star-field shimmer */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, rgba(100,40,160,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {stage === "playing" && (
            <>
              {/* Lantern SVG */}
              <div style={{ zIndex: 2, marginBottom: 12 }}>
                <LanternSVG angle={angle} litTargets={litTargets} targets={targets} />
              </div>

              {/* Rotation controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, zIndex: 2 }}>
                <button
                  onClick={() => rotate(-1)}
                  style={{
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff", borderRadius: 10, width: 44, height: 44,
                    fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >◀</button>

                {/* Confirm button — only shown when beam aligns with a target */}
                <button
                  onClick={confirmLight}
                  disabled={!targetAtAngle}
                  style={{
                    background: targetAtAngle ? "rgba(255,200,50,0.3)" : "rgba(100,100,100,0.15)",
                    border: targetAtAngle ? "2px solid rgba(255,200,50,0.8)" : "1px solid rgba(100,100,100,0.3)",
                    color: targetAtAngle ? "#ffd54f" : "rgba(180,180,180,0.4)",
                    borderRadius: 12, padding: "6px 18px",
                    fontSize: 13, fontFamily: "'Pixelify Sans', sans-serif", fontWeight: "bold",
                    cursor: targetAtAngle ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    filter: targetAtAngle ? "drop-shadow(0 0 8px rgba(255,200,50,0.6))" : "none",
                  }}
                >
                  {targetAtAngle ? `✓ Light ${targetAtAngle.emoji}` : "—"}
                </button>

                <button
                  onClick={() => rotate(1)}
                  style={{
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff", borderRadius: 10, width: 44, height: 44,
                    fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >▶</button>
              </div>

              {/* Angle indicator */}
              <div style={{ color: "rgba(200,150,255,0.6)", fontSize: 10, marginTop: 6,
                fontFamily: "'Pixelify Sans', sans-serif" }}>
                Beam: {normalise(angle)}° | Targets left: {targets.length - litCount}
              </div>

              {/* Progress pips */}
              <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
                {targets.map((_, i) => (
                  <div key={i} className={`iqm-sweep-pip ${i < litCount ? "iqm-sweep-pip--done" : ""}`} />
                ))}
              </div>
            </>
          )}

          {/* Synonym lesson */}
          {stage === "synonym_lesson" && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
            }}>
              {targets.map((t, i) => (
                <React.Fragment key={t.id}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 30, filter: "drop-shadow(0 0 10px rgba(255,220,80,0.9))" }}>{t.emoji}</div>
                    <div style={{ color: "#ffd54f", fontSize: 10, marginTop: 4, fontWeight: "bold" }}>{t.label}</div>
                  </div>
                  {i < targets.length - 1 && <span style={{ color: "#ffd54f", fontSize: 20, fontWeight: "bold" }}>≈</span>}
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
                <div style={{ fontSize: 36, filter: "drop-shadow(0 0 14px rgba(255,220,80,0.9))" }}>🏮</div>
                <div style={{ color: "#ffd54f", fontSize: 11, marginTop: 6, fontWeight: "bold" }}>Hayag / Light</div>
              </div>
              <span style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>↔</span>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36 }}>🌑</div>
                <div style={{ color: "#b39ddb", fontSize: 11, marginTop: 6, fontWeight: "bold" }}>Ngitngit / Dark</div>
              </div>
            </div>
          )}

          {/* Done */}
          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🏮✨🏮</div>
                <div className="iqm-scene-success-text">Gihayagan na ang Tanan! · All Guided!</div>
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
                  <span className="iqm-dialogue-bisaya">I-ikot ang lampara, ictik ✓ aron mahayagan! ({litCount}/{targets.length})</span>
                  <span className="iqm-dialogue-english">Rotate the lamp, then press ✓ to light a target! ({litCount}/{targets.length})</span>
                </>
              ) : stage === "done" ? (
                <>
                  <span className="iqm-dialogue-bisaya">Gihayagan nimo ang tanan! 🏮</span>
                  <span className="iqm-dialogue-english">You lit them all! 🏮</span>
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
    </div>
  );
};

export default LanternGuideGame;
