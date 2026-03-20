import React, { useState, useRef } from "react";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import AssetManifest from "../../../services/AssetManifest";
import { buildQuestDialogue } from "../questHelpers";

const SceneDragGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success
    const [swept, setSwept] = useState(new Set());
    const [broomPos, setBroomPos] = useState({ x: quest.draggable.startX, y: quest.draggable.startY });
    const [isDragging, setIsDragging] = useState(false);
    const [showClean, setShowClean] = useState(false);
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const broomImg = ITEM_IMAGE_MAP[quest.draggable.imageKey] || null;

    const dirtyBg = quest.background === "spill"
        ? AssetManifest.village.scenarios.livingRoomSpill
        : AssetManifest.village.scenarios.livingRoomDirty;

    const background = showClean
        ? AssetManifest.village.scenarios.house
        : dirtyBg;

    const handleBroomPointerDown = (e) => {
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

    const handleBroomPointerMove = (e) => {
        if (!isDragging || stage !== "playing") return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
        const cx = Math.min(Math.max(x, 5), 90);
        const cy = Math.min(Math.max(y, 5), 85);
        setBroomPos({ x: cx, y: cy });

        quest.dirtSpots.forEach(spot => {
            if (swept.has(spot.id)) return;
            const overlap =
                cx + 4 > spot.x && cx - 4 < spot.x + spot.w &&
                cy + 4 > spot.y && cy - 4 < spot.y + spot.h;
            if (overlap) {
                setSwept(prev => {
                    const next = new Set([...prev, spot.id]);
                    if (next.size >= quest.dirtSpots.length) {
                        setTimeout(() => {
                            setShowClean(true);
                            setStage("success");
                        }, 300);
                    }
                    return next;
                });
            }
        });
    };

    const handleBroomPointerUp = () => setIsDragging(false);

    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Limpyo na ang salog! Maayo kaayo! 🎉", englishText: "The floor is clean! Well done! 🎉" };
        const remaining = quest.dirtSpots.length - swept.size;
        if (remaining > 0) return {
            bisayaText: `${remaining} hugaw pa ang nahibilin! I-silhig na!`,
            englishText: `${remaining} more dirt spots to sweep!`,
        };
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
                    <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">Clean the Floor</span>
                </div>
                <div className="iqm-scene-canvas" ref={containerRef}>
                    <img
                        src={background}
                        alt="Room"
                        className={["iqm-scene-bg", showClean ? "iqm-scene-bg--reveal" : ""].filter(Boolean).join(" ")}
                        draggable={false}
                    />
                    {stage !== "intro" && quest.dirtSpots.map(spot => (
                        <div
                            key={spot.id}
                            className={[
                                "iqm-dirt-spot",
                                quest.background === "spill" ? "iqm-dirt-spot--spill" : "",
                                swept.has(spot.id) ? "iqm-dirt-spot--swept" : "",
                            ].filter(Boolean).join(" ")}
                            style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.w}%`, height: `${spot.h}%` }}
                        />
                    ))}
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress">
                            {quest.dirtSpots.map(spot => (
                                <span key={spot.id} className={`iqm-sweep-pip ${swept.has(spot.id) ? "iqm-sweep-pip--done" : ""}`} />
                            ))}
                        </div>
                    )}
                    {stage !== "intro" && (
                        <div
                            className={[
                                "iqm-scene-broom",
                                isDragging ? "iqm-scene-broom--dragging" : "",
                                stage === "success" ? "iqm-scene-broom--hidden" : "",
                            ].filter(Boolean).join(" ")}
                            style={{
                                left: `${broomPos.x}%`, top: `${broomPos.y}%`,
                                transform: "translate(-50%, -50%)",
                                cursor: stage === "playing" ? (isDragging ? "grabbing" : "grab") : "default",
                            }}
                            onPointerDown={handleBroomPointerDown}
                            onPointerMove={handleBroomPointerMove}
                            onPointerUp={handleBroomPointerUp}
                            onPointerCancel={handleBroomPointerUp}
                        >
                            {broomImg
                                ? <img src={broomImg} alt="Silhig" className="iqm-scene-broom-img" draggable={false} />
                                : <span style={{ fontSize: 40 }}>🧹</span>
                            }
                            {stage === "playing" && !isDragging && (
                                <div className="iqm-drag-indicator">
                                    <span className="iqm-drag-hand">🖐️</span>
                                </div>
                            )}
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

export default SceneDragGame;
