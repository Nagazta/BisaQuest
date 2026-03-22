// ─────────────────────────────────────────────────────────────────────────────
//  BloomRevivalGame.jsx — "Bloom Revival"
//  3 sliders (Light / Water / Wind) must each be dragged into a green target
//  zone. The SVG flower animates from wilted → blooming as more sliders land
//  in their zones. After all 3 → synonym lesson → antonym lesson → done.
//  Plain dark-green background (placeholder until image added).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useCallback } from "react";

// ── Flower SVG: wilted (0) → budding (1-2) → bloomed (3) ─────────────────────
const FlowerSVG = ({ balancedCount }) => {
  const bloom = balancedCount >= 3;
  const budding = balancedCount >= 1;
  const stemColor = budding ? "#388e3c" : "#795548";
  const petalColor = bloom ? "#f06292" : budding ? "#ef9a9a" : "#9e9e9e";
  const centerColor = bloom ? "#ffd54f" : budding ? "#ffcc80" : "#bdbdbd";
  const glowStyle = bloom
    ? { filter: "drop-shadow(0 0 14px #f48fb1) drop-shadow(0 0 6px #fce4ec)" }
    : {};

  // Stem droop based on stage
  const stemPath = bloom
    ? "M 60 100 Q 60 80 60 50"
    : budding
    ? "M 60 100 Q 58 76 56 50"
    : "M 60 100 Q 50 75 42 55";

  const petalPositions = [
    [60, 22], [78, 32], [84, 50], [78, 68], [60, 78], [42, 68], [36, 50], [42, 32],
  ];

  return (
    <svg width="120" height="110" viewBox="0 0 120 110" style={glowStyle}>
      {/* Stem */}
      <path d={stemPath} stroke={stemColor} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Leaves */}
      {budding && (
        <>
          <ellipse cx="52" cy="75" rx="10" ry="5" fill="#4caf50" transform="rotate(-30, 52, 75)" />
          <ellipse cx="68" cy="85" rx="10" ry="5" fill="#4caf50" transform="rotate(30, 68, 85)" />
        </>
      )}
      {/* Petals */}
      {petalPositions.map(([px, py], i) => (
        <ellipse
          key={i}
          cx={px}
          cy={py}
          rx={bloom ? 10 : budding ? 7 : 5}
          ry={bloom ? 6 : budding ? 4 : 3}
          fill={petalColor}
          transform={`rotate(${i * 45}, 60, 50)`}
          opacity={budding ? 1 : 0.5}
        />
      ))}
      {/* Centre */}
      <circle cx="60" cy="50" r={bloom ? 12 : budding ? 9 : 7} fill={centerColor} />
      {/* Sparkles on full bloom */}
      {bloom && (
        <>
          <text x="14"  y="22"  fontSize="14" textAnchor="middle">✨</text>
          <text x="106" y="22"  fontSize="14" textAnchor="middle">✨</text>
          <text x="60"  y="10"  fontSize="14" textAnchor="middle">✨</text>
        </>
      )}
    </svg>
  );
};

