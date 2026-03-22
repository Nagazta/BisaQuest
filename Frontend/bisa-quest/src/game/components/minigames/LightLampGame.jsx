// ─────────────────────────────────────────────────────────────────────────────
//  LightLampGame.jsx — Light a match and put it on the lamp
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef } from "react";
import AssetManifest from "../../../services/AssetManifest";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import { buildQuestDialogue } from "../questHelpers";

const LightLampGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | strike | place | success
    const [strikeCount, setStrikeCount] = useState(0);
    const [matchLit, setMatchLit] = useState(false);
    const [matchPos, setMatchPos] = useState({ x: 20, y: 70 });
    const [isDragging, setIsDragging] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Constants for positioning
    const LAMP_CENTER = { x: 50, y: 45 };
    const LAMP_RADIUS = 25;
    const BOX_CENTER = { x: 80, y: 75 };
    const BOX_RADIUS = 15;

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(p => p + 1);
        else setStage("strike");
    };

    const handlePointerDown = (e) => {
        if (stage === "success" || stage === "intro") return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging || stage === "success" || stage === "intro") return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const r = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - r.left) / r.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - r.top) / r.height) * 100;
        const cx = Math.min(Math.max(x, 5), 95);
        const cy = Math.min(Math.max(y, 5), 95);
        setMatchPos({ x: cx, y: cy });

        if (stage === "strike") {
            const overBox = Math.abs(cx - BOX_CENTER.x) < BOX_RADIUS &&
                            Math.abs(cy - BOX_CENTER.y) < BOX_RADIUS;
            if (overBox) {
                // Striking logic — requires "wiping" motion or just being over it
                // We'll use a simple count for now but better to detect movement
                setStrikeCount(prev => {
                    const next = prev + 0.1; // Accumulate slowly while over
                    if (next >= 3) {
                        setMatchLit(true);
                        setStage("place");
                        return 3;
                    }
                    return next;
                });
            }
        }
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        if (e?.currentTarget && e.pointerId != null) {
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
        }
        if (stage === "place" && matchLit) {
            const near = Math.abs(matchPos.x - LAMP_CENTER.x) < LAMP_RADIUS &&
                         Math.abs(matchPos.y - LAMP_CENTER.y) < LAMP_RADIUS;
            if (near) {
                setStage("success");
                setShowSuccess(true);
            } else {
                // Reset match position if dropped elsewhere?
                // setMatchPos({ x: 20, y: 70 });
            }
        }
    };

    const getDialogueText = () => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Nasindihan na ang lampara! 🔥", englishText: "The lamp is now lit! 🔥" };
        if (stage === "strike") return {
            bisayaText: `I-click ang posporo aron modilaab! (${Math.floor(strikeCount)}/3)`,
            englishText: `Click the match to strike it! (${Math.floor(strikeCount)}/3)`
        };
        return { bisayaText: "I-drag ang posporo ngadto sa lampara!", englishText: "Drag the lit match to the lamp!" };
    };

    const dialogueText = getDialogueText();

    return (
        <div className="iqm-overlay">
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <div className="iqm-header-bisaya">{item.labelBisaya}</div>
                    <div className="iqm-header-english">{item.labelEnglish}</div>
                </div>

                <div className="iqm-scene-canvas" ref={containerRef}
                    style={{ 
                        background: "#000", 
                        position: "relative",
                        overflow: "hidden",
                    }}>
                    
                    {/* Living Room Background */}
                    <img 
                        src={AssetManifest.village.scenarios.house} 
                        alt="Background" 
                        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: stage === "success" ? 1 : 0.4, transition: "opacity 0.5s ease" }}
                        draggable={false}
                    />

                    {/* Lamp (fixed) */}
                    <div style={{
                        position: "absolute", left: `${LAMP_CENTER.x}%`, top: `${LAMP_CENTER.y}%`,
                        transform: "translate(-50%, -50%)", width: "400px", height: "400px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        pointerEvents: "none",
                        zIndex: 5
                    }}>
                        <img 
                            src={stage === "success" ? ITEM_IMAGE_MAP["lamp_on"] : ITEM_IMAGE_MAP["lamp_off"]} 
                            alt="Lamp" 
                            style={{
                                width: "100%", height: "100%", objectFit: "contain",
                                filter: stage === "success" ? "drop-shadow(0 0 50px #fcd765) brightness(1.2)" : "brightness(0.6)",
                                transition: "all 0.5s ease"
                            }} 
                            draggable={false} 
                        />
                    </div>

                    {/* Matchbox for striking */}
                    {stage === "strike" && (
                        <div style={{
                            position: "absolute", right: "10%", bottom: "10%",
                            width: "220px", height: "140px",
                            border: "3px dashed #fcd765",
                            borderRadius: "12px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(252, 215, 101, 0.2)",
                            zIndex: 4,
                            transform: "rotate(-10deg)"
                        }}>
                            <img src={ITEM_IMAGE_MAP["box_match"]} alt="Matchbox" style={{ width: "100%", height: "100%", objectFit: "contain" }} draggable={false} />
                            <div style={{ position: "absolute", top: "-35px", color: "#fcd765", fontSize: "18px", fontWeight: "bold" }}>STRIKE HERE</div>
                        </div>
                    )}

                    {/* Match — draggable */}
                    {(stage === "strike" || stage === "place") && (
                        <div
                            style={{
                                position: "absolute",
                                left: `${matchPos.x}%`,
                                top: `${matchPos.y}%`,
                                transform: "translate(-50%, -50%)",
                                cursor: isDragging ? "grabbing" : "grab",
                                width: "160px", height: "160px", zIndex: 10,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                touchAction: "none"
                            }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                        >
                            <img 
                                src={matchLit ? ITEM_IMAGE_MAP["lit_match"] : ITEM_IMAGE_MAP["match"]} 
                                alt="Match" 
                                style={{
                                    width: "100%", height: "100%", objectFit: "contain",
                                    filter: matchLit ? "drop-shadow(0 0 20px #fcd765)" : "none"
                                }} 
                                draggable={false} 
                            />
                            {stage === "strike" && !isDragging && (
                                <div className="iqm-drag-indicator" style={{ width: "60px", height: "60px" }}>
                                    <span className="iqm-drag-hand" style={{ fontSize: "32px" }}>🖐️</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Strike progress */}
                    {stage === "strike" && (
                        <div className="iqm-sweep-progress" style={{ top: "10px" }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} className={`iqm-sweep-pip ${strikeCount > i ? "iqm-sweep-pip--done" : ""}`} />
                            ))}
                        </div>
                    )}

                    {/* Success Message Card (over canvas) */}
                    {stage === "success" && showSuccess && (
                        <div className="iqm-scene-success-overlay" style={{ background: "rgba(0,0,0,0.5)", zIndex: 150 }}>
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">🕯️🔥🕯️</div>
                                <div className="iqm-scene-success-text">Nasindihan na ang Lampara!</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Standard Dialogue Row at bottom */}
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

export default LightLampGame;
