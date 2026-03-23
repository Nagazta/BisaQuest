import React, { useState, useRef } from "react";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import AssetManifest from "../../../services/AssetManifest";
import { buildQuestDialogue } from "../questHelpers";

const WashAndMopGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | wash | mop | success
    const [mopWashPos, setMopWashPos] = useState({ x: quest.washStage.mopStartX, y: quest.washStage.mopStartY });
    const [washCount, setWashCount] = useState(0);
    const [isInBasin, setIsInBasin] = useState(false);
    const [swept, setSwept] = useState(new Set());
    const [mopFloorPos, setMopFloorPos] = useState({ x: 20, y: 55 });
    const [showClean, setShowClean] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const basinImg = AssetManifest.village.items[quest.washStage.basinImage];
    const toolKey = quest.washStage.toolKey || "mop";
    const mopImg = ITEM_IMAGE_MAP[toolKey] || ITEM_IMAGE_MAP["mop"] || null;
    const toolName = toolKey === "rag" ? "trapo" : (toolKey === "alfombra" ? "banig" : "mop");


    const handlePointerDown = (e) => {
        if (stage !== "wash" && stage !== "mop") return;
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
        if (!isDragging) return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;

        if (stage === "wash") {
            const cx = Math.min(Math.max(x, 5), 95);
            const cy = Math.min(Math.max(y, 5), 95);
            setMopWashPos({ x: cx, y: cy });
            const overlapping = cx > 30 && cx < 70 && cy > 30 && cy < 70;
            if (overlapping && !isInBasin) {
                setIsInBasin(true);
                setWashCount(prev => {
                    const next = prev + 1;
                    if (next >= 3) {
                        setTimeout(() => { 
                            setIsDragging(false); 
                            if (quest.washStage.washOnly) {
                                setShowClean(true);
                                setStage("success");
                            } else {
                                setStage("mop");
                            }
                        }, 200);
                    }
                    return next;
                });
            } else if (!overlapping && isInBasin) {
                setIsInBasin(false);
            }
        } else if (stage === "mop") {
            const cx = Math.min(Math.max(x, 5), 90);
            const cy = Math.min(Math.max(y, 5), 85);
            setMopFloorPos({ x: cx, y: cy });
            quest.mopStage.dirtSpots.forEach(spot => {
                if (swept.has(spot.id)) return;
                const overlap =
                    cx + 4 > spot.x && cx - 4 < spot.x + spot.w &&
                    cy + 4 > spot.y && cy - 4 < spot.y + spot.h;
                if (overlap) {
                    setSwept(prev => {
                        const next = new Set([...prev, spot.id]);
                        if (next.size >= quest.mopStage.dirtSpots.length) {
                            setTimeout(() => { setShowClean(true); setStage("success"); }, 300);
                        }
                        return next;
                    });
                }
            });
        }
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        if (e && e.currentTarget && e.pointerId) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(prev => prev + 1);
        else setStage("wash");
    };

    const dialogueText = stage === "success"
        ? { 
            bisayaText: `Limpyo na ang ${toolName}! Maayo kaayo!`, 
            englishText: `The ${toolKey === "alfombra" ? "rug" : toolKey} is clean! Well done!` 
          }
        : stage === "wash"
            ? { bisayaText: `Hugasi ang ${toolName} sa planggana! (${washCount}/3)`, englishText: `Wash the ${toolKey} in the basin! (${washCount}/3)` }
            : dialogue[introStep];

    const bgImage = (stage === "intro" || stage === "wash") ? basinImg : AssetManifest.village.scenarios.house;

    return (
        <div className="iqm-overlay">
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <div className="iqm-header-bisaya">{item.labelBisaya}</div>
                    <div className="iqm-header-english">{item.labelEnglish}</div>
                </div>
                <div className="iqm-scene-canvas" ref={containerRef}>
                    <img
                        src={bgImage}
                        alt="Background"
                        className={`iqm-scene-bg ${showClean ? "iqm-scene-bg--reveal" : ""}`}
                        draggable={false}
                        style={{ objectFit: (stage === "intro" || stage === "wash") ? "contain" : "cover" }}
                    />
                    {stage === "wash" && (
                        <>
                            <div
                                className={`iqm-scene-broom ${isDragging ? "iqm-scene-broom--dragging" : ""}`}
                                style={{
                                    left: `${mopWashPos.x}%`, top: `${mopWashPos.y}%`,
                                    transform: "translate(-50%, -50%) scale(1.5)",
                                    cursor: isDragging ? "grabbing" : "grab",
                                }}
                                onPointerDown={(e) => handlePointerDown(e, "wash")}
                                onPointerMove={(e) => handlePointerMove(e, "wash")}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                            >
                                {mopImg && <img src={mopImg} alt={toolKey} className="iqm-scene-broom-img" style={{ width: toolKey === "rag" ? 120 : 180, height: toolKey === "rag" ? 120 : 180 }} draggable={false} />}
                                {!isDragging && (
                                    <div className="iqm-drag-indicator" style={{ left: "50%" }}>
                                        <div className="iqm-drag-hand">🖐️</div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {stage === "mop" && !showClean && (
                        <>
                            {quest.mopStage.dirtSpots.map(spot => (
                                <div
                                    key={spot.id}
                                    className={`iqm-dirt-spot iqm-dirt-spot--spill ${swept.has(spot.id) ? "iqm-dirt-spot--swept" : ""}`}
                                    style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.w}%`, height: `${spot.h}%` }}
                                />
                            ))}
                            <div className="iqm-sweep-progress">
                                {quest.mopStage.dirtSpots.map((spot, i) => (
                                    <div key={i} className={`iqm-sweep-pip ${swept.has(spot.id) ? "iqm-sweep-pip--done" : ""}`} />
                                ))}
                            </div>
                            <div
                                className={`iqm-scene-broom ${isDragging ? "iqm-scene-broom--dragging" : ""}`}
                                style={{
                                    left: `${mopFloorPos.x}%`, top: `${mopFloorPos.y}%`,
                                    transform: "translate(-20%, -80%)",
                                    cursor: isDragging ? "grabbing" : "grab",
                                }}
                                onPointerDown={(e) => handlePointerDown(e, "mop")}
                                onPointerMove={(e) => handlePointerMove(e, "mop")}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                            >
                                {(() => {
                                    let size = 180;
                                    if (toolKey === "rag") size = 180;
                                    if (toolKey === "mop") size = 270; // 👈 mop bigger

                                    return mopImg && (
                                        <img 
                                            src={mopImg} 
                                            alt={toolKey} 
                                            className="iqm-scene-broom-img" 
                                            style={{ width: size, height: size }} 
                                            draggable={false} 
                                        />
                                    );
                                })()}

                                {!isDragging && swept.size === 0 && (
                                    <div className="iqm-drag-indicator" style={{ left: "50%" }}>
                                        <div className="iqm-drag-hand">🖐️</div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {stage === "success" && showClean && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">🪣🏆🪣</div>
                                <div className="iqm-scene-success-text">Sinaw na!</div>
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

export default WashAndMopGame;
