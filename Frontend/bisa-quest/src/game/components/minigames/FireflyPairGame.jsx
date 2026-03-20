// ─────────────────────────────────────────────────────────────────────────────
//  FireflyPairGame.jsx — Click two synonym fireflies to pair them
//  Fireflies float in a dim scene with word labels. Click one, then click
//  its synonym partner → both glow and a section of the pond lights up.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from "react";

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const FireflyPairGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { pairs } = quest;

  // Build firefly array from pairs
  const allFireflies = useRef(
    shuffle(
      pairs.flatMap((pair, i) => [
        { id: `fa_${i}`, word: pair.wordA, meaning: pair.meaningA, pairIndex: i, side: "A" },
        { id: `fb_${i}`, word: pair.wordB, meaning: pair.meaningB, pairIndex: i, side: "B" },
      ])
    ).map((ff, idx) => ({
      ...ff,
      baseX: 12 + (idx % 4) * 22,
      baseY: 18 + Math.floor(idx / 4) * 35,
    }))
  ).current;

  const [stage, setStage] = useState("intro");
  const [introStep, setIntroStep] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [paired, setPaired] = useState(new Set());
  const [wrongFlash, setWrongFlash] = useState(new Set());
  const [glowLevel, setGlowLevel] = useState(0); // 0 to pairs.length

  // Floating positions
  const [positions, setPositions] = useState(
    Object.fromEntries(allFireflies.map((ff) => [ff.id, { x: ff.baseX, y: ff.baseY }]))
  );

  const introDialogue = [
    {
      bisayaText: `${item.emoji} ${item.labelBisaya}! Ang mga alitaptap dili na modan-ag!`,
      englishText: `${item.emoji} ${item.labelEnglish}! The fireflies stopped glowing!`,
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

  // ── Float animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== "playing") return;
    const interval = setInterval(() => {
      setPositions((prev) => {
        const next = { ...prev };
        allFireflies.forEach((ff) => {
          if (paired.has(ff.id)) return;
          next[ff.id] = {
            x: ff.baseX + Math.sin(Date.now() / 1500 + ff.baseX * 0.3) * 5,
            y: ff.baseY + Math.cos(Date.now() / 1800 + ff.baseY * 0.3) * 4,
          };
        });
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [stage, paired, allFireflies]);

  // ── Click handling ─────────────────────────────────────────────────────────
  const handleFireflyClick = (ff) => {
    if (stage !== "playing" || paired.has(ff.id)) return;

    if (!selectedId) {
      // First click — select this firefly
      setSelectedId(ff.id);
    } else if (selectedId === ff.id) {
      // Clicked same — deselect
      setSelectedId(null);
    } else {
      // Second click — check if synonym pair
      const first = allFireflies.find((f) => f.id === selectedId);
      if (first && first.pairIndex === ff.pairIndex && first.side !== ff.side) {
        // Correct pair! 🎉
        setPaired((prev) => {
          const next = new Set([...prev, first.id, ff.id]);
          const pairsComplete = next.size / 2;
          setGlowLevel(pairsComplete);
          if (pairsComplete >= pairs.length) {
            setTimeout(() => setStage("success"), 800);
          }
          return next;
        });
        setSelectedId(null);
      } else {
        // Wrong pair — flash both
        setWrongFlash(new Set([selectedId, ff.id]));
        setTimeout(() => {
          setWrongFlash(new Set());
          setSelectedId(null);
        }, 600);
      }
    }
  };

  const getDialogueText = () => {
    if (stage === "intro") return introDialogue[introStep];
    if (stage === "success")
      return {
        bisayaText: "Maayo kaayo! Nagdan-ag na ang tanan! ✨🌙",
        englishText: "Great job! Everything is glowing now! ✨🌙",
      };
    const done = paired.size / 2;
    return {
      bisayaText: `${quest.instructionBisaya} (${done}/${pairs.length})`,
      englishText: `${quest.instructionEnglish} (${done}/${pairs.length})`,
    };
  };

  const dialogueText = getDialogueText();
  const bgBrightness = 0.15 + (glowLevel / pairs.length) * 0.6;

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>
        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#FFA726" }}>
            Synonym Match
          </span>
        </div>

        <div
          className="iqm-scene-canvas"
          style={{
            background: `linear-gradient(180deg,
              rgba(13,27,42,${1 - bgBrightness * 0.5}) 0%,
              rgba(27,38,59,${1 - bgBrightness * 0.4}) 50%,
              rgba(15,52,67,${1 - bgBrightness * 0.3}) 100%)`,
            borderRadius: "12px",
            position: "relative",
            transition: "background 1s ease",
          }}
        >
          {/* Stars */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`star_${i}`}
              style={{
                position: "absolute",
                left: `${8 + (i * 17) % 85}%`,
                top: `${5 + (i * 13) % 30}%`,
                width: "3px",
                height: "3px",
                background: "#fff",
                borderRadius: "50%",
                opacity: 0.3 + bgBrightness * 0.5,
                animation: `twinkle ${1.5 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}

          {/* Fireflies */}
          {(stage === "playing" || stage === "success") &&
            allFireflies.map((ff) => {
              const pos = positions[ff.id];
              const isPaired = paired.has(ff.id);
              const isSelected = selectedId === ff.id;
              const isWrong = wrongFlash.has(ff.id);

              return (
                <div
                  key={ff.id}
                  onClick={() => handleFireflyClick(ff)}
                  style={{
                    position: "absolute",
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: "translate(-50%, -50%)",
                    cursor: isPaired ? "default" : "pointer",
                    zIndex: isSelected ? 20 : 10,
                    transition: "left 0.5s ease, top 0.5s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "3px",
                    userSelect: "none",
                  }}
                >
                  {/* Glow */}
                  <div style={{
                    width: isPaired ? "50px" : isSelected ? "40px" : "30px",
                    height: isPaired ? "50px" : isSelected ? "40px" : "30px",
                    borderRadius: "50%",
                    background: isPaired
                      ? "radial-gradient(circle, rgba(255,235,59,0.6) 0%, transparent 70%)"
                      : isSelected
                        ? "radial-gradient(circle, rgba(255,235,59,0.4) 0%, transparent 70%)"
                        : isWrong
                          ? "radial-gradient(circle, rgba(244,67,54,0.4) 0%, transparent 70%)"
                          : "radial-gradient(circle, rgba(255,255,150,0.15) 0%, transparent 70%)",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    transition: "all 0.4s ease",
                    pointerEvents: "none",
                  }} />

                  <span style={{
                    fontSize: "22px",
                    filter: isPaired
                      ? "brightness(2) drop-shadow(0 0 8px #FFD700)"
                      : isSelected
                        ? "brightness(1.5) drop-shadow(0 0 6px #FFD700)"
                        : isWrong
                          ? "brightness(0.5)"
                          : "brightness(0.8)",
                    transition: "filter 0.3s ease",
                  }}>
                    ✨
                  </span>

                  <span style={{
                    background: isPaired
                      ? "rgba(255,235,59,0.8)"
                      : isSelected
                        ? "rgba(255,235,59,0.6)"
                        : isWrong
                          ? "rgba(244,67,54,0.7)"
                          : "rgba(255,255,255,0.15)",
                    color: isPaired || isSelected ? "#1a1a2e" : "#fff",
                    fontSize: "11px",
                    fontFamily: "'Pixelify Sans', sans-serif",
                    fontWeight: "bold",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    whiteSpace: "nowrap",
                    transition: "all 0.3s ease",
                    border: isSelected ? "2px solid #FFD700" : "1px solid transparent",
                  }}>
                    {ff.word}
                  </span>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                    ({ff.meaning})
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
                  className={`iqm-sweep-pip ${paired.has(`fa_${i}`) ? "iqm-sweep-pip--done" : ""}`}
                />
              ))}
            </div>
          )}

          {/* Success overlay */}
          {stage === "success" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">✨🌙✨</div>
                <div className="iqm-scene-success-text">Nagdan-ag na ang Linaw!</div>
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

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default FireflyPairGame;
