import React, { useState, useRef, useEffect } from "react";
import AssetManifest from "../../../services/AssetManifest";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import { buildQuestDialogue } from "../questHelpers";

const WaterBarrelGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    // Randomized mode: "FILL" or "EMPTY"
    const [mode, setMode] = useState(null);
    const [stage, setStage] = useState("intro"); // intro | playing | success
    const [introStep, setIntroStep] = useState(0);
    const [points, setPoints] = useState(0);
    const REQUIRED_POINTS = 5;

    const dialogue = buildQuestDialogue(quest, item);
    const [draggedId, setDraggedId] = useState(null);
    const [positions, setPositions] = useState({});
    const [placedItems, setPlacedItems] = useState(new Set());
    const [showSuccessCard, setShowSuccessCard] = useState(false);

    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const TARGET_ZONE = { x: 74, y: 55, w: 20, h: 20 }; // Barrel top area

    useEffect(() => {
        const randomMode = Math.random() > 0.5 ? "FILL" : "EMPTY";
        setMode(randomMode);

        // Initialize buckets
        const buckets = Array.from({ length: REQUIRED_POINTS }).map((_, i) => ({
            id: `bucket_${i}`,
            startX: 15 + (i * 12),
            startY: 85
        }));
        
        setPositions(buckets.reduce((acc, b) => {
            acc[b.id] = { x: b.startX, y: b.startY };
            return acc;
        }, {}));
    }, []);

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(p => p + 1);
        else setStage("playing");
    };

    const handleDown = (id, e) => {
        if (stage !== "playing" || placedItems.has(id)) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };
        setDraggedId(id);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleMove = (id, e) => {
        if (draggedId !== id) return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
        
        setPositions(prev => ({ 
            ...prev, 
            [id]: { x: Math.min(Math.max(x, 5), 95), y: Math.min(Math.max(y, 5), 95) } 
        }));
    };

    const handleUp = (id, e) => {
        if (draggedId !== id) return;
        setDraggedId(null);
        if (e?.currentTarget && e.pointerId != null) {
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
        }

        const pos = positions[id];
        const inZone =
            pos.x > TARGET_ZONE.x - TARGET_ZONE.w / 2 &&
            pos.x < TARGET_ZONE.x + TARGET_ZONE.w / 2 &&
            pos.y > TARGET_ZONE.y - TARGET_ZONE.y / 2 &&
            pos.y < TARGET_ZONE.y + TARGET_ZONE.h / 2;

        if (inZone) {
            setPlacedItems(prev => {
                const next = new Set([...prev, id]);
                const newCount = next.size;
                setPoints(newCount);
                if (newCount >= REQUIRED_POINTS) {
                    setTimeout(() => triggerSuccess(), 400);
                }
                return next;
            });
        } else {
            // Reset position
            const index = parseInt(id.split("_")[1]);
            setPositions(prev => ({
                ...prev,
                [id]: { x: 15 + (index * 12), y: 85 }
            }));
        }
    };

    const triggerSuccess = () => {
        setStage("success");
        setShowSuccessCard(true);
    };

    if (!mode) return null;

    let bgImage = AssetManifest.village.scenarios.barrelEmpty;
    if (mode === "FILL") {
        bgImage = points >= REQUIRED_POINTS ? AssetManifest.village.scenarios.barrelFill : AssetManifest.village.scenarios.barrelEmpty;
    } else {
        // EMPTY mode
        bgImage = points >= REQUIRED_POINTS ? AssetManifest.village.scenarios.barrelEmpty : AssetManifest.village.scenarios.barrelFill;
    }

    // Adjust instructions based on mode
    const getInstructionText = () => {
        if (stage === "success") return {
            bisayaText: mode === "FILL" ? "Puno na ang drumin! Maayo!" : "Bawas na ang tubig! Nahuman na!",
            englishText: mode === "FILL" ? "The barrel is full! Great job!" : "Water is out! All done!",
        };
        if (mode === "FILL") return {
            bisayaText: "Punoa ang drumin og tubig gamit ang timba!",
            englishText: "Fill the barrel with water using the bucket!",
        };
        return {
            bisayaText: "Kuhaa ang tubig sa drumin gamit ang timba!",
            englishText: "Get the water out of the barrel using the bucket!",
        };
    };

    const instructionText = stage === "intro" ? dialogue[introStep] : getInstructionText();

    const successLabel = mode === "FILL" ? "Puno na ang Drumin!" : "Nahuman na ang pagbawas!";

    return (
        <div className="iqm-overlay">
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <div className="iqm-header-bisaya">{item.labelBisaya}</div>
                    <div className="iqm-header-english">{item.labelEnglish}</div>
                </div>

                <div className="iqm-scene-canvas" ref={containerRef}>
                    <img src={bgImage} alt="Water Barrel" className="iqm-scene-bg" draggable={false} />

                    {/* Target Zone Debug/Hint */}
                    {stage === "playing" && (
                        <div style={{
                            position: "absolute",
                            left: `${TARGET_ZONE.x}%`, top: `${TARGET_ZONE.y}%`,
                            width: `${TARGET_ZONE.w}%`, height: `${TARGET_ZONE.h}%`,
                            transform: "translate(-50%, -50%)",
                            border: "2px dashed rgba(255,255,255,0.4)",
                            borderRadius: "10px", pointerEvents: "none",
                            background: "rgba(255,255,255,0.05)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "24px"
                        }}>
                             {mode === "FILL" ? "💧" : "🪣"}
                        </div>
                    )}

                    {/* Progress Bar */}
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress" style={{ top: "10%" }}>
                            {Array.from({ length: REQUIRED_POINTS }).map((_, i) => (
                                <div key={i} className={`iqm-sweep-pip ${points > i ? "iqm-sweep-pip--done" : ""}`} />
                            ))}
                        </div>
                    )}

                    {/* Buckets */}
                    {(stage === "playing" || stage === "success") && (
                        Object.keys(positions).map(id => (
                            <div key={id}
                                style={{
                                    position: "absolute",
                                    left: `${positions[id].x}%`,
                                    top: `${positions[id].y}%`,
                                    transform: "translate(-50%, -50%)",
                                    width: "70px", height: "70px",
                                    zIndex: draggedId === id ? 20 : 10,
                                    opacity: placedItems.has(id) ? 0.6 : 1,
                                    cursor: placedItems.has(id) ? "default" : "grab",
                                    transition: draggedId === id ? "none" : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                }}
                                onPointerDown={(e) => handleDown(id, e)}
                                onPointerMove={(e) => handleMove(id, e)}
                                onPointerUp={(e) => handleUp(id, e)}
                            >
                                <img src={ITEM_IMAGE_MAP["bucket"]} alt="Bucket" style={{ width: "100%", height: "100%", objectFit: "contain" }} draggable={false} />
                            </div>
                        ))
                    )}

                    {/* Success Overlay */}
                    {stage === "success" && showSuccessCard && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨💦✨</div>
                                <div className="iqm-scene-success-text">{successLabel}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="iqm-dialogue-row">
                    <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
                    <div className="iqm-dialogue-bubble">
                        <div className="iqm-dialogue-speaker">{npcName}</div>
                        <div className="iqm-dialogue-text">
                            <span className="iqm-dialogue-bisaya">{instructionText.bisayaText}</span>
                            <span className="iqm-dialogue-english">{instructionText.englishText}</span>
                        </div>
                        {stage === "intro" && <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>}
                        {stage === "success" && <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterBarrelGame;
