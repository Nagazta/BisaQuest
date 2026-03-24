import React, { useState, useCallback } from "react";
import lanternGameBg from "../../../assets/images/environments/scenario/guiding-lamp-game.png";
import glowingLampImg from "../../../assets/items/glowing-lamp.png";
import dimLampImg from "../../../assets/items/dim-lamp.png";

// Helpers 
const norm = (a, step) => ((Math.round(a / step) * step) % 360 + 360) % 360;

//  SVG Magic Circles 
const MagicCircles = ({ brightnessAngle, compassAngle, bothCorrect }) => {
  const renderSize = 340; // Scaled up size for larger presence
  const viewBoxSize = 260;
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2;

  // Brightness: 0 = dark, 120 = dim, 240 = bright
  const brightLevel = brightnessAngle === 240 ? 2 : brightnessAngle === 120 ? 1 : 0;
  const glowColor =
    brightLevel === 2 ? "#ffd54f" : brightLevel === 1 ? "#ffb74d" : "#4a3a6a";
  const glowOpacity =
    brightLevel === 2 ? 0.85 : brightLevel === 1 ? 0.4 : 0.08;
  const ringOpacity =
    brightLevel === 2 ? 1 : brightLevel === 1 ? 0.55 : 0.2;
  const ringStroke =
    brightLevel === 2 ? "#ffd54f" : brightLevel === 1 ? "#c8a040" : "#5a3f80";

  // Cardinal labels on the outer ring (rotate WITH the ring)
  const cardinals = [
    { label: "N", angle: 0 },
    { label: "E", angle: 90 },
    { label: "S", angle: 180 },
    { label: "W", angle: 270 },
  ];

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      style={{
        display: "block",
        width: renderSize,
        height: renderSize,
        maxWidth: "100%",
        maxHeight: "calc(100% - 90px)" // Safely bounded so controls don't overflow
      }}
    >
      {/* Ambient glow background */}
      {brightLevel > 0 && (
        <circle cx={cx} cy={cy} r={110} fill={glowColor} opacity={glowOpacity * 0.4}
          style={{ filter: `blur(${brightLevel === 2 ? 28 : 16}px)` }} />
      )}

      {/*  OUTER compass ring  */}
      <g transform={`rotate(${compassAngle}, ${cx}, ${cy})`}>
        {/* Outer ring track */}
        <circle cx={cx} cy={cy} r={108}
          fill="none"
          stroke={compassAngle === 0 ? "#a0c8ff" : "#3a2a60"}
          strokeWidth="2.5"
          opacity={compassAngle === 0 ? 0.9 : 0.45}
        />
        {/* Decorative arc segments */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg - 90) * (Math.PI / 180);
          const x1 = cx + Math.cos(rad) * 90;
          const y1 = cy + Math.sin(rad) * 90;
          const x2 = cx + Math.cos(rad) * 108;
          const y2 = cy + Math.sin(rad) * 108;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={compassAngle === 0 ? "#a0c8ff" : "#6040a0"}
              strokeWidth="3" opacity="0.8" />
          );
        })}
        {/* Compass tick marks */}
        {Array.from({ length: 16 }).map((_, i) => {
          const deg = i * 22.5;
          const isCardinal = deg % 90 === 0;
          const rad = (deg - 90) * (Math.PI / 180);
          const r1 = isCardinal ? 98 : 102;
          const r2 = 108;
          return (
            <line key={i}
              x1={cx + Math.cos(rad) * r1} y1={cy + Math.sin(rad) * r1}
              x2={cx + Math.cos(rad) * r2} y2={cy + Math.sin(rad) * r2}
              stroke={isCardinal ? (compassAngle === 0 ? "#a0c8ff" : "#7060a0") : "#4a3870"}
              strokeWidth={isCardinal ? 2 : 1} opacity="0.7"
            />
          );
        })}
        {/* North pointer arrow */}
        <polygon
          points={`${cx},${cy - 78} ${cx - 5},${cy - 62} ${cx + 5},${cy - 62}`}
          fill={compassAngle === 0 ? "#ffd54f" : "#8060b0"}
          opacity={compassAngle === 0 ? 1 : 0.5}
        />
      </g>

      {/* Upright Cardinal direction labels (outside rotated group) */}
      {cardinals.map(({ label, angle: deg }) => {
        const totalDeg = deg + compassAngle;
        const rad = (totalDeg - 90) * (Math.PI / 180);
        const lx = cx + Math.cos(rad) * 86;
        const ly = cy + Math.sin(rad) * 86;
        const isNorth = deg === 0;
        return (
          <text key={label} x={lx} y={ly + 6}
            textAnchor="middle" fontSize={isNorth ? 20 : 24}
            fontFamily="'Pixelify Sans', sans-serif"
            fontWeight="bold"
            fill={compassAngle === 0 ? (isNorth ? "#ffd54f" : "#e0f0ff") : (isNorth ? "#e0b840" : "#c0b0e0")}
            stroke={compassAngle === 0 ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)"}
            strokeWidth="0.5"
            paintOrder="stroke"
            opacity={1}
          >
            {label}
          </text>
        );
      })}

      {/*  INNER brightness ring  */}
      <g transform={`rotate(${brightnessAngle}, ${cx}, ${cy})`}>
        {/* Ring track */}
        <circle cx={cx} cy={cy} r={72}
          fill="none"
          stroke={ringStroke}
          strokeWidth="2"
          opacity={ringOpacity}
        />
        {/* Glow petals — 6 around the ring */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg - 90) * (Math.PI / 180);
          const px = cx + Math.cos(rad) * 64;
          const py = cy + Math.sin(rad) * 64;
          const isActive = brightLevel === 2 || (brightLevel === 1 && deg % 120 === 0);
          return (
            <circle key={i} cx={px} cy={py} r={brightLevel === 2 ? 8 : 5}
              fill={isActive ? glowColor : "#2a1d4a"}
              opacity={isActive ? (brightLevel === 2 ? 0.95 : 0.45) : 0.25}
              style={brightLevel === 2 ? { filter: "blur(2px)" } : undefined}
            />
          );
        })}
        {/* Brightness indicator line (points toward current brightness state) */}
        <line
          x1={cx} y1={cy - 50}
          x2={cx} y2={cy - 72}
          stroke={ringStroke}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={ringOpacity}
        />
      </g>

      {/*  Shared decorative ring between inner and outer  */}
      <circle cx={cx} cy={cy} r={80}
        fill="none"
        stroke="rgba(160,120,255,0.2)"
        strokeWidth="1"
        strokeDasharray="4 6"
      />

      {/*  Lamp in the hollow centre  */}
      {/* Lamp glow */}
      {brightLevel > 0 && (
        <circle cx={cx} cy={cy} r={bothCorrect ? 46 : 38}
          fill={glowColor}
          opacity={brightLevel === 2 ? (bothCorrect ? 0.45 : 0.3) : 0.1}
          style={{ filter: "blur(8px)", transition: "all 0.5s ease" }}
        />
      )}
      {/* Lamp image — switches between glowing and dim */}
      <image
        href={brightLevel === 2 ? glowingLampImg : dimLampImg}
        x={cx - 50}
        y={cy - 64}
        width={100}
        height={128}
        style={{ transition: "opacity 0.4s ease" }}
      />

      {/*  Correct flash ring  */}
      {bothCorrect && (
        <circle cx={cx} cy={cy} r={116}
          fill="none"
          stroke="#ffd54f"
          strokeWidth="3"
          opacity="0.7"
          style={{ filter: "drop-shadow(0 0 8px #ffd54f)" }}
        />
      )}
    </svg>
  );
};

