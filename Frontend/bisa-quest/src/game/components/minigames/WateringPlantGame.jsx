// ─────────────────────────────────────────────────────────────────────────────
//  WateringPlantGame.jsx — Drag watering can to plant to water it
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from "react";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import AssetManifest from "../../../services/AssetManifest";
import { buildQuestDialogue } from "../questHelpers";

const WateringPlantGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);
    const { wateringCan = {}, plantZone = {}, background } = quest;

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success

    const [pos, setPos] = useState({ x: wateringCan.startX, y: wateringCan.startY });
    const [dragged, setDragged] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isPouring, setIsPouring] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 5000ms
    const WATER_DURATION = 5000;

    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const timerRef = useRef(null);

    const bgImage = background || AssetManifest.village.scenarios.house;

    useEffect(() => {
        if (isPouring && stage === "playing" && progress < WATER_DURATION) {
            timerRef.current = setInterval(() => {
                setProgress(prev => {
                    const next = prev + 100;
                    if (next >= WATER_DURATION) {
                        clearInterval(timerRef.current);
                        setStage("success");
                        setShowSuccess(true);
                        setIsPouring(false);
                        return WATER_DURATION;
                    }
                    return next;
                });
            }, 100);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPouring, stage, progress]);

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(p => p + 1);
        else setStage("playing");
    };

    const checkIfOverZone = (currentPos) => {
        return (
            currentPos.x > plantZone.x &&
            currentPos.x < plantZone.x + plantZone.w &&
            currentPos.y > plantZone.y &&
            currentPos.y < plantZone.y + plantZone.h
        );
    };

    const handlePointerDown = (e) => {
        if (stage !== "playing") return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };
        setDragged(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!dragged) return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const r = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - r.left) / r.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - r.top) / r.height) * 100;
        
        const newPos = { x: Math.min(Math.max(x, 3), 97), y: Math.min(Math.max(y, 3), 97) };
        setPos(newPos);
        
        const overZone = checkIfOverZone(newPos);
        setIsPouring(overZone);
    };

    const handlePointerUp = (e) => {
        if (!dragged) return;
        setDragged(false);
        setIsPouring(false);
        if (e?.currentTarget && e.pointerId != null) {
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
        }
        
        // Let the can stay where it was dropped (or return if not success?)
        // The user says "user have free will to stop the drop". 
        // We'll keep it where it is if they drop it.
    };

    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (isPouring) return { bisayaText: "Ayan, gibisbisan na ang tanum...", englishText: "There, watering the plant..." };
        if (stage === "success") return {
            bisayaText: quest.successBisaya,
            englishText: quest.successEnglish,
        };
        return {
            bisayaText: quest.instructionBisaya,
            englishText: quest.instructionEnglish,
        };
    })();

    const canImage = (isPouring || stage === "success")
        ? ITEM_IMAGE_MAP.watering_can_pour
        : ITEM_IMAGE_MAP.watering_can;

    const progressPercent = (progress / WATER_DURATION) * 100;

    return (
        <div className="iqm-overlay">
            <style>{`
                .water-drop {
                    position: absolute;
                    background: #4fc3f7;
                    width: 4px;
                    height: 10px;
                    border-radius: 50%;
                    opacity: 0.8;
                    animation: waterFall 0.6s linear infinite;
                }
                @keyframes waterFall {
                    0% { transform: translateY(0) scaleY(1); opacity: 1; }
                    100% { transform: translateY(40px) scaleY(0.5); opacity: 0; }
                }
                .watering-progress-bar {
                    position: absolute;
                    top: 15%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 200px;
                    height: 12px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 6px;
                    overflow: hidden;
                    border: 2px solid white;
                    z-index: 20;
                }
                .watering-progress-fill {
                    height: 100%;
                    background: #4fc3f7;
                    transition: width 0.1s linear;
                }
            `}</style>
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <div className="iqm-header-bisaya">{item.labelBisaya}</div>
                    <div className="iqm-header-english">{item.labelEnglish}</div>
                </div>

                <div className="iqm-scene-canvas" ref={containerRef}>
                    <img src={bgImage} alt="Background" className="iqm-scene-bg" draggable={false}
                        style={{ objectFit: "cover" }} />

                    {/* Progress Bar */}
                    {stage === "playing" && progress > 0 && (
                        <div className="watering-progress-bar">
                            <div className="watering-progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                    )}

                    {/* Plant Zone Indicator */}
                    {stage === "playing" && (
                        <div style={{
                            position: "absolute",
                            left: `${plantZone.x}%`, top: `${plantZone.y}%`,
                            width: `${plantZone.w}%`, height: `${plantZone.h}%`,
                            border: "3px dashed rgba(255,255,255,0.5)",
                            borderRadius: "50%",
                            backgroundColor: "rgba(76, 175, 80, 0.2)",
                            pointerEvents: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "rgba(255,255,255,0.8)", fontSize: "24px",
                        }}>
                            🌿
                        </div>
                    )}

                    {/* Water Animation */}
                    {isPouring && (
                        <div style={{
                            position: "absolute",
                            left: `${pos.x - 4}%`, top: `${pos.y + 2}%`,
                            pointerEvents: "none",
                            zIndex: 15
                        }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="water-drop" style={{
                                    left: `${Math.random() * 20 - 10}px`,
                                    top: `${Math.random() * 10}px`,
                                    animationDelay: `${i * 0.1}s`
                                }} />
                            ))}
                        </div>
                    )}

                    {/* Watering Can */}
                    <div
                        className={`iqm-scene-broom ${dragged ? "iqm-scene-broom--dragging" : ""}`}
                        style={{
                            left: `${pos.x}%`, top: `${pos.y}%`,
                            transform: "translate(-50%, -50%)",
                            cursor: (stage !== "playing") ? "default" : (dragged ? "grabbing" : "grab"),
                            width: "120px", height: "120px",
                            zIndex: dragged ? 20 : 10,
                            transition: dragged ? "none" : "left 0.3s, top 0.3s",
                        }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        <img src={canImage} alt="Watering Can" style={{
                            width: "100%", height: "100%", objectFit: "contain",
                        }} draggable={false} />
                    </div>

                    {/* Success overlay */}
                    {stage === "success" && showSuccess && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🌿✨</div>
                                <div className="iqm-scene-success-text">{quest.successText || "Nahuman Na!"}</div>
                            </div>
                        </div>
                    )}
                </div>

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
            </div>
        </div>
    );
};

export default WateringPlantGame;