// ── Slider component ──────────────────────────────────────────────────────────
const Slider = ({ config, value, onChange }) => {
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const inZone = value >= config.targetMin && value <= config.targetMax;

  const getNewVal = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return value;
    const pct = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return Math.round(pct * 100);
  };

  const handlePointerDown = (e) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange(getNewVal(e.clientX));
  };
  const handlePointerMove = (e) => {
    if (!dragging.current) return;
    onChange(getNewVal(e.clientX));
  };
  const handlePointerUp = () => { dragging.current = false; };

  const thumbLeft = `${value}%`;
  const zoneLeft  = `${config.targetMin}%`;
  const zoneWidth = `${config.targetMax - config.targetMin}%`;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>{config.emoji}</span>
        <span style={{ color: "#e0e0e0", fontSize: 12, fontFamily: "'Pixelify Sans', sans-serif", fontWeight: "bold" }}>
          {config.label}
        </span>
        {inZone && <span style={{ color: "#69f0ae", fontSize: 14 }}>✓</span>}
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        style={{
          position: "relative", height: 20, background: "rgba(255,255,255,0.15)",
          borderRadius: 10, cursor: "pointer", userSelect: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Target zone highlight */}
        <div style={{
          position: "absolute", left: zoneLeft, width: zoneWidth, height: "100%",
          background: "rgba(105,240,174,0.25)", borderRadius: 10,
          border: "1px solid rgba(105,240,174,0.5)",
        }} />
        {/* Fill */}
        <div style={{
          position: "absolute", left: 0, width: thumbLeft, height: "100%",
          background: inZone ? "rgba(105,240,174,0.7)" : "rgba(180,180,180,0.4)",
          borderRadius: 10, transition: "background 0.2s",
        }} />
        {/* Thumb */}
        <div style={{
          position: "absolute", left: thumbLeft, top: "50%",
          transform: "translate(-50%, -50%)",
          width: 24, height: 24, borderRadius: "50%",
          background: inZone ? "#69f0ae" : "#fff",
          border: `3px solid ${inZone ? "#00c853" : "rgba(200,200,200,0.8)"}`,
          boxShadow: inZone ? "0 0 8px #69f0ae" : "0 2px 6px rgba(0,0,0,0.4)",
          transition: "background 0.2s, border-color 0.2s",
        }} />
      </div>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const BloomRevivalGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, synonymDialogue, antonymDialogue, sliders } = quest;

  const [stage,        setStage]        = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);
  // Slider values 0-100, start at low positions (wilted state)
  const [values, setValues] = useState({ light: 15, water: 10, wind: 12 });

  const inZone = (id) => {
    const cfg = sliders.find((s) => s.id === id);
    return cfg && values[id] >= cfg.targetMin && values[id] <= cfg.targetMax;
  };

  const balancedCount = sliders.filter((s) => inZone(s.id)).length;
  const allBalanced   = balancedCount === sliders.length;

  // Auto-advance to synonym lesson when all sliders are balanced
  const advancedRef = useRef(false);
  if (allBalanced && stage === "playing" && !advancedRef.current) {
    advancedRef.current = true;
    setTimeout(() => { setStage("synonym_lesson"); setDialogueStep(0); }, 900);
  }

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

  const updateSlider = (id, val) => {
    if (stage !== "playing") return;
    setValues((prev) => ({ ...prev, [id]: val }));
  };

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#c2185b" }}>Bloom Revival</span>
        </div>

        {/* ── Game Canvas ───────────────────────────────────────────────── */}
        <div className="iqm-scene-canvas" style={{
          background: "linear-gradient(160deg, #1a2e1a 0%, #0d1f0d 100%)",
          borderRadius: "12px", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          {/* Shimmer */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "12px",
            background: "repeating-linear-gradient(45deg, transparent, transparent 24px, rgba(255,255,255,0.02) 24px, rgba(255,255,255,0.02) 25px)",
            pointerEvents: "none",
          }} />

          {(stage === "playing" || stage === "synonym_lesson" || stage === "antonym_lesson") && (
            <>
              {/* Flower */}
              <div style={{ marginBottom: 12, zIndex: 2 }}>
                <FlowerSVG balancedCount={stage === "playing" ? balancedCount : 3} />
              </div>

              {/* Sliders — only interactive during playing */}
              {stage === "playing" && (
                <div style={{ width: "80%", zIndex: 2 }}>
                  {sliders.map((cfg) => (
                    <Slider
                      key={cfg.id}
                      config={cfg}
                      value={values[cfg.id]}
                      onChange={(v) => updateSlider(cfg.id, v)}
                    />
                  ))}
                </div>
              )}

              {/* Synonym lesson: show 3 balanced icons */}
              {stage === "synonym_lesson" && (
                <div style={{ display: "flex", gap: 24, alignItems: "center", zIndex: 2, marginTop: 8 }}>
                  {sliders.map((s, i) => (
                    <React.Fragment key={s.id}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, filter: "drop-shadow(0 0 8px #69f0ae)" }}>{s.emoji}</div>
                        <div style={{ color: "#a5d6a7", fontSize: 10, marginTop: 4, fontWeight: "bold" }}>{s.label}</div>
                      </div>
                      {i < sliders.length - 1 && <span style={{ color: "#69f0ae", fontSize: 20, fontWeight: "bold" }}>≈</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Antonym lesson */}
              {stage === "antonym_lesson" && (
                <div style={{ display: "flex", gap: 28, alignItems: "center", zIndex: 2, marginTop: 8 }}>
                  {[["🌵", "Uga / Dry", "#ef9a9a"], ["💧", "Basa / Wet", "#80deea"]].map(([e, l, c], i) => (
                    <React.Fragment key={i}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 32 }}>{e}</div>
                        <div style={{ color: c, fontSize: 11, marginTop: 4, fontWeight: "bold" }}>{l}</div>
                      </div>
                      {i === 0 && <span style={{ color: "#fff", fontSize: 26, fontWeight: "bold" }}>↔</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Progress pips */}
              {stage === "playing" && (
                <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
                  {sliders.map((_, i) => (
                    <div key={i} className={`iqm-sweep-pip ${i < balancedCount ? "iqm-sweep-pip--done" : ""}`} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Done overlay */}
          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🌸✨🌸</div>
                <div className="iqm-scene-success-text">Nabukad na! · Bloomed again!</div>
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
                  <span className="iqm-dialogue-bisaya">I-drag ang mga slider sa green zone! ({balancedCount}/{sliders.length})</span>
                  <span className="iqm-dialogue-english">Drag each slider into the green zone! ({balancedCount}/{sliders.length})</span>
                </>
              ) : stage === "done" ? (
                <>
                  <span className="iqm-dialogue-bisaya">Nabukad na ang bulak! 🌸</span>
                  <span className="iqm-dialogue-english">The flower has bloomed! 🌸</span>
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

export default BloomRevivalGame;
