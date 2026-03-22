import React, { useState, useEffect, useRef } from "react";
import AssetManifest from "../../../services/AssetManifest";

const FlowerBloomingGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  // Simple one-round state
  const [stage, setStage] = useState("intro"); // intro, watering, bloomed
  const currentRound = quest.rounds[0]; // Only one round

  const [canPos, setCanPos] = useState({ x: 80, y: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const [growthProgress, setGrowthProgress] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const canvasRef = useRef(null);

  const FLOWER_ZONE = { x: 35, y: 70, r: 25 }; // Larger hit zone

  // Reset progress when intro starts (safety)
  useEffect(() => {
    if (stage === "intro") setGrowthProgress(0);
  }, [stage]);

  useEffect(() => {
    let timer;
    if (isPouring && growthProgress < 100 && stage === "watering") {
      timer = setInterval(() => {
        setGrowthProgress((prev) => Math.min(100, prev + 2.5)); // Faster bloom (~4s)
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPouring, growthProgress, stage]);

  // Reliable stage transition to bloomed
  useEffect(() => {
    if (growthProgress >= 100 && stage === "watering") {
      setStage("bloomed");
      setIsPouring(false); 
      setIsDragging(false);
    }
  }, [growthProgress, stage]);

  const handleMouseDown = (e) => {
    if (stage === "intro" || stage === "bloomed") return;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPos = { 
      x: Math.max(5, Math.min(95, x)), 
      y: Math.max(5, Math.min(95, y)) 
    };
    setCanPos(newPos);

    // Update pouring state based on position
    const dx = newPos.x - FLOWER_ZONE.x;
    const dy = newPos.y - FLOWER_ZONE.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    setIsPouring(dist < FLOWER_ZONE.r);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPouring(false);
  };

  const handleNext = () => {
    if (stage === "intro") {
      setStage("watering");
      setGrowthProgress(0);
    } else if (stage === "bloomed") {
      onComplete(item); // Simple finish
    }
  };

  const getDialogue = () => {
    if (stage === "intro") return currentRound.introDialogue;
    if (stage === "bloomed") return currentRound.resultDialogue;
    
    if (stage === "watering" && currentRound.wateringDialogues) {
      const activeDialogue = [...currentRound.wateringDialogues]
        .reverse()
        .find(d => growthProgress >= d.threshold);
      if (activeDialogue) return { speaker: "Lunti", ...activeDialogue };
    }

    return { speaker: "Lunti", bisayaText: "Bisbisan nato ang mga bulak!", englishText: "Let's water the flowers!" };
  };

  const dialogue = getDialogue();

  // Determine flower image based on progress
  const flowerImg =
    growthProgress >= 100
      ? AssetManifest.forest.scenarios.flowerBlooming
      : growthProgress >= 40
      ? AssetManifest.forest.scenarios.flowerGrowing
      : AssetManifest.forest.scenarios.flowerWilted;

  return (
    <div className="iqm-overlay" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#4CAF50", color: "#fff" }}>
            Blooming Game
          </span>
        </div>

        <div
          className="iqm-scene-canvas"
          ref={canvasRef}
          style={{
            backgroundImage: `url(${flowerImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            cursor: isDragging ? "grabbing" : "default",
            overflow: "hidden",
            borderRadius: "12px"
          }}
        >
          {/* Main Progress Bar (at top) */}
          {stage === "watering" && (
            <div style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "250px",
              height: "12px",
              background: "rgba(0,0,0,0.5)",
              border: "2px solid #fcd765",
              borderRadius: "10px",
              overflow: "hidden",
              zIndex: 100
            }}>
              <div style={{
                width: `${growthProgress}%`,
                height: "100%",
                background: "#2196F3",
                transition: "width 0.1s",
                boxShadow: "0 0 10px rgba(33, 150, 243, 0.8)"
              }} />
            </div>
          )}

          {/* Success overlay - only when fully bloomed */}
          {stage === "bloomed" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">✨🌸✨</div>
                <div className="iqm-scene-success-text">Quest Complete!</div>
                <p style={{ color: "white", margin: "10px 0 0", fontSize: "14px" }}>Click "✓" to finish.</p>
              </div>
            </div>
          )}

          {/* Watering Hint Zone */}
          {stage === "watering" && growthProgress < 100 && !isPouring && (
            <div style={{
              position: "absolute",
              left: `${FLOWER_ZONE.x}%`,
              top: `${FLOWER_ZONE.y}%`,
              transform: "translate(-50%, -50%)",
              width: "180px",
              height: "180px",
              border: "4px dashed rgba(33, 150, 243, 0.6)",
              borderRadius: "50%",
              animation: "pulse 1.5s infinite",
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
              pointerEvents: "none",
              zIndex: 5
            }}>
              <span style={{ fontSize: "24px", marginBottom: "5px" }}>💦</span>
              WATER HERE
            </div>
          )}

          {/* Water Can (Draggable) */}
          {(stage === "watering" || stage === "intro") && (
            <div
              style={{
                position: "absolute",
                left: `${canPos.x}%`,
                top: `${canPos.y}%`,
                transform: `translate(-50%, -50%) rotate(${isPouring ? "-30deg" : "0deg"})`,
                width: "90px",
                height: "90px",
                backgroundImage: `url(${AssetManifest.village.items.wateringCan})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                cursor: isDragging ? "grabbing" : "grab",
                zIndex: 50,
                transition: isDragging ? "none" : "all 0.3s ease"
              }}
              onMouseDown={handleMouseDown}
            >
              {!isDragging && stage === "watering" && growthProgress === 0 && (
                <div style={{
                  position: "absolute",
                  top: "-40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "30px",
                  animation: "bounce 1s infinite"
                }}>👆</div>
              )}

              {/* Water pouring animation */}
              {isPouring && (
                <div className="water-pour" style={{
                  position: "absolute",
                  left: "-10px",
                  top: "30px",
                  pointerEvents: "none"
                }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="water-drop" style={{
                      animationDelay: `${i * 0.2}s`,
                      left: `${Math.random() * 10 - 5}px`
                    }} />
                  ))}
                </div>
              )}
            </div>
          )}

          <style>{`
            .water-drop {
              position: absolute;
              width: 6px;
              height: 12px;
              background: #2196F3;
              border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
              animation: drop 0.8s infinite linear;
              opacity: 0.7;
            }
            @keyframes drop {
              0% { transform: translateY(0) scale(1); opacity: 0.7; }
              100% { transform: translateY(60px) scale(0.5); opacity: 0; }
            }
            @keyframes pulse {
              0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.6; }
              50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.6; }
            }
            @keyframes bounce {
              0%, 100% { transform: translateX(-50%) translateY(0); }
              50% { transform: translateX(-50%) translateY(-10px); }
            }
            .iqm-scene-success-overlay {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 80;
              background: rgba(0,0,0,0.3);
              animation: fadeIn 0.5s ease-out;
            }
            .iqm-scene-success-card {
              background: rgba(0, 0, 0, 0.85);
              border: 3px solid #fcd765;
              border-radius: 20px;
              padding: 20px 40px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0,0,0,0.6);
              animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .iqm-scene-success-stars { font-size: 35px; margin-bottom: 10px; }
            .iqm-scene-success-text { color: #fcd765; font-family: Pixelify Sans, sans-serif; font-weight: bold; font-size: 24px; }
          `}</style>
        </div>

        <div className="iqm-dialogue-row">
          <img src={AssetManifest.forest.npcs.forest_guardian} alt="NPC" className="iqm-npc-img" />
          <div className="iqm-dialogue-bubble">
            <div className="iqm-dialogue-speaker">{dialogue.speaker}</div>
            <div className="iqm-dialogue-text">
              <span className="iqm-dialogue-bisaya">{dialogue.bisayaText}</span>
              <span className="iqm-dialogue-english">{dialogue.englishText}</span>
            </div>
            {(stage === "intro" || stage === "bloomed") && (
              <button className="iqm-next-btn" onClick={handleNext}>
                {stage === "bloomed" ? "✓" : "▶"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowerBloomingGame;
