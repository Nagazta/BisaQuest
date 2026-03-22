import React, { useState, useEffect, useRef } from "react";
import AssetManifest from "../../../services/AssetManifest";

const CampfireCookingGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [stage, setStage] = useState("intro"); // intro, cooking, cooked, eating, success
  const currentRound = quest.rounds[roundIndex];

  // Positions in %
  const [fishPos, setFishPos] = useState({ x: 20, y: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const [cookingProgress, setCookingProgress] = useState(0);
  const canvasRef = useRef(null);

  // Targets in %
  const FIRE_ZONE = { x: 50, y: 55, r: 15 };
  const LUNTI_ZONE = { x: 15, y: 45, r: 15 };

  useEffect(() => {
    if (stage === "cooking" && isAtFire()) {
      const timer = setInterval(() => {
        setCookingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setStage("cooked");
            return 100;
          }
          return prev + 5; // ~2 seconds for 100
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [stage, fishPos]);

  const isAtFire = () => {
    const dx = fishPos.x - FIRE_ZONE.x;
    const dy = fishPos.y - FIRE_ZONE.y;
    return Math.sqrt(dx * dx + dy * dy) < FIRE_ZONE.r;
  };

  const isAtLunti = () => {
    const dx = fishPos.x - LUNTI_ZONE.x;
    const dy = fishPos.y - LUNTI_ZONE.y;
    return Math.sqrt(dx * dx + dy * dy) < LUNTI_ZONE.r;
  };

  const handleMouseDown = (e) => {
    if (stage === "intro" || stage === "eating" || stage === "success") return;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFishPos({ 
      x: Math.max(5, Math.min(95, x)), 
      y: Math.max(5, Math.min(95, y)) 
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (stage === "cooked" && isAtLunti()) {
      setStage("eating");
    }
  };

  const handleNext = () => {
    if (stage === "intro") {
      setStage("cooking");
      setCookingProgress(0);
    } else if (stage === "eating") {
      if (roundIndex + 1 < quest.rounds.length) {
        setRoundIndex(roundIndex + 1);
        setStage("intro");
        setFishPos({ x: 20, y: 70 });
        setCookingProgress(0);
      } else {
        setStage("success");
      }
    } else if (stage === "success") {
      onComplete(item);
    }
  };

  const getDialogue = () => {
    if (stage === "success") return { speaker: "Lunti", bisayaText: "Busog na gyud ko! Salamat kaayo!", englishText: "I'm finally full! Thank you so much!" };
    if (stage === "intro") return currentRound.introDialogue;
    if (stage === "cooking" || stage === "cooked") return currentRound.cookingDialogue;
    if (stage === "eating") return currentRound.eatingDialogue;
    return { speaker: "Lunti", bisayaText: "Luto-on nato ang isda!", englishText: "Let's cook the fish!" };
  };

  const dialogue = getDialogue();

  return (
    <div className="iqm-overlay" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#FF9800", color: "#fff" }}>
            Cooking Game
          </span>
        </div>

        <div
          className="iqm-scene-canvas"
          ref={canvasRef}
          style={{
            backgroundImage: `url(${AssetManifest.forest.scenarios.campFire})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            cursor: isDragging ? "grabbing" : "default"
          }}
        >
          {/* NPC Lunti */}
          <div style={{
            position: "absolute",
            left: `${LUNTI_ZONE.x}%`,
            top: `${LUNTI_ZONE.y}%`,
            transform: "translate(-50%, -50%)",
            width: "120px",
            filter: stage === "eating" ? "drop-shadow(0 0 10px #FFEB3B)" : "none",
            transition: "all 0.3s"
          }}>
            <img 
              src={stage === "success" ? AssetManifest.forest.npcs.forest_guardian : npcImage} 
              alt="Lunti" 
              style={{ width: "100%", height: "auto" }}
            />
          </div>

          {/* Fish */}
          {(stage === "cooking" || stage === "cooked" || stage === "eating") && (
            <div
              onMouseDown={handleMouseDown}
              style={{
                position: "absolute",
                left: `${fishPos.x}%`,
                top: `${fishPos.y}%`,
                transform: "translate(-50%, -50%)",
                width: "80px",
                cursor: stage === "eating" ? "default" : (isDragging ? "grabbing" : "grab"),
                zIndex: 10,
                transition: isDragging ? "none" : "all 0.2s"
              }}
            >
              <img
                src={AssetManifest.forest.items.fish1}
                alt="Fish"
                draggable={false}
                style={{
                  width: "100%",
                  height: "auto",
                  mixBlendMode: "multiply",
                  filter: stage === "cooked" || stage === "eating" 
                    ? "sepia(0.6) brightness(0.7) contrast(1.2)" 
                    : "none"
                }}
              />
              {stage === "cooking" && isAtFire() && (
                <div style={{
                  position: "absolute",
                  bottom: -15,
                  left: 0,
                  width: "100%",
                  height: "6px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "3px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${cookingProgress}%`,
                    height: "100%",
                    background: "#FF5722",
                    transition: "width 0.1s"
                  }} />
                </div>
              )}
            </div>
          )}

          {/* Cooking Indicator at Fire */}
          {stage === "cooking" && !isAtFire() && (
            <div style={{
              position: "absolute",
              left: `${FIRE_ZONE.x}%`,
              top: `${FIRE_ZONE.y}%`,
              transform: "translate(-50%, -50%)",
              width: "100px",
              height: "100px",
              border: "3px dashed rgba(255,152,0,0.5)",
              borderRadius: "50%",
              animation: "pulse 1.5s infinite"
            }} />
          )}

          <style>{`
            @keyframes pulse {
              0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
              50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
              100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
            }
          `}</style>
        </div>

        <div className="iqm-dialogue-row">
          <img src={stage === "success" ? AssetManifest.forest.npcs.forest_guardian : npcImage} alt="NPC" className="iqm-npc-img" />
          <div className="iqm-dialogue-bubble">
            <div className="iqm-dialogue-speaker">{dialogue.speaker}</div>
            <div className="iqm-dialogue-text">
              <span className="iqm-dialogue-bisaya">{dialogue.bisayaText}</span>
              <span className="iqm-dialogue-english">{dialogue.englishText}</span>
            </div>
            {(stage === "intro" || stage === "eating" || stage === "success") && (
              <button className="iqm-next-btn" onClick={handleNext}>
                {stage === "success" ? "✓" : "▶"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampfireCookingGame;
