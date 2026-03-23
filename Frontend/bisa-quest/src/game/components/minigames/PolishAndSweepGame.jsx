import React, { useState, useRef } from "react";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import AssetManifest from "../../../services/AssetManifest";
import { buildQuestDialogue } from "../questHelpers";

const PolishAndSweepGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | polish | sweep | success
    const [polishSpots, setPolishSpots] = useState([
        { id: 1, x: 30, y: 75, polished: false },
        { id: 2, x: 45, y: 82, polished: false },
        { id: 3, x: 60, y: 75, polished: false },
        { id: 4, x: 75, y: 82, polished: false },
        { id: 5, x: 25, y: 85, polished: false },
    ]);
    const [dustSpots, setDustSpots] = useState([
        { id: "dust_1", x: 35, y: 80, health: 3 },
        { id: "dust_2", x: 55, y: 85, health: 3 },
        { id: "dust_3", x: 75, y: 75, health: 3 },
    ]);
    const [puffs, setPuffs] = useState([]); // {id, x, y}
    const [pos, setPos] = useState({ x: 20, y: 70 });
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const lastHitTime = useRef(0);

    const background = AssetManifest.village.scenarios.house || null;
    const lampasoImg = ITEM_IMAGE_MAP["lampaso"];
    const silhigImg = ITEM_IMAGE_MAP["silhig"] || ITEM_IMAGE_MAP["walis"];

    const handlePointerDown = (e) => {
        if (stage !== "polish" && stage !== "sweep") return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };
        setIsDragging(true);
        if (e.currentTarget.setPointerCapture) {
            e.currentTarget.setPointerCapture(e.pointerId);
        }
    };

    const spawnPuff = (x, y) => {
        const id = Date.now();
        setPuffs(prev => [...prev, { id, x, y }]);
        setTimeout(() => {
            setPuffs(prev => prev.filter(p => p.id !== id));
        }, 600);
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

        const now = Date.now();

        if (stage === "polish") {
            setPolishSpots(prev => {
                let changed = false;
                const next = prev.map(spot => {
                    const dx = Math.abs(cx - spot.x);
                    const dy = Math.abs(cy - spot.y);
                    if (!spot.polished && dx < 8 && dy < 8) {
                        changed = true;
                        return { ...spot, polished: true };
                    }
                    return spot;
                });
                if (changed && next.every(s => s.polished)) {
                    setIsDragging(false);
                    setTimeout(() => {
                        setStage("sweep");
                        setPos({ x: 20, y: 70 });
                    }, 800);
                }
                return changed ? next : prev;
            });
        } else if (stage === "sweep") {
            if (now - lastHitTime.current < 400) return; // Debounce hits

            setDustSpots(prev => {
                let changed = false;
                const next = prev.map(spot => {
                    const dx = Math.abs(cx - spot.x);
                    const dy = Math.abs(cy - spot.y);
                    if (spot.health > 0 && dx < 10 && dy < 10) {
                        changed = true;
                        lastHitTime.current = now;
                        spawnPuff(spot.x, spot.y);
                        return { ...spot, health: spot.health - 1 };
                    }
                    return spot;
                });
                if (changed && next.every(s => s.health <= 0)) {
                    setIsDragging(false);
                    setTimeout(() => setStage("success"), 800);
                }
                return changed ? next : prev;
            });
        }
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        if (e && e.currentTarget && e.pointerId && e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(prev => prev + 1);
        else setStage("polish");
    };

    const polishedCount = polishSpots.filter(s => s.polished).length;
    const dustClearedCount = dustSpots.filter(s => s.health <= 0).length;

    const dialogueText = stage === "success"
        ? { bisayaText: "Sinidlak na gyud ang salog! Maayo kaayo!", englishText: "The floor is really shiny now! Well done!" }
        : stage === "polish"
            ? { 
                bisayaText: `Pahiri ang mga spots aron mosiga! (${polishedCount}/5)`, 
                englishText: `Polish the spots to make it shine! (${polishedCount}/5)` 
              }
            : stage === "sweep"
                ? {
                    bisayaText: `Silhigi ang abog! 3 ka silhig kada tumpok! (${dustClearedCount}/3)`,
                    englishText: `Sweep the dust! 3 sweeps per pile! (${dustClearedCount}/3)`
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
                        src={background || AssetManifest.village.scenarios.house}
                        alt="Floor"
                        className={`iqm-scene-bg ${stage === "sweep" || stage === "success" ? "iqm-scene-bg--shine" : ""}`}
                        draggable={false}
                    />

                    {stage === "polish" && polishSpots.map(spot => (
                        <div
                            key={spot.id}
                            className={`iqm-polish-spot ${spot.polished ? "iqm-polish-spot--done" : ""}`}
                            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                        />
                    ))}

                    {stage === "sweep" && (
                        <>
                            {dustSpots.map(spot => (
                                <div
                                    key={spot.id}
                                    className={`iqm-dirt-spot ${spot.health <= 0 ? "iqm-dirt-spot--swept" : ""}`}
                                    style={{ 
                                        left: `${spot.x}%`, top: `${spot.y}%`, 
                                        opacity: spot.health / 3,
                                        transform: `scale(${0.5 + (spot.health / 3) * 0.5})`,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    {spot.health > 0 && (
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ fontSize: '24px' }}>💨</span>
                                            <div style={{ fontSize: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '1px 3px', color: 'white', position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}>
                                                {spot.health}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {puffs.map(puff => (
                                <div 
                                    key={puff.id} 
                                    className="iqm-dust-puff"
                                    style={{ left: `${puff.x}%`, top: `${puff.y}%` }}
                                >
                                    ✨💨✨
                                </div>
                            ))}
                        </>
                    )}

                    {(stage === "polish" || stage === "sweep") && (
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
                            <img 
                                src={stage === "polish" ? lampasoImg : silhigImg} 
                                alt="Tool" 
                                style={{ 
                                width: stage === "sweep" ? 220 : 140, 
                                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" 
                                }}
                                draggable={false} 
                            />
                            {!isDragging && (
                                <div className="iqm-drag-indicator" style={{ left: "50%" }}>
                                    <div className="iqm-drag-hand">🖐️</div>
                                </div>
                            )}
                        </div>
                    )}

                    {stage === "success" && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🏆✨</div>
                                <div className="iqm-scene-success-text">Limpyo na!</div>
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
            
            <style dangerouslySetInnerHTML={{ __html: `
                .iqm-scene-bg--shine {
                    filter: brightness(1.2) contrast(1.1);
                    transition: filter 1s ease;
                }
                .iqm-polish-spot {
                    position: absolute;
                    width: 50px; height: 40px;
                    border: 3px dashed rgba(255,255,255,0.7);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    animation: iqm-polish-pulse 2s infinite;
                    background: rgba(255, 255, 255, 0.1);
                }
                .iqm-polish-spot--done {
                    border: 3px solid #5adb5e;
                    background: rgba(90, 219, 94, 0.3);
                    animation: none;
                    opacity: 0.8;
                }
                @keyframes iqm-polish-pulse {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                    50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                }
                .iqm-dust-puff {
                    position: absolute;
                    transform: translate(-50%, -50%);
                    font-size: 32px;
                    pointer-events: none;
                    animation: iqm-puff-out 0.8s forwards;
                    z-index: 20;
                }
                @keyframes iqm-puff-out {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                    100% { transform: translate(-50%, -150%) scale(2); opacity: 0; }
                }
                .iqm-scene-bg--shine::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%);
                    background-size: 200% 200%;
                    animation: iqm-sheen 3s infinite;
                    pointer-events: none;
                }
                @keyframes iqm-sheen {
                    0% { background-position: -200% -200%; }
                    100% { background-position: 200% 200%; }
                }
            `}} />
        </div>
    );
};

export default PolishAndSweepGame;
