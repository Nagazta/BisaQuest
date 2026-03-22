import React, { useState, useRef } from "react";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import AssetManifest from "../../../services/AssetManifest";
import { buildQuestDialogue } from "../questHelpers";

const MultiWashGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | washing | success
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [washCount, setWashCount] = useState(0);
    const [isInBasin, setIsInBasin] = useState(false);
    const [pos, setPos] = useState({ x: 20, y: 40 });
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const basinImg = AssetManifest.village.items[quest.basinImage || "plangganaWater"];
    const washItems = quest.washItems || ["alfombra", "rag", "dust_feather"];
    
    const currentToolKey = washItems[currentItemIndex];
    const currentToolImg = ITEM_IMAGE_MAP[currentToolKey] || null;
    
    const toolNames = {
        alfombra: { bi: "banig", en: "rug" },
        rag: { bi: "trapo", en: "rag" },
        dust_feather: { bi: "paspas", en: "dust feather" }
    };

    const currentToolName = toolNames[currentToolKey] || { bi: currentToolKey, en: currentToolKey };

    const handlePointerDown = (e) => {
        if (stage !== "washing") return;
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

        const cx = Math.min(Math.max(x, 5), 95);
        const cy = Math.min(Math.max(y, 5), 95);
        setPos({ x: cx, y: cy });

        // Basin overlap detection (center 40-60%)
        const overlapping = cx > 35 && cx < 65 && cy > 40 && cy < 80;
        if (overlapping && !isInBasin) {
            setIsInBasin(true);
            setWashCount(prev => {
                const next = prev + 1;
                if (next >= 3) {
                    setIsDragging(false);
                    if (currentItemIndex < washItems.length - 1) {
                        // Next item
                        setTimeout(() => {
                            setCurrentItemIndex(prevIdx => prevIdx + 1);
                            setWashCount(0);
                            setPos({ x: 20, y: 40 });
                        }, 500);
                    } else {
                        // All done
                        setTimeout(() => setStage("success"), 500);
                    }
                }
                return next;
            });
        } else if (!overlapping && isInBasin) {
            setIsInBasin(false);
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
        else setStage("washing");
    };

    const dialogueText = stage === "success"
        ? { bisayaText: "Nahugasan na ang tanang gamit! Maayo kaayo!", englishText: "All items are washed! Well done!" }
        : stage === "washing"
            ? { 
                bisayaText: `Hugasi ang ${currentToolName.bi}! (${washCount}/3)`, 
                englishText: `Wash the ${currentToolName.en}! (${washCount}/3)` 
              }
            : dialogue[introStep];

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
                        src={basinImg}
                        alt="Basin"
                        className="iqm-scene-bg"
                        draggable={false}
                        style={{ objectFit: "contain" }}
                    />
                    
                    {stage === "washing" && (
                        <>
                            <div
                                style={{
                                    position: "absolute",
                                    left: `${pos.x}%`, top: `${pos.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    cursor: isDragging ? "grabbing" : "grab",
                                    zIndex: 15,
                                    transition: isDragging ? "none" : "all 0.3s ease"
                                }}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                            >
                                {currentToolImg && (
                                    <img 
                                        src={currentToolImg} 
                                        alt={currentToolKey} 
                                        style={{ 
                                            width: currentToolKey === "alfombra" ? 140 : 100,
                                            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                                        }} 
                                        draggable={false} 
                                    />
                                )}
                                {!isDragging && (
                                    <div className="iqm-drag-indicator" style={{ left: "50%" }}>
                                        <div className="iqm-drag-hand">🖐️</div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Progress Indicator for current item */}
                            <div className="iqm-multi-progress" style={{
                                position: "absolute",
                                bottom: "20px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                display: "flex",
                                gap: "10px",
                                background: "rgba(0,0,0,0.5)",
                                padding: "10px 20px",
                                borderRadius: "20px"
                            }}>
                                {washItems.map((_, i) => (
                                    <div 
                                        key={i} 
                                        style={{
                                            width: "12px", height: "12px",
                                            borderRadius: "50%",
                                            background: i < currentItemIndex ? "#4CAF50" : (i === currentItemIndex ? "#FFC107" : "#555"),
                                            border: i === currentItemIndex ? "2px solid white" : "none"
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {stage === "success" && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🧺✨</div>
                                <div className="iqm-scene-success-text">Limpyo Na!</div>
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

export default MultiWashGame;
