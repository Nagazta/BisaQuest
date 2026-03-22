import React, { useState, useRef, useEffect } from "react";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import AssetManifest from "../../../services/AssetManifest";
import { buildQuestDialogue } from "../questHelpers";

const HammerPuff = ({ x, y, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 400);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div style={{
            position: "absolute",
            left: `${x}%`, top: `${y}%`,
            width: "50px", height: "50px",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 15
        }}>
            <div style={{
                width: "100%", height: "100%",
                border: "4px solid #fcd765",
                borderRadius: "50%",
                animation: "hammerShock 0.4s ease-out forwards",
            }} />
            <style>{`
                @keyframes hammerShock {
                    0% { transform: scale(0.5); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

const SofaRepairGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro");
    
    // spotState: id -> { wood: bool, nail: bool, health: int }
    const [spotState, setSpotState] = useState({});
    
    const [toolPos, setToolPos] = useState({ x: 15, y: 70 });
    const [dragType, setDragType] = useState(null); // "wood" or "nail"
    const [hammerPos, setHammerPos] = useState({ x: 20, y: 50 });
    const [isHammering, setIsHammering] = useState(false);
    const [shocks, setShocks] = useState([]);
    const [isFixed, setIsFixed] = useState(false);

    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const hammerImg = ITEM_IMAGE_MAP.hammer;
    const nailImg = ITEM_IMAGE_MAP.nail;
    const woodImg = ITEM_IMAGE_MAP.kahoy;

    const spots = quest.repairStage.repairSpots;

    const handleDragStart = (type, e) => {
        if (stage !== "playing") return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };
        setDragType(type);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (stage !== "playing") return;
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        if (dragType) {
            setToolPos({ x, y });
        } else {
            setHammerPos({ x, y });
        }
    };

    const handlePointerUp = (e) => {
        if (!dragType) return;
        
        // Find target spot
        const spot = spots.find(s => {
            const dist = Math.sqrt(Math.pow(toolPos.x - s.x, 2) + Math.pow(toolPos.y - s.y, 2));
            return dist < 10;
        });

        if (spot) {
            const current = spotState[spot.id] || { wood: false, nail: false, health: 3 };
            
            if (dragType === "wood" && !current.wood) {
                setSpotState(prev => ({ ...prev, [spot.id]: { ...current, wood: true } }));
            } else if (dragType === "nail" && current.wood && !current.nail) {
                setSpotState(prev => ({ ...prev, [spot.id]: { ...current, nail: true } }));
            }
        }
        
        setDragType(null);
        setToolPos({ x: 15, y: 70 });
    };

    const handleHammerClick = (e) => {
        if (stage !== "playing" || dragType) return;
        
        const hitSpot = spots.find(s => {
            const st = spotState[s.id];
            if (!st || !st.nail || st.health <= 0) return false;
            const dist = Math.sqrt(Math.pow(hammerPos.x - s.x, 2) + Math.pow(hammerPos.y - s.y, 2));
            return dist < 8;
        });

        setIsHammering(true);
        setTimeout(() => setIsHammering(false), 200);

        if (hitSpot) {
            const st = spotState[hitSpot.id];
            const newH = st.health - 1;
            const newStates = { ...spotState, [hitSpot.id]: { ...st, health: newH } };
            setSpotState(newStates);
            
            setShocks(prev => [...prev, { id: Date.now(), x: hitSpot.x, y: hitSpot.y }]);

            // Check if all fixed
            const fixedCount = Object.values(newStates).filter(s => s.health === 0).length;
            if (fixedCount === spots.length) {
                setTimeout(() => {
                    setIsFixed(true);
                    setStage("success");
                }, 600);
            }
        }
    };

    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return {
            bisayaText: quest.repairStage.successBisaya,
            englishText: quest.repairStage.successEnglish
        };
        
        const woodCount = Object.values(spotState).filter(s => s.wood).length;
        if (woodCount < spots.length) return {
            bisayaText: `Ibutang ang ${spots.length - woodCount} pa ka kahoy!`,
            englishText: `Place ${spots.length - woodCount} more wood planks!`
        };
        
        const nailCount = Object.values(spotState).filter(s => s.nail).length;
        if (nailCount < spots.length) return {
            bisayaText: `Ibutang ang mga lansang sa kahoy!`,
            englishText: `Place the nails on the wood!`
        };

        return {
            bisayaText: `I-martelyo ang mga lansang aron maayo ang sopa!`,
            englishText: `Hammer the nails to fix the sofa!`
        };
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
                    <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">Pag-ayo sa Sopa</span>
                </div>
                <div 
                    className="iqm-scene-canvas" 
                    ref={containerRef}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onClick={handleHammerClick}
                    style={{ cursor: "none" }}
                >
                    {/* Backgrounds */}
                    <img 
                        src={AssetManifest.village.scenarios.houseSofaGuba} 
                        alt="Damaged Sofa" 
                        className="iqm-scene-bg" 
                        style={{ opacity: isFixed ? 0 : 1 }}
                        draggable={false} 
                    />
                    <img 
                        src={AssetManifest.village.scenarios.houseSofaFix} 
                        alt="Fixed Sofa" 
                        className="iqm-scene-bg" 
                        style={{ opacity: isFixed ? 1 : 0 }}
                        draggable={false} 
                    />

                    {/* Repair Zones */}
                    {stage !== "intro" && spots.map(spot => {
                        const st = spotState[spot.id] || { wood: false, nail: false, health: 3 };
                        return (
                            <div key={spot.id} style={{
                                position: "absolute",
                                left: `${spot.x}%`, top: `${spot.y}%`,
                                width: "60px", height: "60px",
                                transform: "translate(-50%, -50%)",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                {!st.wood && !isFixed && (
                                    <div style={{
                                        width: "40px", height: "20px",
                                        border: "2px dashed #fcd765",
                                        borderRadius: "4px",
                                        opacity: 0.5
                                    }} />
                                )}
                                {st.wood && (
                                    <img 
                                        src={woodImg} 
                                        alt="Wood" 
                                        style={{ 
                                            width: 60, 
                                            opacity: isFixed ? 0.7 : 1,
                                            transform: "rotate(5deg)"
                                        }} 
                                    />
                                )}
                                {st.nail && (
                                    <img 
                                        src={nailImg} 
                                        alt="Nail" 
                                        style={{ 
                                            position: "absolute",
                                            width: 30, 
                                            transform: `translateY(${(3 - st.health) * 4}px)`,
                                            zIndex: 5
                                        }} 
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Supplies (Wood and Nail) */}
                    {stage === "playing" && !dragType && (
                        <>
                            {/* Wood Supply */}
                            <div 
                                style={{
                                    position: "absolute",
                                    left: "15%", top: "85%",
                                    transform: "translate(-50%, -50%)",
                                    cursor: "grab",
                                    zIndex: 12
                                }}
                                onPointerDown={(e) => handleDragStart("wood", e)}
                            >
                                <img src={woodImg} alt="Wood Supply" style={{ width: 70 }} />
                                <div className="iqm-drag-indicator"><span className="iqm-drag-hand">🖐️</span></div>
                            </div>
                            {/* Nail Supply - only show after all wood is placed */}
                            {Object.values(spotState).filter(s => s.wood).length === spots.length && (
                                <div 
                                    style={{
                                        position: "absolute",
                                        left: "85%", top: "85%",
                                        transform: "translate(-50%, -50%)",
                                        cursor: "grab",
                                        zIndex: 12
                                    }}
                                    onPointerDown={(e) => handleDragStart("nail", e)}
                                >
                                    <img src={nailImg} alt="Nail Supply" style={{ width: 50 }} />
                                    <div className="iqm-drag-indicator"><span className="iqm-drag-hand">🖐️</span></div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Dragging Item */}
                    {dragType && (
                        <img 
                            src={dragType === "wood" ? woodImg : nailImg} 
                            alt="Dragging Item" 
                            style={{ 
                                position: "absolute",
                                left: `${toolPos.x}%`, top: `${toolPos.y}%`,
                                width: dragType === "wood" ? 60 : 40,
                                transform: "translate(-50%, -50%)",
                                pointerEvents: "none",
                                zIndex: 20
                            }} 
                        />
                    )}

                    {/* Hammer Tool */}
                    {stage === "playing" && !dragType && (
                        <img 
                            src={hammerImg} 
                            alt="Hammer" 
                            style={{
                                position: "absolute",
                                left: `${hammerPos.x}%`, top: `${hammerPos.y}%`,
                                width: 80,
                                transform: `translate(-20%, -80%) ${isHammering ? "rotate(-30deg)" : "rotate(0deg)"}`,
                                transition: "transform 0.1s",
                                pointerEvents: "none",
                                zIndex: 30
                            }}
                        />
                    )}

                    {/* Effects */}
                    {shocks.map(s => (
                        <HammerPuff key={s.id} x={s.x} y={s.y} onComplete={() => setShocks(prev => prev.filter(sh => sh.id !== s.id))} />
                    ))}
                </div>

                {/* Dialogue */}
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

export default SofaRepairGame;
