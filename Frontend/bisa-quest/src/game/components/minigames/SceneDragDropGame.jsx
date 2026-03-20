import React, { useState, useRef } from "react";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import { buildQuestDialogue } from "../questHelpers";

const SceneDragDropGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);
    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro");
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const [itemsState, setItemsState] = useState(() => {
        const initialState = {};
        quest.draggableItems.forEach(i => {
            initialState[i.id] = { x: i.startX, y: i.startY, isPlaced: false };
        });
        return initialState;
    });

    const [draggingId, setDraggingId] = useState(null);

    const handlePointerDown = (id, e) => {
        if (stage !== "playing" || itemsState[id].isPlaced) return;
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

    const handlePointerUp = () => {
        if (!draggingId) return;
        const currentItemState = itemsState[draggingId];
        const itemConfig = quest.draggableItems.find(i => i.id === draggingId);
        const targetZone = quest.dropZones.find(z => z.id === itemConfig.correctZone);
        let placed = false;
        if (targetZone) {
            const { x, y } = currentItemState;
            if (x >= targetZone.x && x <= targetZone.x + targetZone.w &&
                y >= targetZone.y && y <= targetZone.y + targetZone.h) {
                placed = true;
            }
        }
        setItemsState(prev => {
            const next = { ...prev, [draggingId]: { ...prev[draggingId], isPlaced: placed } };
            if (Object.values(next).every(s => s.isPlaced) && stage !== "success") setStage("success");
            return next;
        });
        setDraggingId(null);
    };

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(s => s + 1);
        else setStage("playing");
    };

    const placedCount = Object.values(itemsState).filter(s => s.isPlaced).length;

    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Limpyo na! Maayo kaayo! 🎉", englishText: "It's clean! Well done! 🎉" };
        const remaining = Object.values(itemsState).filter(s => !s.isPlaced).length;
        if (remaining > 0) return { bisayaText: `${remaining} libro pa ang nahibilin! Ibutang sa estante!`, englishText: `${remaining} more books left! Put them on the shelf!` };
        return { bisayaText: quest.instructionBisaya, englishText: quest.instructionEnglish };
    })();

    return (
        <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">Organize the Room</span>
                </div>
                <div className="iqm-scene-canvas" ref={containerRef}>
                    <img src={quest.background} alt="Room" className="iqm-scene-bg iqm-scene-bg--reveal" draggable={false} />
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress">
                            {quest.draggableItems.map((_, i) => (
                                <span key={i} className={`iqm-sweep-pip ${i < placedCount ? "iqm-sweep-pip--done" : ""}`} />
                            ))}
                        </div>
                    )}
                    {stage !== "intro" && quest.dropZones.map(zone => (
                        <div key={zone.id} className={`iqm-sdd-zone ${stage === "success" ? "iqm-sdd-zone--success" : ""}`}
                            style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }} />
                    ))}
                    {stage !== "intro" && quest.draggableItems.map(dItem => {
                        const img = ITEM_IMAGE_MAP[dItem.imageKey] || null;
                        const state = itemsState[dItem.id];
                        const isItemDragging = draggingId === dItem.id;
                        return (
                            <div
                                key={dItem.id}
                                className={["iqm-sdd-item", isItemDragging ? "iqm-sdd-item--dragging" : "", state.isPlaced ? "iqm-sdd-item--placed" : ""].filter(Boolean).join(" ")}
                                style={{ left: `${state.x}%`, top: `${state.y}%`, transform: "translate(-50%, -50%)" }}
                                onPointerDown={(e) => handlePointerDown(dItem.id, e)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                            >
                                {img ? <img src={img} alt={dItem.label} className="iqm-sdd-item-img" draggable={false} /> : <span style={{ fontSize: 40 }}>📚</span>}
                            </div>
                        );
                    })}
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

export default SceneDragDropGame;
