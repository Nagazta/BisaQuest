import React, { useState, useRef } from "react";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import AssetManifest from "../../../services/AssetManifest";
import { buildQuestDialogue } from "../questHelpers";

const WipePlayerGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro");
    const [wiped, setWiped] = useState(new Set());
    const [toolPos, setToolPos] = useState({ x: quest.draggable.startX, y: quest.draggable.startY });
    const [isDragging, setIsDragging] = useState(false);
    const [showClean, setShowClean] = useState(false);
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const toolImg = ITEM_IMAGE_MAP[quest.draggable.imageKey] || null;
    const wipeStage = quest.wipeStage || quest.characterStage; // Support legacy characterStage

    const background = showClean ? wipeStage.cleanImage : wipeStage.dirtyImage;
    const dirtSpots = wipeStage.dirtSpots || wipeStage.sweatSpots;

    const handleToolPointerDown = (e) => {
        if (stage !== "playing") return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleToolPointerMove = (e) => {
        if (!isDragging || stage !== "playing") return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
        const cx = Math.min(Math.max(x, 5), 95);
        const cy = Math.min(Math.max(y, 5), 90);
        setToolPos({ x: cx, y: cy });

        dirtSpots.forEach(spot => {
            if (wiped.has(spot.id)) return;
            const overlap =
                cx + 4 > spot.x && cx - 4 < spot.x + spot.w &&
                cy + 4 > spot.y && cy - 4 < spot.y + spot.h;
            if (overlap) {
                setWiped(prev => {
                    const next = new Set([...prev, spot.id]);
                    if (next.size >= dirtSpots.length) {
                        setTimeout(() => { setShowClean(true); setStage("success"); }, 300);
                    }
                    return next;
                });
            }
        });
    };

    const handleToolPointerUp = () => setIsDragging(false);

    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") {
            return {
                bisayaText: wipeStage.successBisaya || "Limpyo na! Maayo kaayo! 🎉",
                englishText: wipeStage.successEnglish || "Cleaned! Well done! 🎉"
            };
        }
        const remaining = dirtSpots.length - wiped.size;
        if (remaining > 0) {
            return {
                bisayaText: wipeStage.remainingBisaya ? wipeStage.remainingBisaya(remaining) : `${remaining} hugaw pa ang nahibilin! Pahiri na!`,
                englishText: wipeStage.remainingEnglish ? wipeStage.remainingEnglish(remaining) : `${remaining} more spots to wipe!`
            };
        }
        return { bisayaText: quest.instructionBisaya, englishText: quest.instructionEnglish };
    })();

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(s => s + 1);
        else setStage("playing");
    };

    return (
        <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">{wipeStage.label || "Cleaning"}</span>
                </div>
                <div className="iqm-scene-canvas" ref={containerRef}>
                    {!wipeStage.hideBaseBackground && (
                        <img src={AssetManifest.village.scenarios.house} alt="House Background" className="iqm-scene-bg" draggable={false} />
                    )}
                    <img
                        src={background}
                        alt="Target"
                        className={wipeStage.hideBaseBackground ? "iqm-scene-bg" : ""}
                        style={!wipeStage.hideBaseBackground ? { 
                            position: "absolute", 
                            left: "50%", 
                            top: "50%", 
                            transform: "translate(-50%, -50%)", 
                            height: "80%", 
                            objectFit: "contain", 
                            pointerEvents: "none", 
                            transition: "opacity 0.3s ease" 
                        } : {
                            pointerEvents: "none"
                        }}
                        draggable={false}
                    />
                    {stage !== "intro" && dirtSpots.map(spot => (
                        <div
                            key={spot.id}
                            className={["iqm-dirt-spot", wiped.has(spot.id) ? "iqm-dirt-spot--swept" : ""].filter(Boolean).join(" ")}
                            style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.w}%`, height: `${spot.h}%` }}
                        />
                    ))}
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress">
                            {dirtSpots.map(spot => (
                                <span key={spot.id} className={`iqm-sweep-pip ${wiped.has(spot.id) ? "iqm-sweep-pip--done" : ""}`} />
                            ))}
                        </div>
                    )}
                    {stage !== "intro" && (
                        <div
                            className={["iqm-scene-broom", isDragging ? "iqm-scene-broom--dragging" : "", stage === "success" ? "iqm-scene-broom--hidden" : ""].filter(Boolean).join(" ")}
                            style={{
                                left: `${toolPos.x}%`,
                                top: `${toolPos.y}%`,
                                transform: "translate(-50%, -50%)",
                                cursor: stage === "playing" ? (isDragging ? "grabbing" : "grab") : "default",
                                zIndex: 10
                            }}
                            onPointerDown={handleToolPointerDown}
                            onPointerMove={handleToolPointerMove}
                            onPointerUp={handleToolPointerUp}
                            onPointerCancel={handleToolPointerUp}
                        >
                            {toolImg
                                ? <img src={toolImg} alt="Tool" className="iqm-scene-broom-img" style={{ width: 100, height: 100 }} draggable={false} />
                                : <span style={{ fontSize: 40 }}>🧻</span>
                            }
                            {stage === "playing" && !isDragging && (
                                <div className="iqm-drag-indicator"><span className="iqm-drag-hand">🖐️</span></div>
                            )}
                        </div>
                    )}
                    {stage === "success" && showClean && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">🧽✨🧽</div>
                                <div className="iqm-scene-success-text">{wipeStage.successLabel || "Limpyo Na!"}</div>
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

export default WipePlayerGame;
