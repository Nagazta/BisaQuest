import React, { useState, useRef } from "react";
import bloomGameBg from "../../../assets/images/environments/scenario/magic-wiltedflower-game.png";
import flowerImg from "../../../assets/items/forest-glow-flowers.png";
import flowerImg1 from "../../../assets/items/forest-glow-flowers1.png";


// Slider 
const BalanceSlider = ({ slider, value, onChange, inRange }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
    <span style={{ fontSize: 20 }}>{slider.emoji}</span>
    <input type="range" min={0} max={100} value={value} onChange={e => onChange(Number(e.target.value))}
      style={{ accentColor: inRange ? "#69f0ae" : "#ef9a9a", width: 120, cursor: "pointer" }} />
    <div style={{ width: 120, height: 12, borderRadius: 3, background: "rgba(255,255,255,0.15)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: `${slider.targetMin}%`, width: `${slider.targetMax - slider.targetMin}%`, top: 0, bottom: 0, background: inRange ? "rgba(105,240,174,0.5)" : "rgba(255,255,255,0.15)", borderRadius: 3 }} />
    </div>
  </div>
);

// Component 
const BloomRevivalGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, completionDialogue, synonymDialogue, antonymDialogue, sliders } = quest;

  const doneLines = completionDialogue
    || [...(synonymDialogue || []), ...(antonymDialogue || [])];

  const [stage, setStage] = useState("intro");
  const [dialogueStep, setDialogueStep] = useState(0);
  const [values, setValues] = useState(() => Object.fromEntries(sliders.map(s => [s.id, 0])));

  const advancedRef = useRef(false);

  const inRange = sliders.map(s => values[s.id] >= s.targetMin && values[s.id] <= s.targetMax);
  const balancedCount = inRange.filter(Boolean).length;
  const allBalanced = balancedCount >= sliders.length;

  if (allBalanced && stage === "playing" && !advancedRef.current) {
    advancedRef.current = true;
    setTimeout(() => { setStage("done"); setDialogueStep(0); }, 900);
  }

  const currentLines = stage === "intro" ? introDialogue : stage === "done" ? doneLines : null;
  const dialogueLine = currentLines?.[dialogueStep] ?? null;

  const handleDialogueNext = () => {
    if (!currentLines) return;
    if (dialogueStep < currentLines.length - 1) {
      setDialogueStep(s => s + 1);
    } else {
      if (stage === "intro") { setStage("playing"); setDialogueStep(0); }
      else if (stage === "done") onComplete(item);
    }
  };

  const handleSlider = (id, val) => {
    if (stage !== "playing") return;
    advancedRef.current = false; // allow re-trigger if they adjust again
    setValues(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#ad1457", color: "#fce4ec" }}>Bloom Revival</span>
        </div>

        <div className="iqm-scene-canvas"
          style={{
            background: `url(${bloomGameBg}) center/cover no-repeat`, borderRadius: "12px", position: "relative", overflow: "hidden",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
          }}>

          {/* Dark overlay */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(5,10,5,0.45)", pointerEvents: "none" }} />

          {(stage === "intro" || stage === "playing") && (
            <div style={{
              position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              pointerEvents: stage === "intro" ? "none" : "auto"
            }}>
              {/* Crossfade flower images: base → bloomed at balancedCount 3 */}
              <div style={{ position: "relative", width: 300, height: "auto" }}>
                {/* Base image — always present, dims as sliders fill */}
                <img
                  src={flowerImg}
                  alt="Flowers"
                  draggable={false}
                  style={{
                    width: 300,
                    height: "auto",
                    left: 5,
                    display: "block",
                    transition: "filter 0.5s ease, opacity 0.7s ease",
                    opacity: balancedCount >= 3 ? 0 : 1,
                    filter: balancedCount === 0
                      ? "brightness(0.35) saturate(0.2)"
                      : balancedCount === 1
                        ? "brightness(0.6) saturate(0.7) drop-shadow(0 0 6px rgba(255,180,200,0.5))"
                        : "brightness(0.85) saturate(1.1) drop-shadow(0 0 12px rgba(255,130,170,0.7))",
                  }}
                />
                {/* Bloomed image — fades in on top when all 3 sliders are in range */}
                <img
                  src={flowerImg1}
                  alt="Flowers bloomed"
                  draggable={false}
                  style={{
                    width: 300,
                    height: "auto",
                    left: 5,
                    position: "absolute",
                    top: 0,
                    display: "block",
                    transition: "opacity 0.7s ease, filter 0.7s ease",
                    opacity: balancedCount >= 3 ? 1 : 0,
                    filter: "brightness(1.1) saturate(1.3) drop-shadow(0 0 20px rgba(255,100,150,0.95)) drop-shadow(0 0 8px rgba(255,230,100,0.7))",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                {sliders.map((s, i) => (
                  <BalanceSlider key={s.id} slider={s} value={values[s.id]} onChange={v => handleSlider(s.id, v)} inRange={inRange[i]} />
                ))}
              </div>
            </div>
          )}

          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🌸✨🌸</div>
                <div className="iqm-scene-success-text">Mibukad na ang Bulak! · Flower Bloomed!</div>
              </div>
            </div>
          )}

          {stage === "playing" && (
            <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
              {sliders.map((_, i) => <div key={i} className={`iqm-sweep-pip ${inRange[i] ? "iqm-sweep-pip--done" : ""}`} />)}
            </div>
          )}
        </div>

        <div className="iqm-dialogue-row">
          <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
          <div className="iqm-dialogue-bubble">
            <div className="iqm-dialogue-speaker">{npcName}</div>
            <div className="iqm-dialogue-text">
              {dialogueLine ? (
                <><span className="iqm-dialogue-bisaya">{dialogueLine.bisayaText}</span><span className="iqm-dialogue-english">{dialogueLine.englishText}</span></>
              ) : stage === "playing" ? (
                <><span className="iqm-dialogue-bisaya">I-balance ang tulo ka elemento para mabukad ang bulak! ({balancedCount}/{sliders.length})</span><span className="iqm-dialogue-english">Balance the three elements to bloom the flower! ({balancedCount}/{sliders.length})</span></>
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

export default BloomRevivalGame;
