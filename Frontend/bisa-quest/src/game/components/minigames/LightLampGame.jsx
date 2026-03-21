// ─────────────────────────────────────────────────────────────────────────────
//  LightLampGame.jsx — Light a match and put it on the lamp
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef } from "react";
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

    const matchImg = ITEM_IMAGE_MAP["matchstick"] || null;
    const lampImg = ITEM_IMAGE_MAP["lamp"] || null;

    // Lamp center position
    const LAMP_CENTER = { x: 50, y: 45 };
    const LAMP_RADIUS = 12;

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(p => p + 1);
        else setStage("strike");
    };

    // Strike phase — click the match 3 times to light it
    const handleStrike = () => {
        if (stage !== "strike") return;
        setStrikeCount(prev => {
            const next = prev + 1;
            if (next >= 3) {
                setMatchLit(true);
                setTimeout(() => setStage("place"), 400);
            }
            return next;
        });
    };

    // Place phase — drag lit match to lamp
    const handlePointerDown = (e) => {
        if (stage !== "place") return;
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
        if (!isDragging || stage !== "place") return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const r = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - r.left) / r.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - r.top) / r.height) * 100;
        setMatchPos({ x: Math.min(Math.max(x, 5), 95), y: Math.min(Math.max(y, 5), 95) });
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        if (e?.currentTarget && e.pointerId != null) {
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
        }
        if (stage === "place") {
            const near = Math.abs(matchPos.x - LAMP_CENTER.x) < LAMP_RADIUS &&
                         Math.abs(matchPos.y - LAMP_CENTER.y) < LAMP_RADIUS;
            if (near) {
                setStage("success");
                setShowSuccess(true);
            } else {
                setMatchPos({ x: 20, y: 70 });
            }
        }
    };

    const getDialogueText = () => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Nasindihan na ang lampara! 🔥", englishText: "The lamp is now lit! 🔥" };
        if (stage === "strike") return {
            bisayaText: `I-click ang posporo aron modilaab! (${strikeCount}/3)`,
            englishText: `Click the match to strike it! (${strikeCount}/3)`
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
                    style={{ background: "linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>

                    {/* Lamp (fixed) */}
                    <div style={{
                        position: "absolute", left: `${LAMP_CENTER.x}%`, top: `${LAMP_CENTER.y}%`,
                        transform: "translate(-50%, -50%)", width: "120px", height: "120px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        pointerEvents: "none",
                    }}>
                        {lampImg
                            ? <img src={lampImg} alt="Lamp" style={{
                                width: "100%", height: "100%", objectFit: "contain",
                                filter: stage === "success" ? "brightness(1.5) drop-shadow(0 0 20px orange)" : "brightness(0.6)",
                                transition: "filter 0.5s",
                            }} draggable={false} />
                            : <span style={{ fontSize: "60px" }}>🪔</span>
                        }
                        {stage === "success" && (
                            <div style={{
                                position: "absolute", top: "-15px",
                                fontSize: "30px", animation: "iqm-float 1s ease-in-out infinite",
                            }}>🔥</div>
                        )}
                    </div>

                    {/* Match — clickable in strike stage, draggable in place stage */}
                    {(stage === "strike" || stage === "place") && (
                        <div
                            className={`iqm-scene-broom ${isDragging ? "iqm-scene-broom--dragging" : ""}`}
                            style={{
                                left: stage === "strike" ? "50%" : `${matchPos.x}%`,
                                top: stage === "strike" ? "75%" : `${matchPos.y}%`,
                                transform: "translate(-50%, -50%)",
                                cursor: stage === "strike" ? "pointer" : (isDragging ? "grabbing" : "grab"),
                                width: "80px", height: "80px", zIndex: 10,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                            onClick={handleStrike}
                            onPointerDown={stage === "place" ? handlePointerDown : undefined}
                            onPointerMove={stage === "place" ? handlePointerMove : undefined}
                            onPointerUp={stage === "place" ? handlePointerUp : undefined}
                            onPointerCancel={stage === "place" ? handlePointerUp : undefined}
                        >
                            {matchImg
                                ? <img src={matchImg} alt="Match" style={{
                                    width: "100%", height: "100%", objectFit: "contain",
                                    filter: matchLit ? "brightness(1.3) drop-shadow(0 0 8px orange)" : "none",
                                }} draggable={false} />
                                : <span style={{ fontSize: "40px" }}>{matchLit ? "🔥" : "🪔"}</span>
                            }
                            {matchLit && (
                                <div style={{
                                    position: "absolute", top: "-8px",
                                    fontSize: "20px", animation: "iqm-float 0.5s ease-in-out infinite",
                                }}>🔥</div>
                            )}
                        </div>
                    )}

                    {/* Strike progress */}
                    {stage === "strike" && (
                        <div className="iqm-sweep-progress" style={{ top: "10%", bottom: "auto" }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} className={`iqm-sweep-pip ${strikeCount > i ? "iqm-sweep-pip--done" : ""}`} />
                            ))}
                        </div>
                    )}

                    {/* Success */}
                    {stage === "success" && showSuccess && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">🕯️🔥🕯️</div>
                                <div className="iqm-scene-success-text">Nasindihan na ang Lampara!</div>
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

export default LightLampGame;
