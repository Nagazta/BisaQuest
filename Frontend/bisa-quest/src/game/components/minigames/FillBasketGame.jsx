import React, { useState, useRef } from "react";
import AssetManifest from "../../../services/AssetManifest";
import { buildQuestDialogue } from "../questHelpers";

// Fruit images — already imported in dragDropConstants
import bananaImg from "../../../assets/items/banana.jpg";
import mangoImg from "../../../assets/items/mango.jpg";
import watermelonImg from "../../../assets/items/fruit_watermelon.png";
import santolImg from "../../../assets/items/fruit_santol.png";
import lansonesImg from "../../../assets/items/fruit_lansones.png";

const FRUIT_ITEMS = [
    { id: "banana",     labelBisaya: "Saging",    labelEnglish: "Banana",     image: bananaImg,     startX: 12, startY: 25 },
    { id: "mango",      labelBisaya: "Mangga",    labelEnglish: "Mango",      image: mangoImg,      startX: 82, startY: 20 },
    { id: "watermelon", labelBisaya: "Pakwan",    labelEnglish: "Watermelon", image: watermelonImg,  startX: 10, startY: 72 },
    { id: "santol",     labelBisaya: "Santol",    labelEnglish: "Santol",     image: santolImg,     startX: 85, startY: 75 },
    { id: "lansones",   labelBisaya: "Lansones",  labelEnglish: "Lansones",   image: lansonesImg,   startX: 15, startY: 50 },
];

// The basket drop zone (center-bottom area)
const BASKET_ZONE = { x: 35, y: 50, w: 30, h: 35 };

const FillBasketGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success

    // Track each fruit's position and whether it's been placed
    const [fruitPositions, setFruitPositions] = useState(
        FRUIT_ITEMS.reduce((acc, f) => {
            acc[f.id] = { x: f.startX, y: f.startY };
            return acc;
        }, {})
    );
    const [placedFruits, setPlacedFruits] = useState(new Set());
    const [draggedFruitId, setDraggedFruitId] = useState(null);
    const [showSuccessCard, setShowSuccessCard] = useState(false);

    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const bgImage = AssetManifest.village.scenarios.basket;

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(prev => prev + 1);
        else setStage("playing");
    };

    // ── Drag Handlers ────────────────────────────────────────────────────────
    const handlePointerDown = (fruitId, e) => {
        if (stage !== "playing" || placedFruits.has(fruitId)) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };
        setDraggedFruitId(fruitId);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (fruitId, e) => {
        if (draggedFruitId !== fruitId) return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;

        setFruitPositions(prev => ({
            ...prev,
            [fruitId]: {
                x: Math.min(Math.max(x, 3), 97),
                y: Math.min(Math.max(y, 3), 97),
            },
        }));
    };

    const handlePointerUp = (fruitId, e) => {
        if (draggedFruitId !== fruitId) return;
        setDraggedFruitId(null);
        if (e?.currentTarget && e.pointerId != null) {
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { /* */ }
        }

        const pos = fruitPositions[fruitId];
        // Check if inside the basket zone
        const inBasket =
            pos.x > BASKET_ZONE.x &&
            pos.x < BASKET_ZONE.x + BASKET_ZONE.w &&
            pos.y > BASKET_ZONE.y &&
            pos.y < BASKET_ZONE.y + BASKET_ZONE.h;

        if (inBasket) {
            setPlacedFruits(prev => {
                const next = new Set([...prev, fruitId]);
                if (next.size >= FRUIT_ITEMS.length) {
                    setTimeout(() => {
                        setStage("success");
                        setShowSuccessCard(true);
                    }, 400);
                }
                return next;
            });
        } else {
            // Snap back to start position
            const original = FRUIT_ITEMS.find(f => f.id === fruitId);
            if (original) {
                setFruitPositions(prev => ({
                    ...prev,
                    [fruitId]: { x: original.startX, y: original.startY },
                }));
            }
        }
    };

    const getDialogueText = () => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return {
            bisayaText: "Puno na ang basket sa prutas! Maayo! 🎉",
            englishText: "The basket is full of fruits! Great job! 🎉"
        };
        return {
            bisayaText: `I-drag ang mga prutas padulong sa basket! (${placedFruits.size}/${FRUIT_ITEMS.length})`,
            englishText: `Drag the fruits into the basket! (${placedFruits.size}/${FRUIT_ITEMS.length})`
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
                    <img
                        src={bgImage}
                        alt="Basket"
                        className="iqm-scene-bg"
                        draggable={false}
                        style={{ objectFit: "cover" }}
                    />

                    {/* ── Basket drop zone indicator ──────────────────────────── */}
                    {stage === "playing" && (
                        <div style={{
                            position: "absolute",
                            left: `${BASKET_ZONE.x}%`, top: `${BASKET_ZONE.y}%`,
                            width: `${BASKET_ZONE.w}%`, height: `${BASKET_ZONE.h}%`,
                            border: "2px dashed rgba(255,255,255,0.35)",
                            borderRadius: "16px",
                            backgroundColor: "rgba(255,255,255,0.06)",
                            pointerEvents: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexDirection: "column", gap: "2px",
                            color: "rgba(255,255,255,0.4)", fontSize: "12px",
                        }}>
                            <span style={{ fontSize: "22px" }}>🧺</span>
                            <span>Ibutang Diri</span>
                            <span style={{ fontSize: "10px", opacity: 0.7 }}>Drop Here</span>
                        </div>
                    )}

                    {/* ── Fruit items (draggable) ────────────────────────────── */}
                    {(stage === "playing" || stage === "success") && FRUIT_ITEMS.map(fruit => {
                        const pos = fruitPositions[fruit.id];
                        const isPlaced = placedFruits.has(fruit.id);
                        const isBeingDragged = draggedFruitId === fruit.id;

                        return (
                            <div
                                key={fruit.id}
                                className={`iqm-scene-broom ${isBeingDragged ? "iqm-scene-broom--dragging" : ""}`}
                                style={{
                                    left: `${pos.x}%`, top: `${pos.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    cursor: isPlaced ? "default" : (isBeingDragged ? "grabbing" : "grab"),
                                    width: "80px", height: "80px",
                                    zIndex: isBeingDragged ? 20 : (isPlaced ? 5 : 10),
                                    opacity: isPlaced ? 0.9 : 1,
                                    transition: isBeingDragged ? "none" : "left 0.3s, top 0.3s",
                                }}
                                onPointerDown={(e) => handlePointerDown(fruit.id, e)}
                                onPointerMove={(e) => handlePointerMove(fruit.id, e)}
                                onPointerUp={(e) => handlePointerUp(fruit.id, e)}
                                onPointerCancel={(e) => handlePointerUp(fruit.id, e)}
                            >
                                <img
                                    src={fruit.image}
                                    alt={fruit.labelEnglish}
                                    style={{
                                        width: "100%", height: "100%",
                                        objectFit: "contain", borderRadius: "10px",
                                    }}
                                    draggable={false}
                                />
                                <span style={{
                                    position: "absolute", bottom: "-2px", left: "50%",
                                    transform: "translateX(-50%)",
                                    fontSize: "10px", color: "#fff",
                                    background: isPlaced ? "rgba(76,175,80,0.75)" : "rgba(0,0,0,0.55)",
                                    padding: "1px 6px", borderRadius: "4px", whiteSpace: "nowrap",
                                }}>
                                    {isPlaced ? "✓ " : ""}{fruit.labelBisaya}
                                </span>
                            </div>
                        );
                    })}

                    {/* ── Progress pips ───────────────────────────────────────── */}
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress" style={{ top: "8%", bottom: "auto" }}>
                            {FRUIT_ITEMS.map(f => (
                                <div key={f.id} className={`iqm-sweep-pip ${placedFruits.has(f.id) ? "iqm-sweep-pip--done" : ""}`} />
                            ))}
                        </div>
                    )}

                    {/* ── Success overlay ─────────────────────────────────────── */}
                    {stage === "success" && showSuccessCard && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🎊✨</div>
                                <div className="iqm-scene-success-text">Puno na ang Basket!</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Dialogue Row ────────────────────────────────────────────── */}
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

export default FillBasketGame;
