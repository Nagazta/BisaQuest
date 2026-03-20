import React, { useState, useRef } from "react";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import { buildQuestDialogue } from "../questHelpers";

const PackBagGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);
    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro");
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const [itemsState, setItemsState] = useState(() => {
        const initialState = {};
        quest.draggableItems.forEach(i => {
            initialState[i.id] = { x: i.startX, y: i.startY, isPacked: false };
        });
        return initialState;
    });

    const [draggingId, setDraggingId] = useState(null);

    const handlePointerDown = (id, e) => {
        if (stage !== "playing" || itemsState[id].isPacked) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };
        setDraggingId(id);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!draggingId || stage !== "playing") return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
        setItemsState(prev => ({
            ...prev,
            [draggingId]: { ...prev[draggingId], x: Math.min(Math.max(x, 2), 98), y: Math.min(Math.max(y, 2), 98) },
        }));
    };

    const handlePointerUp = (e) => {
        if (!draggingId) return;
        const { x, y } = itemsState[draggingId];
        const zone = quest.bagZone;
        const packed = x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h;
        if (e && e.currentTarget && e.pointerId) e.currentTarget.releasePointerCapture(e.pointerId);
        setItemsState(prev => {
            const next = { ...prev, [draggingId]: { ...prev[draggingId], isPacked: packed } };
            if (Object.values(next).every(s => s.isPacked) && stage !== "success") setStage("success");
            return next;
        });
        setDraggingId(null);
    };

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(s => s + 1);
        else setStage("playing");
    };

    const packedCount = Object.values(itemsState).filter(s => s.isPacked).length;

    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Nakahipos Na! Maayo kaayo! 🎉", englishText: "Packed! Well done! 🎉" };
        const remaining = Object.values(itemsState).filter(s => !s.isPacked).length;
        if (remaining > 0) return { bisayaText: `${remaining} ka butang pa ang nahibilin! Ibutang sa bag!`, englishText: `${remaining} more items left! Put them in the bag!` };
        return { bisayaText: quest.instructionBisaya, englishText: quest.instructionEnglish };
    })();

    return (
        <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">Pack the Bag</span>
                </div>
                <div className="iqm-scene-canvas" ref={containerRef}>
                    <img src={quest.bagImage} alt="Bag Background" className="iqm-scene-bg iqm-scene-bg--reveal" style={{ objectFit: "contain" }} draggable={false} />
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress">
                            {quest.draggableItems.map((_, i) => (
                                <span key={i} className={`iqm-sweep-pip ${i < packedCount ? "iqm-sweep-pip--done" : ""}`} />
                            ))}
                        </div>
                    )}
                    {stage !== "intro" && quest.draggableItems.map(dItem => {
                        const img = ITEM_IMAGE_MAP[dItem.imageKey] || null;
                        const state = itemsState[dItem.id];
                        const isItemDragging = draggingId === dItem.id;
                        if (state.isPacked) return null;
                        return (
                            <div
                                key={dItem.id}
                                className={["iqm-sdd-item", isItemDragging ? "iqm-sdd-item--dragging" : ""].filter(Boolean).join(" ")}
                                style={{ left: `${state.x}%`, top: `${state.y}%`, transform: "translate(-50%, -50%)", width: "12%", height: "12%", zIndex: isItemDragging ? 20 : 10, cursor: isItemDragging ? "grabbing" : "grab" }}
                                onPointerDown={(e) => handlePointerDown(dItem.id, e)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                            >
                                {img
                                    ? <img src={img} alt={dItem.id} style={{ width: "100%", height: "100%", objectFit: "contain", filter: isItemDragging ? "drop-shadow(2px 10px 15px rgba(0,0,0,0.5))" : "drop-shadow(2px 4px 5px rgba(0,0,0,0.4))" }} draggable={false} />
                                    : <span style={{ fontSize: 40 }}>📦</span>
                                }
                            </div>
                        );
                    })}
                    {stage === "success" && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🎊✨</div>
                                <div className="iqm-scene-success-text">Nakahipos Na!</div>
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

export default PackBagGame;