//  Component 
const LanternGuideGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const {
    introDialogue, synonymDialogue, antonymDialogue, completionDialogue,
    brightnessCorrectAngle, brightnessStep,
    compassCorrectAngle, compassStep,
  } = quest;

  const doneLines = completionDialogue
    || [...(synonymDialogue || []), ...(antonymDialogue || [])];

  const [stage, setStage] = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);
  const [brightnessAngle, setBrightnessAngle] = useState(0);    // starts at 0° (dark)
  const [compassAngle, setCompassAngle] = useState(270);  // starts off (not north)

  // Normalise to step grid
  const normB = (a) => norm(a, brightnessStep);
  const normC = (a) => norm(a, compassStep);

  const brightOk = normB(brightnessAngle) === brightnessCorrectAngle;
  const compassOk = normC(compassAngle) === compassCorrectAngle;
  const bothCorrect = brightOk && compassOk;

  // Auto-advance when both rings snap correct
  const advancedRef = React.useRef(false);
  if (bothCorrect && stage === "playing" && !advancedRef.current) {
    advancedRef.current = true;
    setTimeout(() => { setStage("done"); setDialogueStep(0); }, 1100);
  }

  // Dialogue
  const currentLines =
    stage === "intro" ? introDialogue :
      stage === "done" ? doneLines : null;

  const dialogueLine = currentLines?.[dialogueStep] ?? null;

  const handleDialogueNext = () => {
    if (!currentLines) return;
    if (dialogueStep < currentLines.length - 1) {
      setDialogueStep((s) => s + 1);
    } else {
      if (stage === "intro") { setStage("playing"); setDialogueStep(0); }
      else if (stage === "done") onComplete(item);
    }
  };

  // Rotate helpers
  const rotateInner = useCallback((dir) => {
    if (stage !== "playing") return;
    setBrightnessAngle((a) => normB(a + dir * brightnessStep));
  }, [stage, brightnessStep]);

  const rotateOuter = useCallback((dir) => {
    if (stage !== "playing") return;
    setCompassAngle((a) => normC(a + dir * compassStep));
  }, [stage, compassStep]);

  // Status text for dialogue area during playing
  const statusBisaya = bothCorrect
    ? "Perpekto na ang duha! Ang lampara nagsiga! ✨"
    : brightOk
      ? "Maayo ang kahayag! Ayha i-align ang compass."
      : compassOk
        ? "Tama na ang compass! Ayha i-adjust ang kahayag."
        : "I-ikot ang duha ka singsing hangtod tama sila!";

  const statusEnglish = bothCorrect
    ? "Both are perfect! The lamp shines! ✨"
    : brightOk
      ? "Brightness is good! Now align the compass."
      : compassOk
        ? "Compass is aligned! Now adjust the brightness."
        : "Rotate both rings until they're correct!";

  // Button style helper
  const btnStyle = (active) => ({
    background: active ? "rgba(255,213,79,0.2)" : "rgba(255,255,255,0.08)",
    border: `1.5px solid ${active ? "rgba(255,213,79,0.7)" : "rgba(255,255,255,0.2)"}`,
    color: active ? "#ffd54f" : "#ccc",
    borderRadius: 10, width: 44, height: 44,
    fontSize: 20, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s",
  });

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#4a1a8a", color: "#e0c8ff", borderColor: "#9b59b6" }}>
            Magic Circles
          </span>
        </div>

        {/* ── Game Canvas ─────────────────────────────────────────────────── */}
        <div
          className="iqm-scene-canvas"
          style={{
            background: `url(${lanternGameBg}) center/cover no-repeat`,
            borderRadius: "12px", position: "relative", overflow: "hidden",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Dark overlay so circles are visible over bg */}
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(5, 2, 20, 0.55)",
            pointerEvents: "none",
          }} />

          {(stage === "intro" || stage === "playing") && (
            <div style={{
              position: "relative", zIndex: 2,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              height: "100%", width: "100%", gap: 0,
              pointerEvents: stage === "intro" ? "none" : "auto",
              marginTop: "-15px", // Visually center the magic circle by counteracting optical padding
            }}>
              {/* Magic circle SVG */}
              <MagicCircles
                brightnessAngle={normB(brightnessAngle)}
                compassAngle={normC(compassAngle)}
                bothCorrect={bothCorrect}
              />

              {/* Controls row */}
              <div style={{
                display: "flex", gap: 28, alignItems: "flex-start",
                marginTop: "-14px", // Tighten space specifically between magic circle and controls
              }}>
                {/* Inner ring controls */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 14, fontFamily: "'Pixelify Sans', sans-serif",
                    color: brightOk ? "#ffd54f" : "#c0a0ff",
                    fontWeight: "bold", letterSpacing: 1,
                  }}>
                    {brightOk ? "" : ""}Brightness | Kahayag
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={btnStyle(false)} onClick={() => rotateInner(-1)}>◀</button>
                    <button style={btnStyle(false)} onClick={() => rotateInner(1)}>▶</button>
                  </div>
                </div>

                {/* Outer ring controls */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 14, fontFamily: "'Pixelify Sans', sans-serif",
                    color: compassOk ? "#a0c8ff" : "#c0a0ff",
                    fontWeight: "bold", letterSpacing: 1,
                  }}>
                    {compassOk ? "" : ""}Direction | Direksyon
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={btnStyle(false)} onClick={() => rotateOuter(-1)}>◀</button>
                    <button style={btnStyle(false)} onClick={() => rotateOuter(1)}>▶</button>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Done */}
          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🏮✨🏮</div>
                <div className="iqm-scene-success-text">Nagsiga na ang Lampara! · The Lamp Shines!</div>
              </div>
            </div>
          )}

          {/* Progress pips */}
          {stage === "playing" && (
            <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
              <div className={`iqm-sweep-pip ${brightOk ? "iqm-sweep-pip--done" : ""}`} />
              <div className={`iqm-sweep-pip ${compassOk ? "iqm-sweep-pip--done" : ""}`} />
            </div>
          )}
        </div>

        {/* ── NPC Dialogue ─────────────────────────────────────────────────── */}
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
                  <span className="iqm-dialogue-bisaya">{statusBisaya}</span>
                  <span className="iqm-dialogue-english">{statusEnglish}</span>
                </>
              ) : stage === "done" ? (
                <>
                  <span className="iqm-dialogue-bisaya">Nagsiga na ang lampara! 🏮</span>
                  <span className="iqm-dialogue-english">The lamp shines! 🏮</span>
                </>
              ) : null}
            </div>

            {(stage === "intro" || stage === "done") && (
              <button className="iqm-next-btn" onClick={handleDialogueNext}>
                {stage === "done" && dialogueStep === doneLines.length - 1 ? "✓" : "▶"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanternGuideGame;
