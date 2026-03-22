// ─────────────────────────────────────────────────────────────────────────────
//  FrogBridgeGame.jsx — "Frog Lily Path"
//  The frog clicks its way across 3 rows of lily pad pairs.
//  Each row has one SAFE pad (healthy green — synonym concept) and one
//  UNSAFE pad (wilted/broken — antonym concept), placed randomly top/bottom.
//  After crossing, Lunti teaches synonyms then antonyms through dialogue.
//  Pads are pure SVG visuals — no text labels.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef } from "react";

// ── SVG Lily Pad ──────────────────────────────────────────────────────────────
const LilyPad = ({ variant, size = 68, onClick, shake, glow }) => {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s / 2 - 3;

  const svgContent = () => {
    switch (variant) {
      // ── Safe variants (green) ──────────────────────────────────────────────
      case "perfect":
        return (
          <>
            <circle cx={cx} cy={cy} r={r} fill="#43a047" />
            {/* Leaf veins */}
            <line x1={cx} y1={5} x2={cx} y2={cy} stroke="#2e7d32" strokeWidth="2.5" opacity="0.7" />
            <line x1={cx} y1={cy} x2={cx + r - 5} y2={cy + r - 5} stroke="#2e7d32" strokeWidth="2" opacity="0.6" />
            <line x1={cx} y1={cy} x2={cx - r + 5} y2={cy + r - 5} stroke="#2e7d32" strokeWidth="2" opacity="0.6" />
          </>
        );
      case "small_hole":
        return (
          <>
            <circle cx={cx} cy={cy} r={r} fill="#43a047" />
            <line x1={cx} y1={5} x2={cx} y2={cy} stroke="#2e7d32" strokeWidth="2.5" opacity="0.7" />
            <line x1={cx} y1={cy} x2={cx + r - 5} y2={cy + r - 5} stroke="#2e7d32" strokeWidth="2" opacity="0.6" />
            {/* Small hole */}
            <circle cx={cx + r * 0.45} cy={cy - r * 0.35} r={5} fill="#1b5e20" opacity="0.9" />
          </>
        );
      case "tiny_crack":
        return (
          <>
            <circle cx={cx} cy={cy} r={r} fill="#43a047" />
            <line x1={cx} y1={5} x2={cx} y2={cy} stroke="#2e7d32" strokeWidth="2.5" opacity="0.7" />
            <line x1={cx} y1={cy} x2={cx - r + 5} y2={cy + r - 5} stroke="#2e7d32" strokeWidth="2" opacity="0.6" />
            {/* Tiny crack — short jagged line */}
            <path
              d={`M ${cx - 10} ${cy - 14} L ${cx - 5} ${cy - 6} L ${cx - 12} ${cy}`}
              stroke="#1b5e20" strokeWidth="2" fill="none" opacity="0.9"
            />
          </>
        );

      // ── Unsafe variants (brown/wilted) ─────────────────────────────────────
      case "wilted":
        // Droopy irregular ellipse, brownish
        return (
          <>
            <ellipse
              cx={cx} cy={cy + 5}
              rx={r - 3} ry={r - 10}
              fill="#8d6e63"
              transform={`rotate(-20, ${cx}, ${cy})`}
            />
            {/* Extra wilted droop */}
            <ellipse
              cx={cx - 6} cy={cy + 8}
              rx={r - 10} ry={r - 14}
              fill="#795548" opacity="0.7"
              transform={`rotate(15, ${cx}, ${cy})`}
            />
          </>
        );
      case "cracks":
        return (
          <>
            <circle cx={cx} cy={cy} r={r} fill="#6d4c41" />
            {/* Multiple crack lines */}
            <path
              d={`M ${cx - 8} ${cy - r + 6} L ${cx - 3} ${cy - 5} L ${cx + 5} ${cy + 3} L ${cx + 2} ${cy + r - 6}`}
              stroke="#3e2723" strokeWidth="2.5" fill="none"
            />
            <path
              d={`M ${cx + 8} ${cy - 12} L ${cx + 3} ${cy + 6}`}
              stroke="#3e2723" strokeWidth="1.5" fill="none"
            />
            <path
              d={`M ${cx - 20} ${cy + 6} L ${cx - 5} ${cy + 3}`}
              stroke="#3e2723" strokeWidth="1.5" fill="none"
            />
            <path
              d={`M ${cx + r - 8} ${cy - 10} L ${cx + r - 14} ${cy + 4}`}
              stroke="#3e2723" strokeWidth="1" fill="none"
            />
          </>
        );
      case "huge_hole":
        return (
          <>
            <circle cx={cx} cy={cy} r={r} fill="#6d4c41" />
            {/* Huge hole — same colour as the pond background to punch through */}
            <circle cx={cx} cy={cy} r={r * 0.52} fill="#1a6fa8" />
          </>
        );

      default:
        return <circle cx={cx} cy={cy} r={r} fill="#43a047" />;
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        animation: shake ? "pad-shake 0.4s ease" : undefined,
        filter: glow
          ? "drop-shadow(0 0 10px #a5d6a7) drop-shadow(0 0 4px #69f0ae)"
          : "none",
        transition: "filter 0.3s ease",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {svgContent()}
      </svg>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const FrogBridgeGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, synonymDialogue, antonymDialogue, padRows } = quest;

  // Randomise safe pad placement (top vs bottom) for each row — once on mount
  const rowConfigs = useRef(
    padRows.map(() => ({ safeOnTop: Math.random() > 0.5 }))
  ).current;

  // ── Stage machine ─────────────────────────────────────────────────────────
  // intro → playing → synonym_lesson → antonym_lesson → done
  const [stage, setStage] = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);

  // ── Progress ──────────────────────────────────────────────────────────────
  // currentRow: index of the next pad row the player should click (0–2).
  // Once it reaches padRows.length the frog is at the end.
  const [currentRow, setCurrentRow] = useState(0);
  const [reachedRows, setReachedRows] = useState([]); // row indices successfully crossed
  const [shakePad, setShakePad] = useState(null); // { row, top: bool }

  // ── Frog position (percentage coords) ────────────────────────────────────
  const [frogX, setFrogX] = useState(8);
  const [frogY, setFrogY] = useState(50);

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
      if (stage === "intro") { setStage("playing"); setDialogueStep(0); }
      else if (stage === "synonym_lesson") { setStage("antonym_lesson"); setDialogueStep(0); }
      else if (stage === "antonym_lesson") { setStage("done"); }
    }
  };

  // ── Pad click ─────────────────────────────────────────────────────────────
  // xPct for each row column: 30%, 52%, 74%
  const colX = (rowIndex) => 30 + rowIndex * 22;

  const handlePadClick = (rowIndex, isSafe, isTop) => {
    if (stage !== "playing") return;
    if (rowIndex !== currentRow) return;

    if (isSafe) {
      const safeY = isTop ? 27 : 73;
      setFrogX(colX(rowIndex));
      setFrogY(safeY);
      setReachedRows((prev) => [...prev, rowIndex]);
      const next = currentRow + 1;
      setCurrentRow(next);

      if (next >= padRows.length) {
        // Hop to end pad then start lesson
        setTimeout(() => {
          setFrogX(92);
          setFrogY(50);
          setTimeout(() => {
            setStage("synonym_lesson");
            setDialogueStep(0);
          }, 550);
        }, 400);
      }
    } else {
      // Wrong — shake that pad, frog stays
      setShakePad({ row: rowIndex, top: isTop });
      setTimeout(() => setShakePad(null), 500);
    }
  };

  // ── Canvas content ────────────────────────────────────────────────────────
  const renderPlayingCanvas = () => (
    <>
      {/* Water shimmer */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "12px",
        background: "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.04) 20px, rgba(255,255,255,0.04) 22px)",
        pointerEvents: "none",
      }} />

      {/* Start pad */}
      <div style={{ position: "absolute", left: "8%", top: "50%", transform: "translate(-50%, -50%)" }}>
        <LilyPad variant="perfect" size={58} />
        <div style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Start</div>
      </div>

      {/* Pad rows */}
      {padRows.map((row, rowIndex) => {
        const xPct = colX(rowIndex);
        const cfg = rowConfigs[rowIndex];
        const isClickable = stage === "playing" && rowIndex === currentRow;

        const topVariant = cfg.safeOnTop ? row.safeVariant : row.unsafeVariant;
        const botVariant = cfg.safeOnTop ? row.unsafeVariant : row.safeVariant;
        const topIsSafe = cfg.safeOnTop;

        const topShake = shakePad?.row === rowIndex && shakePad?.top === true;
        const botShake = shakePad?.row === rowIndex && shakePad?.top === false;
        const topGlow = reachedRows.includes(rowIndex) && cfg.safeOnTop;
        const botGlow = reachedRows.includes(rowIndex) && !cfg.safeOnTop;

        return (
          <React.Fragment key={rowIndex}>
            {/* Top pad */}
            <div style={{ position: "absolute", left: `${xPct}%`, top: "27%", transform: "translate(-50%, -50%)" }}>
              <LilyPad
                variant={topVariant}
                size={66}
                onClick={isClickable ? () => handlePadClick(rowIndex, topIsSafe, true) : undefined}
                shake={topShake}
                glow={topGlow}
              />
            </div>
            {/* Bottom pad */}
            <div style={{ position: "absolute", left: `${xPct}%`, top: "73%", transform: "translate(-50%, -50%)" }}>
              <LilyPad
                variant={botVariant}
                size={66}
                onClick={isClickable ? () => handlePadClick(rowIndex, !topIsSafe, false) : undefined}
                shake={botShake}
                glow={botGlow}
              />
            </div>
          </React.Fragment>
        );
      })}

      {/* End pad */}
      <div style={{ position: "absolute", left: "92%", top: "50%", transform: "translate(-50%, -50%)" }}>
        <LilyPad variant="perfect" size={58} glow={currentRow >= padRows.length} />
        <div style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>End</div>
      </div>

      {/* Frog — animates via CSS transition */}
      <div style={{
        position: "absolute",
        left: `${frogX}%`,
        top: `${frogY}%`,
        transform: "translate(-50%, -105%)",
        fontSize: 28,
        transition: "left 0.45s ease, top 0.45s ease",
        zIndex: 20,
        pointerEvents: "none",
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
      }}>
        🐸
      </div>

      {/* Progress pips */}
      <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
        {padRows.map((_, i) => (
          <div key={i} className={`iqm-sweep-pip ${i < currentRow ? "iqm-sweep-pip--done" : ""}`} />
        ))}
      </div>
    </>
  );

  const renderSynonymCanvas = () => (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 18,
    }}>
      <div style={{ textAlign: "center" }}>
        <LilyPad variant="perfect" size={68} glow />
        <div style={{ color: "#a5d6a7", fontSize: 10, marginTop: 4, fontWeight: "bold" }}>Healthy and no flaws <br />Walay depekto</div>
      </div>
      <span style={{ color: "#a5d6a7", fontSize: 22, fontWeight: "bold" }}>≈</span>
      <div style={{ textAlign: "center" }}>
        <LilyPad variant="small_hole" size={68} glow />
        <div style={{ color: "#a5d6a7", fontSize: 10, marginTop: 4, fontWeight: "bold" }}>Small hole but still healthy <br />Gamay nga lubak pero himsog pa</div>
      </div>
      <span style={{ color: "#a5d6a7", fontSize: 22, fontWeight: "bold" }}>≈</span>
      <div style={{ textAlign: "center" }}>
        <LilyPad variant="tiny_crack" size={68} glow />
        <div style={{ color: "#a5d6a7", fontSize: 10, marginTop: 4, fontWeight: "bold" }}>Tiny crack but still healthy <br />Gamay nga liki pero himsog pa</div>
      </div>
    </div>
  );

  const renderAntonymCanvas = () => (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 36,
    }}>
      <div style={{ textAlign: "center" }}>
        <LilyPad variant="perfect" size={74} glow />
        <div style={{ color: "#a5d6a7", fontSize: 11, marginTop: 6, fontWeight: "bold" }}>
          Luwas / Safe
        </div>
      </div>
      <div style={{ color: "#fff", fontSize: 28, fontWeight: "bold", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
        ≠
      </div>
      <div style={{ textAlign: "center" }}>
        <LilyPad variant="huge_hole" size={74} />
        <div style={{ color: "#ef9a9a", fontSize: 11, marginTop: 6, fontWeight: "bold" }}>
          Dili luwas / Unsafe
        </div>
      </div>
    </div>
  );

  const renderDoneCanvas = () => (
    <div className="iqm-scene-success-overlay">
      <div className="iqm-scene-success-card">
        <div className="iqm-scene-success-stars">🐸🍃🐸</div>
        <div className="iqm-scene-success-text">Nakatabok na! · Crossed safely!</div>
      </div>
    </div>
  );

  const renderCanvas = () => {
    switch (stage) {
      case "playing": return renderPlayingCanvas();
      case "synonym_lesson": return renderSynonymCanvas();
      case "antonym_lesson": return renderAntonymCanvas();
      case "done": return renderDoneCanvas();
      default: return null;
    }
  };

  const showNextBtn = stage === "intro" || stage === "synonym_lesson" || stage === "antonym_lesson";

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#388e3c" }}>
            Frog Path
          </span>
        </div>

        {/* ── Game Canvas ─────────────────────────────────────────────────── */}
        <div
          className="iqm-scene-canvas"
          style={{
            background: "#1a6fa8",
            borderRadius: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {renderCanvas()}
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
                    I-click ang luwas nga dahon! ({currentRow}/{padRows.length})
                  </span>
                  <span className="iqm-dialogue-english">
                    Click the safe lily pad! ({currentRow}/{padRows.length})
                  </span>
                </>
              ) : stage === "done" ? (
                <>
                  <span className="iqm-dialogue-bisaya">Nakatabok na ang baki! 🎉</span>
                  <span className="iqm-dialogue-english">The frog made it across! 🎉</span>
                </>
              ) : null}
            </div>

            {showNextBtn && (
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
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default FrogBridgeGame;
