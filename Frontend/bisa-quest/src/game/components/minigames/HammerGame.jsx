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

const HammerGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro");
    const [nailHealth, setNailHealth] = useState({}); // nailId -> hits (3 to 0)
    const [nailsPlaced, setNailsPlaced] = useState(new Set()); // IDs of nails placed
    const [toolPos, setToolPos] = useState({ x: 15, y: 70 });
    const [isDraggingNail, setIsDraggingNail] = useState(false);
    const [draggingNailId, setDraggingNailId] = useState(null);
    const [hammerPos, setHammerPos] = useState({ x: 20, y: 50 });
    const [isHammering, setIsHammering] = useState(false);
    const [shocks, setShocks] = useState([]);
    const [isFixed, setIsFixed] = useState(false);

    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const hammerImg = ITEM_IMAGE_MAP.hammer;
    const nailImg = ITEM_IMAGE_MAP.nail;

    const spots = quest.repairStage.repairSpots;

    const handleNailPointerDown = (nailId, e) => {
        if (stage !== "playing" || nailsPlaced.has(nailId)) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };
        setIsDraggingNail(true);
        setDraggingNailId(nailId);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (stage !== "playing") return;
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        if (isDraggingNail) {
            setToolPos({ x, y });
        } else {
            setHammerPos({ x, y });
        }
    };

    const handleNailPointerUp = (e) => {
        if (!isDraggingNail) return;
        setIsDraggingNail(false);

        // Check for drop on spot
        const spot = spots.find(s => {
            if (nailsPlaced.has(s.id)) return false;
            const dist = Math.sqrt(Math.pow(toolPos.x - s.x, 2) + Math.pow(toolPos.y - s.y, 2));
            return dist < 8; // Drop threshold
        });

        if (spot) {
            setNailsPlaced(prev => new Set([...prev, spot.id]));
            setNailHealth(prev => ({ ...prev, [spot.id]: 3 }));
        }
        
        // Reset supply pos
        setToolPos({ x: 15, y: 70 });
        setDraggingNailId(null);
    };

    const handleHammerClick = (e) => {
        if (stage !== "playing" || isDraggingNail) return;
        
        // Check for hit on placed nails
        const hitNail = spots.find(s => {
            if (!nailsPlaced.has(s.id) || (nailHealth[s.id] || 0) <= 0) return false;
            const dist = Math.sqrt(Math.pow(hammerPos.x - s.x, 2) + Math.pow(hammerPos.y - s.y, 2));
            return dist < 8;
        });

        setIsHammering(true);
        setTimeout(() => setIsHammering(false), 200);

        if (hitNail) {
            const newH = (nailHealth[hitNail.id] || 0) - 1;
            setNailHealth(prev => ({ ...prev, [hitNail.id]: newH }));
            
            // Effect
            setShocks(prev => [...prev, { id: Date.now(), x: hitNail.x, y: hitNail.y }]);

            // Check if all fixed
            const fixedCount = Object.values({ ...nailHealth, [hitNail.id]: newH }).filter(h => h === 0).length;
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
        const placedCount = nailsPlaced.size;
        const fixedCount = Object.values(nailHealth).filter(h => h === 0).length;
        if (placedCount < spots.length) return {
            bisayaText: `Ibutang ang ${spots.length - placedCount} pa ka lansang!`,
            englishText: `Place ${spots.length - placedCount} more nails!`
        };
        return {
            bisayaText: `I-martelyo ang mga lansang!`,
            englishText: `Hammer the nails into place!`
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
                    <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">Pag-ayo sa Atop</span>
                </div>
                <div 
                    className="iqm-scene-canvas" 
                    ref={containerRef}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handleNailPointerUp}
                    onClick={handleHammerClick}
                    style={{ cursor: "none" }}
                >
                    {/* Backgrounds */}
                    <img 
                        src={AssetManifest.village.scenarios.houseCeiling} 
                        alt="Damaged Ceiling" 
                        className="iqm-scene-bg" 
                        style={{ opacity: isFixed ? 0 : 1 }}
                        draggable={false} 
                    />
                    <img 
                        src={AssetManifest.village.scenarios.houseCeilingFix} 
                        alt="Fixed Ceiling" 
                        className="iqm-scene-bg" 
                        style={{ opacity: isFixed ? 1 : 0 }}
                        draggable={false} 
                    />

                    {/* Leak Spots / Repair Zones */}
                    {stage !== "intro" && spots.map(spot => {
                        const isPlaced = nailsPlaced.has(spot.id);
                        const health = nailHealth[spot.id] ?? 3;
                        return (
                            <div key={spot.id} style={{
                                position: "absolute",
                                left: `${spot.x}%`, top: `${spot.y}%`,
                                width: "40px", height: "40px",
                                transform: "translate(-50%, -50%)",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                {/* Target hint if not placed */}
                                {!isPlaced && !isFixed && (
                                    <div style={{
                                        width: "20px", height: "20px",
                                        border: "2px dashed #fcd765",
                                        borderRadius: "50%",
                                        opacity: 0.6
                                    }} />
                                )}
                                {/* The Nail */}
                                {isPlaced && (
                                    <img 
                                        src={nailImg} 
                                        alt="Nail" 
                                        style={{ 
                                            width: 40, 
                                            transform: `translateY(${(3 - health) * 5}px) scale(${0.7 + (health * 0.1)})`,
                                            opacity: isFixed ? 0.8 : 1,
                                            filter: health === 0 ? "brightness(0.7)" : "none"
                                        }} 
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Nail Supply */}
                    {stage === "playing" && nailsPlaced.size < spots.length && !isDraggingNail && (
                        <div 
                            style={{
                                position: "absolute",
                                left: "10%", top: "85%",
                                transform: "translate(-50%, -50%)",
                                cursor: "grab",
                                zIndex: 12
                            }}
                            onPointerDown={(e) => handleNailPointerDown("supply", e)}
                        >
                            <img src={nailImg} alt="Supply Nail" style={{ width: 60 }} />
                            <div className="iqm-drag-indicator"><span className="iqm-drag-hand">🖐️</span></div>
                        </div>
                    )}

                    {/* Floating Nail while dragging */}
                    {isDraggingNail && (
                        <img 
                            src={nailImg} 
                            alt="Dragging Nail" 
                            style={{ 
                                position: "absolute",
                                left: `${toolPos.x}%`, top: `${toolPos.y}%`,
                                width: 50,
                                transform: "translate(-50%, -50%)",
                                pointerEvents: "none",
                                zIndex: 20
                            }} 
                        />
                    )}

                    {/* Hammer Tool (Custom Cursor) */}
                    {stage === "playing" && !isDraggingNail && (
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

                    {/* Shock Effects */}
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

export default HammerGame;
