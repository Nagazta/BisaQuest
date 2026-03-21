import React, { useState, useRef, useEffect } from "react";
import AssetManifest from "../../../services/AssetManifest";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import { buildQuestDialogue } from "../questHelpers";

const TASKS = [
    {
        id: "firewood",
        mechanic: "drag_to_heat",
        instructionBisaya: "Ibutang ang kahoy sa dapogan para mokusog ang kayo!",
        instructionEnglish: "Put the firewood in the stove to generate more heat!",
        successBisaya: "Nagdilaab na ang kalayo! Maayo!",
        successEnglish: "The fire is burning bright! Great!",
        draggableKey: "kahoy",
        targetZone: { x: 50, y: 40, w: 30, h: 18 }, // Firebox opening
    },
    {
        id: "mix",
        mechanic: "mix",
        instructionBisaya: "Gamita ang sandok para timplahon ang giluto!",
        instructionEnglish: "Use the spoon to mix the ingredients!",
        successBisaya: "Humot na kaayo ang giluto!",
        successEnglish: "The food smells delicious!",
        draggableKey: "sandok",
        targetZone: { x: 50, y: 18, w: 22, h: 16 }, // Inside/Above cauldron
        requiredMixCount: 5
    },
    {
        id: "ingredients",
        mechanic: "add_ingredients",
        instructionBisaya: "Ibutang ang mga sangkap sa kaldero!",
        instructionEnglish: "Put the ingredients in the cauldron!",
        successBisaya: "Andam na ang tanan! Luto na!",
        successEnglish: "Everything is ready! It's cooking!",
        draggableItems: [
            { id: "ing1", imageKey: "carrot", label: "Karot", startX: 8, startY: 35 },
            { id: "ing2", imageKey: "potato", label: "Patatas", startX: 15, startY: 35 },
        ],
        targetZone: { x: 50, y: 22, w: 20, h: 15 }, // Inside cauldron
    }
];

const CookingGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const [task, setTask] = useState(null);
    const [stage, setStage] = useState("intro"); // intro | playing | success
    const [introStep, setIntroStep] = useState(0);
    const dialogue = buildQuestDialogue(quest, item);

    // Randomized task selection
    useEffect(() => {
        const randomTask = TASKS[Math.floor(Math.random() * TASKS.length)];
        setTask(randomTask);
    }, []);

    // Dragging state
    const [draggedId, setDraggedId] = useState(null);
    const [positions, setPositions] = useState({});
    const [placedItems, setPlacedItems] = useState(new Set());
    const [mixCount, setMixCount] = useState(0);
    const [isOverTarget, setIsOverTarget] = useState(false);
    const [showSuccessCard, setShowSuccessCard] = useState(false);
    const [fireLit, setFireLit] = useState(false);

    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Initialize positions based on task
    useEffect(() => {
        if (!task) return;
        if (task.mechanic === "add_ingredients") {
            setPositions(task.draggableItems.reduce((acc, it) => {
                acc[it.id] = { x: it.startX, y: it.startY };
                return acc;
            }, {}));
        } else if (task.mechanic === "drag_to_heat") {
            setPositions({ [task.id]: { x: 50, y: 78 } });
         } else {
            setPositions({ [task.id]: { x: 28, y: 28 } });
        }
    }, [task]);

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(p => p + 1);
        else setStage("playing");
    };

    const handleDown = (id, e) => {
        if (stage !== "playing" || (task.mechanic === "add_ingredients" && placedItems.has(id))) return;
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
        const cx = Math.min(Math.max(x, 5), 95);
        const cy = Math.min(Math.max(y, 5), 95);

        setPositions(prev => ({ ...prev, [id]: { x: cx, y: cy } }));

        // Check overlap
        const inZone =
            cx > task.targetZone.x - task.targetZone.w / 2 &&
            cx < task.targetZone.x + task.targetZone.w / 2 &&
            cy > task.targetZone.y - task.targetZone.y / 2 &&
            cy < task.targetZone.y + task.targetZone.h / 2;

        if (task.mechanic === "mix") {
            if (inZone && !isOverTarget) {
                setIsOverTarget(true);
                setMixCount(p => {
                    const next = p + 1;
                    if (next >= task.requiredMixCount) {
                        setTimeout(() => triggerSuccess(), 400);
                    }
                    return next;
                });
            } else if (!inZone && isOverTarget) {
                setIsOverTarget(false);
            }
        }
    };

    const handleUp = (id, e) => {
        if (draggedId !== id) return;
        setDraggedId(null);
        if (e?.currentTarget && e.pointerId != null) {
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
        }

        const pos = positions[id];
        const inZone =
            pos.x > task.targetZone.x - task.targetZone.w / 2 &&
            pos.x < task.targetZone.x + task.targetZone.w / 2 &&
            pos.y > task.targetZone.y - task.targetZone.y / 2 &&
            pos.y < task.targetZone.y + task.targetZone.h / 2;

        if (task.mechanic === "add_ingredients" || task.mechanic === "drag_to_heat") {
            if (inZone) {
                if (task.mechanic === "add_ingredients") {
                    setPlacedItems(prev => {
                        const next = new Set([...prev, id]);
                        if (next.size >= task.draggableItems.length) {
                            setTimeout(() => triggerSuccess(), 400);
                        }
                        return next;
                    });
                } else {
                    if (task.mechanic === "drag_to_heat") setFireLit(true);
                    setTimeout(() => triggerSuccess(), 400);
                }
            } else {
                // Reset pos
                if (task.mechanic === "add_ingredients") {
                    const orig = task.draggableItems.find(i => i.id === id);
                    setPositions(p => ({ ...p, [id]: { x: orig.startX, y: orig.startY } }));
                } else {
                    setPositions({ [task.id]: { x: task.mechanic === "drag_to_heat" ? 50 : 38, y: task.mechanic === "drag_to_heat" ? 78 : 28 } });
                }
            }
        }
    };

    const triggerSuccess = () => {
        setStage("success");
        setShowSuccessCard(true);
    };

    const getDialogueText = () => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: task.successBisaya, englishText: task.successEnglish };
        return { bisayaText: task.instructionBisaya, englishText: task.instructionEnglish };
    };

    if (!task) return null;

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
                    <img src={fireLit ? AssetManifest.village.scenarios.kitchenStoveFire : AssetManifest.village.scenarios.kitchenStove} alt="Stove" className="iqm-scene-bg" draggable={false} />

                    {/* Target Zone Debug/Hint */}
                    {stage === "playing" && (
                        <div style={{
                            position: "absolute",
                            left: `${task.targetZone.x}%`, top: `${task.targetZone.y}%`,
                            width: `${task.targetZone.w}%`, height: `${task.targetZone.h}%`,
                            transform: "translate(-50%, -50%)",
                            border: "2px dashed rgba(255,255,255,0.4)",
                            borderRadius: "10px", pointerEvents: "none",
                            background: "rgba(255,255,255,0.05)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "24px"
                        }}>
                             {task.mechanic === "drag_to_heat" ? "🔥" : "🍲"}
                        </div>
                    )}

                    {/* Draggable Items */}
                    {(stage === "playing" || stage === "success") && (
                        task.mechanic === "add_ingredients" 
                        ? task.draggableItems.map(it => (
                            <div key={it.id}
                                style={{
                                    position: "absolute",
                                    left: `${positions[it.id]?.x}%`,
                                    top: `${positions[it.id]?.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    width: "140px", height: "140px",
                                    zIndex: draggedId === it.id ? 20 : 10,
                                    opacity: placedItems.has(it.id) ? 0.7 : 1,
                                    cursor: placedItems.has(it.id) ? "default" : "grab"
                                }}
                                onPointerDown={(e) => handleDown(it.id, e)}
                                onPointerMove={(e) => handleMove(it.id, e)}
                                onPointerUp={(e) => handleUp(it.id, e)}
                            >
                                <img src={ITEM_IMAGE_MAP[it.imageKey]} alt={it.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} draggable={false}/>
                                <span style={{ position: "absolute", bottom: "-10px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", background: "rgba(0,0,0,0.5)", color: "white", padding: "2px 5px", borderRadius: "5px", whiteSpace: "nowrap" }}>
                                    {it.label}
                                </span>
                            </div>
                        ))
                        : (
                            <div
                                style={{
                                    position: "absolute",
                                    left: `${positions[task.id]?.x}%`,
                                    top: `${positions[task.id]?.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    width: "185px", height: "185px",
                                    zIndex: 20,
                                    cursor: "grab"
                                }}
                                onPointerDown={(e) => handleDown(task.id, e)}
                                onPointerMove={(e) => handleMove(task.id, e)}
                                onPointerUp={(e) => handleUp(task.id, e)}
                            >
                                <img src={ITEM_IMAGE_MAP[task.draggableKey]} alt={task.id} style={{ width: "100%", height: "100%", objectFit: "contain" }} draggable={false}/>
                                {task.mechanic === "mix" && mixCount > 0 && <span style={{ position: "absolute", top: "30px", left: "50%", transform: "translateX(-50%)", color: "white", textShadow: "1px 1px 2px black", fontSize: "14px" }}>Stirring...</span>}
                            </div>
                        )
                    )}

                    {/* Progress Pips for Mix */}
                    {task.mechanic === "mix" && stage === "playing" && (
                        <div className="iqm-sweep-progress" style={{ top: "10%" }}>
                            {Array.from({ length: task.requiredMixCount }).map((_, i) => (
                                <div key={i} className={`iqm-sweep-pip ${mixCount > i ? "iqm-sweep-pip--done" : ""}`} />
                            ))}
                        </div>
                    )}

                    {/* Success Overlay */}
                    {stage === "success" && showSuccessCard && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🍲✨</div>
                                <div className="iqm-scene-success-text">Humot na kaayo!</div>
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

export default CookingGame;
