import React, { useState, useEffect, useRef } from "react";
import AssetManifest from "../../../services/AssetManifest";

const ROUNDS = [
  {
    target: "Hinay",
    dialogue: {
      speaker: "Lunti",
      bisayaText: "Ang mga isda paspas ra kaayo! Dakpon nato una ang HINAY nga isda.",
      englishText: "The fishes are too fast! Let's catch the SLOW fish first."
    },
    fishes: [
      { id: "f1", speed: 0.3, scale: 1, isTarget: true, imgIdx: 0 },
      { id: "f2", speed: 2.5, scale: 1, isTarget: false, imgIdx: 1, errorText: { speaker: "Lunti", bisayaText: "Sayop! Paspas ra kaayo na nga isda.", englishText: "Wrong! That fish is too fast." } },
      { id: "f3", speed: 3.0, scale: 1, isTarget: false, imgIdx: 2, errorText: { speaker: "Lunti", bisayaText: "Sayop! Paspas ra kaayo na nga isda.", englishText: "Wrong! That fish is too fast." } },
    ]
  },
  {
    target: "Paspas",
    dialogue: {
      speaker: "Lunti",
      bisayaText: "Maayo! Karon nga naandan na nimo, atong dakpon ang PASPAS nga isda!",
      englishText: "Good! Now that you're used to it, let's catch the FAST fish!"
    },
    fishes: [
      { id: "f1", speed: 3.5, scale: 1, isTarget: true, imgIdx: 0 },
      { id: "f2", speed: 0.4, scale: 1, isTarget: false, imgIdx: 1, errorText: { speaker: "Lunti", bisayaText: "Sayop! Hinay ra kaayo na nga isda.", englishText: "Wrong! That fish is too slow." } },
      { id: "f3", speed: 0.5, scale: 1, isTarget: false, imgIdx: 2, errorText: { speaker: "Lunti", bisayaText: "Sayop! Hinay ra kaayo na nga isda.", englishText: "Wrong! That fish is too slow." } },
    ]
  },
  {
    target: "Gamay",
    dialogue: {
      speaker: "Lunti",
      bisayaText: "Nindot! Karon, tabangi ko dakop ug GAMAY nga isda.",
      englishText: "Great! Now, help me catch a SMALL fish."
    },
    fishes: [
      { id: "f1", speed: 1.2, scale: 0.4, isTarget: true, imgIdx: 0 },
      { id: "f2", speed: 1.2, scale: 1.5, isTarget: false, imgIdx: 1, errorText: { speaker: "Lunti", bisayaText: "Sayop! Dako ra kaayo na nga isda.", englishText: "Wrong! That fish is too big." } },
      { id: "f3", speed: 1.2, scale: 1.4, isTarget: false, imgIdx: 2, errorText: { speaker: "Lunti", bisayaText: "Sayop! Dako ra kaayo na nga isda.", englishText: "Wrong! That fish is too big." } },
    ]
  },
  {
    target: "Dako",
    dialogue: {
      speaker: "Lunti",
      bisayaText: "Maayo! Katapusan, pagdakop ug DAKO nga isda para ma-busog gyud ko!",
      englishText: "Good! Lastly, catch a BIG fish so I can be really full!"
    },
    fishes: [
      { id: "f1", speed: 1.0, scale: 1.7, isTarget: true, imgIdx: 0 },
      { id: "f2", speed: 1.0, scale: 0.4, isTarget: false, imgIdx: 1, errorText: { speaker: "Lunti", bisayaText: "Sayop! Gamay ra kaayo na nga isda.", englishText: "Wrong! That fish is too small." } },
      { id: "f3", speed: 1.0, scale: 0.5, isTarget: false, imgIdx: 2, errorText: { speaker: "Lunti", bisayaText: "Sayop! Gamay ra kaayo na nga isda.", englishText: "Wrong! That fish is too small." } },
    ]
  }
];

const COMPLETION_DIALOGUE = {
  speaker: "Lunti",
  bisayaText: "Salamat kaayo! The raw fish is ready to cook! 🐟🔥",
  englishText: "Thank you so much! The raw fish is ready to cook! 🐟🔥",
};

const FishingGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [stage, setStage] = useState("dialogue"); // "dialogue", "playing", "success", "error"
  const [currentError, setCurrentError] = useState(null);

  // Hook state
  const canvasRef = useRef(null);
  const [hookPos, setHookPos] = useState({ x: 50, y: 15 });
  const [isDragging, setIsDragging] = useState(false);
  const [hookAttachedTo, setHookAttachedTo] = useState(null);

  // Error Shake
  const [shakeId, setShakeId] = useState(null);

  // Fishes
  const [fishes, setFishes] = useState([]);

  const fishImages = [
    AssetManifest.forest.items.fish1,
    AssetManifest.forest.items.fish2,
    AssetManifest.forest.items.fish3,
  ];

  // Initialize fishes for the current round
  useEffect(() => {
    if (roundIndex >= ROUNDS.length) return;

    // Spread them randomly across Y and give random start directions
    const initialFishes = ROUNDS[roundIndex].fishes.map((f, index) => ({
      ...f,
      x: 10 + Math.random() * 80,
      y: 40 + Math.random() * 40, // lower half
      dir: Math.random() > 0.5 ? 1 : -1,
    }));

    setFishes(initialFishes);
    setHookAttachedTo(null);
    setHookPos({ x: 50, y: 15 });
  }, [roundIndex]);

  // Handle fish movement loop
  useEffect(() => {
    if (stage !== "playing") return;

    let animationFrameId;

    const loop = () => {
      setFishes((prev) =>
        prev.map((f) => {
          if (hookAttachedTo === f.id) return f; // Don't move if attached to hook

          let newX = f.x + (f.speed * f.dir);
          let newDir = f.dir;

          if (newX > 95) {
            newX = 95;
            newDir = -1;
          } else if (newX < 5) {
            newX = 5;
            newDir = 1;
          }

          return { ...f, x: newX, dir: newDir };
        })
      );
      animationFrameId = requestAnimationFrame(loop);
    };

    // Throttle slightly to avoid too fast updates if needed, but requestAnimationFrame is smooth
    // Actually scale speed down for requestAnimationFrame
    const throttledLoop = () => {
      setFishes(prev => prev.map(f => {
        if (hookAttachedTo === f.id) return f;
        // scale down speed by factor of 10 to match 60fps
        let moveAmt = (f.speed / 10) * f.dir;
        let newX = f.x + moveAmt;
        let newDir = f.dir;
        if (newX > 90) { newX = 90; newDir = -1; }
        if (newX < 10) { newX = 10; newDir = 1; }
        return { ...f, x: newX, dir: newDir };
      }));
      animationFrameId = requestAnimationFrame(throttledLoop);
    }

    animationFrameId = requestAnimationFrame(throttledLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [stage, hookAttachedTo]);


  const handleNext = () => {
    if (stage === "dialogue" || stage === "error") {
      setStage("playing");
      setCurrentError(null);
    } else if (stage === "success") {
      onComplete(item);
    }
  };

  const getDialogueText = () => {
    if (stage === "success") return COMPLETION_DIALOGUE;
    if (stage === "error" && currentError) return currentError;
    return ROUNDS[roundIndex].dialogue;
  };

  const dialogue = getDialogueText();
  const currentNpcImage =
    stage === "success"
      ? AssetManifest.forest.npcs.forest_guardian
      : AssetManifest.forest.npcs.forest_guardian_hungry;

  // Dragging logic
  const handleMouseDown = (e) => {
    e.preventDefault();
    if (stage !== "playing") return;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || stage !== "playing") return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let newX = ((e.clientX - rect.left) / rect.width) * 100;
    let newY = ((e.clientY - rect.top) / rect.height) * 100;

    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(5, Math.min(95, newY));

    setHookPos({ x: newX, y: newY });

    if (!hookAttachedTo) {
      // Check collision
      const HIT_RADIUS = 10;
      const caught = fishes.find((f) => {
        // adjust hitbox slightly for big fish
        const hit = HIT_RADIUS * Math.max(1, f.scale * 0.8);
        const dx = f.x - newX;
        const dy = f.y - newY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < hit;
      });

      if (caught) {
        setHookAttachedTo(caught.id);
      }
    } else {
      // Pulling the fish up to the surface
      if (newY < 20) {
        const attachedFish = fishes.find(f => f.id === hookAttachedTo);

        if (attachedFish.isTarget) {
          // Correct catch!
          setIsDragging(false);
          if (roundIndex + 1 < ROUNDS.length) {
            setRoundIndex(r => r + 1);
            setStage("dialogue"); // Pause and show next instruction
          } else {
            setStage("success");
          }
        } else {
          // Wrong catch! Drop it and show error
          setShakeId(attachedFish.id);
          setHookAttachedTo(null);
          setCurrentError(attachedFish.errorText);
          setStage("error");
          setTimeout(() => setShakeId(null), 500);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="iqm-overlay" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>
          ✕
        </button>

        <div className="iqm-header" style={{ pointerEvents: "none" }}>
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#2196F3" }}>
            Fishing Game
          </span>
        </div>

        <div
          className="iqm-scene-canvas"
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          style={{
            backgroundImage: `url(${AssetManifest.forest.scenarios.pondUnderwater})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
            cursor: isDragging ? "grabbing" : "default",
          }}
        >
          {/* Progress Overlay */}
          {stage === "playing" && (
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 15,
                background: "rgba(255,255,255,0.8)",
                padding: "6px 14px",
                borderRadius: "20px",
                fontWeight: "bold",
                color: "#333",
                zIndex: 10,
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              }}
            >
              Dakpon: {ROUNDS[roundIndex].target} ({roundIndex}/{ROUNDS.length})
            </div>
          )}

          {/* Fishes */}
          {fishes.map((f) => {
            const isAttached = hookAttachedTo === f.id;
            const fishX = isAttached ? hookPos.x : f.x;
            const fishY = isAttached ? hookPos.y + (5 * f.scale) : f.y; // hang below hook

            // direction mapping: 1 = right, -1 = left. The image native direction seems to face left usually, so scaleX(-dir)
            const facingX = f.dir === 1 ? -1 : 1;
            const isShaking = shakeId === f.id;

            return (
              <div
                key={f.id}
                style={{
                  position: "absolute",
                  left: `${fishX}%`,
                  top: `${fishY}%`,
                  transform: `translate(-50%, -50%) scaleX(${facingX}) scale(${f.scale})`,
                  width: "70px",
                  pointerEvents: "none",
                  transition: isAttached ? "none" : "top 0.2s ease", // only transition Y smoothly, X is frame-by-frame
                  zIndex: isAttached ? 15 : 5,
                  animation: isShaking ? "shakeError 0.5s ease" : "none",
                }}
              >
                <img
                  src={fishImages[f.imgIdx]}
                  alt="Fish"
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "auto",
                    filter: isShaking ? "sepia(100%) hue-rotate(310deg) saturate(300%) drop-shadow(0 2px 4px rgba(0,0,0,0.5))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  }}
                />
              </div>
            );
          })}

          {/* Line & Hook */}
          {stage === "playing" && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: `${hookPos.x}%`,
                  top: '-10%',
                  height: `${hookPos.y + 10}%`,
                  width: "2px",
                  background: "rgba(255,255,255,0.8)",
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                  zIndex: 14,
                }}
              />
              <div
                onMouseDown={handleMouseDown}
                style={{
                  position: "absolute",
                  left: `${hookPos.x}%`,
                  top: `${hookPos.y}%`,
                  transform: "translate(-50%, -10%)",
                  fontSize: "40px",
                  zIndex: 15,
                  cursor: isDragging ? "grabbing" : "grab",
                  userSelect: "none",
                  filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))",
                }}
              >
                {!isDragging && stage === "playing" && (
                  <div style={{
                    position: "absolute",
                    top: "55px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "24px",
                    animation: "bounce 1s infinite",
                    pointerEvents: "none",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                  }}>
                    👆
                  </div>
                )}
                🪝
              </div>
            </>
          )}

          {/* Surface Drop Zone Hint */}
          {hookAttachedTo && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "20%",
              background: "rgba(255, 255, 255, 0.2)",
              borderBottom: "4px dashed rgba(255, 255, 255, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "18px",
              pointerEvents: "none",
              zIndex: 10,
              animation: "pulseSurface 2s infinite"
            }}>
              ⬆️ PULL UP TO CATCH!
            </div>
          )}

          {/* Success overlay */}
          {stage === "success" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🐟🔥</div>
                <div className="iqm-scene-success-text">Ready to cook!</div>
              </div>
            </div>
          )}

          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateX(-50%) translateY(0); }
              50% { transform: translateX(-50%) translateY(-10px); }
            }
            @keyframes pulseSurface {
              0%, 100% { background: rgba(255, 255, 255, 0.1); }
              50% { background: rgba(255, 255, 255, 0.3); }
            }
            @keyframes shakeError {
              0%, 100% { transform: translate(-50%, -50%) rotate(0); }
              25% { transform: translate(-50%, -50%) rotate(25deg) scale(1.1); }
              50% { transform: translate(-50%, -50%) rotate(-25deg) scale(1.1); }
              75% { transform: translate(-50%, -50%) rotate(15deg) scale(1.1); }
            }
          `}</style>
        </div>

        {/* Dialogue Row */}
        <div className="iqm-dialogue-row">
          <img src={currentNpcImage} alt={dialogue.speaker} className="iqm-npc-img" draggable={false} />
          <div className="iqm-dialogue-bubble">
            <div className="iqm-dialogue-speaker">{dialogue.speaker}</div>
            <div className="iqm-dialogue-text">
              <span className="iqm-dialogue-bisaya">{dialogue.bisayaText}</span>
              <span className="iqm-dialogue-english">{dialogue.englishText}</span>
            </div>
            {(stage === "dialogue" || stage === "success") && (
              <button className="iqm-next-btn" onClick={handleNext}>
                {stage === "success" ? "✓" : "▶"}
              </button>
            )}
            {stage === "error" && (
              <button
                className="iqm-next-btn"
                style={{ background: "#ef5350", boxShadow: "0 3px 0 #991b1b", marginTop: "-40px" }}
                onClick={handleNext}
                title="Play Again"
              >
                ↺
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishingGame;
