// ─────────────────────────────────────────────────────────────────────────────
//  DragToZoneGame.jsx — Generic "drag N items into a target zone" mini-game
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef } from "react";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import AssetManifest from "../../../services/AssetManifest";
import { buildQuestDialogue } from "../questHelpers";

const DragToZoneGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);
    const { draggableItems = [], dropZone = {}, background } = quest;

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success

    const [positions, setPositions] = useState(
        draggableItems.reduce((acc, di) => {
            acc[di.id] = { x: di.startX, y: di.startY };
            return acc;
        }, {})
    );
    const [placedItems, setPlacedItems] = useState(new Set());
    const [draggedId, setDraggedId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const bgImage = background || AssetManifest.village.scenarios.house;

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(p => p + 1);
        else setStage("playing");
    };

    const handlePointerDown = (id, e) => {
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

    const handlePointerMove = (id, e) => {
        if (draggedId !== id) return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const r = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - r.left) / r.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - r.top) / r.height) * 100;
        setPositions(prev => ({
            ...prev,
            [id]: { x: Math.min(Math.max(x, 3), 97), y: Math.min(Math.max(y, 3), 97) },
        }));
    };

    const handlePointerUp = (id, e) => {
        if (draggedId !== id) return;
        setDraggedId(null);
        if (e?.currentTarget && e.pointerId != null) {
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
        }

        const pos = positions[id];
        const inZone =
            pos.x > dropZone.x &&
            pos.x < dropZone.x + dropZone.w &&
            pos.y > dropZone.y &&
            pos.y < dropZone.y + dropZone.h;

        if (inZone) {
            setPlacedItems(prev => {
                const next = new Set([...prev, id]);
                if (next.size >= draggableItems.length) {
                    setTimeout(() => { setStage("success"); setShowSuccess(true); }, 400);
                }
                return next;
            });
        } else {
            const orig = draggableItems.find(d => d.id === id);
            if (orig) setPositions(prev => ({ ...prev, [id]: { x: orig.startX, y: orig.startY } }));
        }
    };

    const getDialogueText = () => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return {
            bisayaText: quest.successBisaya || "Maayo kaayo! Nahuman na! 🎉",
            englishText: quest.successEnglish || "Great job! All done! 🎉",
        };
        return {
            bisayaText: `${quest.instructionBisaya} (${placedItems.size}/${draggableItems.length})`,
            englishText: `${quest.instructionEnglish} (${placedItems.size}/${draggableItems.length})`,
        };
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

                <div className="iqm-scene-canvas" ref={containerRef}>
                    <img src={bgImage} alt="Background" className="iqm-scene-bg" draggable={false}
                        style={{ objectFit: "cover" }} />

                    {/* Drop zone indicator */}
                    {stage === "playing" && (
                        <div style={{
                            position: "absolute",
                            left: `${dropZone.x}%`, top: `${dropZone.y}%`,
                            width: `${dropZone.w}%`, height: `${dropZone.h}%`,
                            border: "3px dashed rgba(255,255,255,0.5)",
                            borderRadius: "14px",
                            backgroundColor: "rgba(255,255,255,0.08)",
                            pointerEvents: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexDirection: "column", gap: "2px",
                            color: "rgba(255,255,255,0.5)", fontSize: "12px",
                        }}>
                            <span style={{ fontSize: "22px" }}>{dropZone.emoji || "📦"}</span>
                            <span>{dropZone.label || "Ibutang Diri"}</span>
                        </div>
                    )}

                    {/* Draggable items */}
                    {(stage === "playing" || stage === "success") && draggableItems.map(di => {
                        const pos = positions[di.id];
                        const isPlaced = placedItems.has(di.id);
                        const isActive = draggedId === di.id;
                        const img = ITEM_IMAGE_MAP[di.imageKey] || null;

                        return (
                            <div key={di.id}
                                className={`iqm-scene-broom ${isActive ? "iqm-scene-broom--dragging" : ""}`}
                                style={{
                                    left: `${pos.x}%`, top: `${pos.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    cursor: isPlaced ? "default" : (isActive ? "grabbing" : "grab"),
                                    width: "75px", height: "75px",
                                    zIndex: isActive ? 20 : (isPlaced ? 5 : 10),
                                    transition: isActive ? "none" : "left 0.3s, top 0.3s",
                                }}
                                onPointerDown={e => handlePointerDown(di.id, e)}
                                onPointerMove={e => handlePointerMove(di.id, e)}
                                onPointerUp={e => handlePointerUp(di.id, e)}
                                onPointerCancel={e => handlePointerUp(di.id, e)}
                            >
                                {img
                                    ? <img src={img} alt={di.label} style={{
                                        width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px",
                                    }} draggable={false} />
                                    : <span style={{ fontSize: "36px" }}>{di.emoji || "🖼️"}</span>
                                }
                                <span style={{
                                    position: "absolute", bottom: "-2px", left: "50%",
                                    transform: "translateX(-50%)",
                                    fontSize: "9px", color: "#fff",
                                    background: isPlaced ? "rgba(76,175,80,0.75)" : "rgba(0,0,0,0.55)",
                                    padding: "1px 5px", borderRadius: "4px", whiteSpace: "nowrap",
                                }}>{isPlaced ? "✓ " : ""}{di.label}</span>
                            </div>
                        );
                    })}

                    {/* Progress pips */}
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress" style={{ top: "8%", bottom: "auto" }}>
                            {draggableItems.map(di => (
                                <div key={di.id} className={`iqm-sweep-pip ${placedItems.has(di.id) ? "iqm-sweep-pip--done" : ""}`} />
                            ))}
                        </div>
                    )}

                    {/* Success overlay */}
                    {stage === "success" && showSuccess && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🎊✨</div>
                                <div className="iqm-scene-success-text">{quest.successText || "Maayo kay ka!"}</div>
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

export default DragToZoneGame;
