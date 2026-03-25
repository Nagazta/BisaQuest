import React, { useState, useRef, useEffect } from "react";
import AssetManifest from "../../../services/AssetManifest";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import { buildQuestDialogue } from "../questHelpers";

const IroningGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);
    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success
    const [currentClothIndex, setCurrentClothIndex] = useState(0);
    const [wiped, setWiped] = useState(new Set());
    const [ironPos, setIronPos] = useState({ x: 20, y: 70 });
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const ironImg = ITEM_IMAGE_MAP["iron"] || ITEM_IMAGE_MAP["plantsa"] || null;

    const clothes = [
        { id: "baro", label: "Baro", image: ITEM_IMAGE_MAP["baro"] },
        { id: "sinina", label: "Sinina", image: ITEM_IMAGE_MAP["sinina"] },
        { id: "dress", label: "Dress", image: ITEM_IMAGE_MAP["dress"] },
        { id: "pants", label: "Pants", image: ITEM_IMAGE_MAP["sinina"] },
    ];

    const currentCloth = clothes[currentClothIndex];

    // Spots to "iron" (wipe) for each cloth
    const spots = [
        { id: "s1", x: 45, y: 40, w: 10, h: 10 },
        { id: "s2", x: 55, y: 45, w: 10, h: 10 },
        { id: "s3", x: 50, y: 55, w: 10, h: 10 },
        { id: "s4", x: 40, y: 50, w: 10, h: 10 },
        { id: "s5", x: 60, y: 50, w: 10, h: 10 },
    ];

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(prev => prev + 1);
        else setStage("playing");
    };

    const handlePointerDown = (e) => {
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

    const handlePointerMove = (e) => {
        if (!isDragging || stage !== "playing") return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
        const cx = Math.min(Math.max(x, 5), 95);
        const cy = Math.min(Math.max(y, 5), 90);
        setIronPos({ x: cx, y: cy });

        spots.forEach(spot => {
            if (wiped.has(spot.id)) return;
            const overlap =
                cx + 5 > spot.x && cx - 5 < spot.x + spot.w &&
                cy + 5 > spot.y && cy - 5 < spot.y + spot.h;
            if (overlap) {
                setWiped(prev => {
                    const next = new Set([...prev, spot.id]);
                    if (next.size >= spots.length) {
                        // Cloth ironed! Move to next or success.
                        setTimeout(() => {
                            if (currentClothIndex < clothes.length - 1) {
                                setCurrentClothIndex(prev => prev + 1);
                                setWiped(new Set());
                                setIronPos({ x: 20, y: 70 });
                            } else {
                                setStage("success");
                            }
                        }, 400);
                    }
                    return next;
                });
            }
        });
    };

    const handlePointerUp = () => setIsDragging(false);

    const getDialogueText = () => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return {
            bisayaText: "Nahuman na ang tanang plantsahonon! Hapsay na tan-awon! ✨",
            englishText: "Finished all the ironing! Everything looks neat! ✨"
        };
        return {
            bisayaText: `Plantsaha ang ${currentCloth.label}! (${currentClothIndex + 1}/${clothes.length})`,
            englishText: `Iron the ${currentCloth.label}! (${currentClothIndex + 1}/${clothes.length})`
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
                    <div className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">Plantsa</div>
                </div>

                <div className="iqm-scene-canvas" ref={containerRef}>
                    {/* Ironing Board Background */}
                    <img
                        src={AssetManifest.village.scenarios.ironBoard}
                        alt="Ironing Board"
                        className="iqm-scene-bg"
                        draggable={false}
                    />

                    {/* Current Cloth */}
                    <div style={{
                        position: "absolute",
                        left: "50%", top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "50%", height: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 2,
                        filter: wiped.size >= spots.length ? "brightness(1.1) drop-shadow(0 0 10px white)" : "none",
                        transition: "filter 0.3s ease"
                    }}>
                        {currentCloth.image ? (
                            <img src={currentCloth.image} alt={currentCloth.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} draggable={false} />
                        ) : (
                            <span style={{ fontSize: "80px" }}>👕</span>
                        )}
                    </div>

                    {/* Wrinkle Spots (only visual markers if needed, or just invisible) */}
                    {stage === "playing" && spots.map(spot => (
                        <div key={spot.id} style={{
                            position: "absolute",
                            left: `${spot.x}%`, top: `${spot.y}%`,
                            width: `${spot.w}%`, height: `${spot.h}%`,
                            background: "rgba(0,0,0,0.1)",
                            borderRadius: "50%",
                            opacity: wiped.has(spot.id) ? 0 : 0.6,
                            transition: "opacity 0.2s"
                        }} />
                    ))}

                    {/* Progress Pips */}
                    <div className="iqm-sweep-progress">
                        {clothes.map((_, i) => (
                            <div key={i} className={`iqm-sweep-pip ${i < currentClothIndex ? "iqm-sweep-pip--done" : (i === currentClothIndex ? "iqm-sweep-pip--active" : "")}`}
                                style={{ backgroundColor: i < currentClothIndex ? "#22c55e" : (i === currentClothIndex ? "#fcd765" : "rgba(255,255,255,0.2)") }}
                            />
                        ))}
                    </div>

                    {/* Draggable Iron */}
                    {stage === "playing" && (
                        <div
                            className={`iqm-scene-broom ${isDragging ? "iqm-scene-broom--dragging" : ""}`}
                            style={{
                                left: `${ironPos.x}%`, top: `${ironPos.y}%`,
                                transform: "translate(-50%, -50%)",
                                cursor: isDragging ? "grabbing" : "grab",
                                zIndex: 10
                            }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                        >
                            {ironImg ? (
                                <img src={ironImg} alt="Iron" style={{ width: "150px", height: "150px", objectFit: "contain" }} draggable={false} />
                            ) : (
                                <span style={{ fontSize: "60px" }}>🔌</span>
                            )}
                        </div>
                    )}

                    {/* Success Overlay */}
                    {stage === "success" && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🏆✨</div>
                                <div className="iqm-scene-success-text">Nahuman na ang tanan!</div>
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

export default IroningGame;
