import React, { useState, useRef } from "react";
import AssetManifest from "../../../services/AssetManifest";
import { buildQuestDialogue } from "../questHelpers";
import cupImg from "../../../assets/items/cup.png";
import spongeImg from "../../../assets/items/sponge.png";

const WASH_ITEMS = [
    { id: "plate", labelBisaya: "Plato", labelEnglish: "Plate", image: AssetManifest.village.items.plateWashing },
    { id: "spoon", labelBisaya: "Kutsara", labelEnglish: "Spoon", image: AssetManifest.village.items.spoon },
    { id: "cauldron", labelBisaya: "Kaldero", labelEnglish: "Cauldron", image: AssetManifest.village.items.cauldron },
    { id: "cup", labelBisaya: "Tasa", labelEnglish: "Cup", image: cupImg },
];

const WashDishesGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | wash | place | success
    const [itemIndex, setItemIndex] = useState(0);
    const [washCount, setWashCount] = useState(0);
    const [isOverItem, setIsOverItem] = useState(false);

    // Sponge position (draggable)
    const [spongePos, setSpongePos] = useState({ x: 65, y: 40 });
    const [isDragging, setIsDragging] = useState(false);

    // Place-stage drag position for the clean item
    const [cleanItemPos, setCleanItemPos] = useState({ x: 50, y: 65 });
    const [isDraggingClean, setIsDraggingClean] = useState(false);

    const [showSuccessCard, setShowSuccessCard] = useState(false);
    const [placedItems, setPlacedItems] = useState([]);

    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const currentWashItem = WASH_ITEMS[itemIndex];
    const bgImage = AssetManifest.village.scenarios.kitchenSink;

    // Item sits fixed in the sink area
    const ITEM_CENTER = { x: 50, y: 55 };
    const ITEM_RADIUS = 10; // % overlap threshold

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(prev => prev + 1);
        else setStage("wash");
    };

    // Sponge Drag (wash stage) 
    const handleSpongeDown = (e) => {
        if (stage !== "wash") return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleSpongeMove = (e) => {
        if (!isDragging || stage !== "wash") return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
        const cx = Math.min(Math.max(x, 5), 95);
        const cy = Math.min(Math.max(y, 5), 95);
        setSpongePos({ x: cx, y: cy });

        // Check overlap with the fixed item in the sink
        const overlapping =
            Math.abs(cx - ITEM_CENTER.x) < ITEM_RADIUS &&
            Math.abs(cy - ITEM_CENTER.y) < ITEM_RADIUS;

        if (overlapping && !isOverItem) {
            setIsOverItem(true);
            setWashCount(prev => {
                const next = prev + 1;
                if (next >= 3) {
                    setTimeout(() => {
                        setIsDragging(false);
                        setStage("place");
                        setCleanItemPos({ x: 50, y: 55 });
                    }, 300);
                }
                return next;
            });
        } else if (!overlapping && isOverItem) {
            setIsOverItem(false);
        }
    };

    const handleSpongeUp = (e) => {
        setIsDragging(false);
        setIsOverItem(false);
        if (e?.currentTarget && e.pointerId != null) {
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { /* */ }
        }
    };

    // ── Clean Item Drag (place stage) ────────────────────────────────────────
    const handleCleanDown = (e) => {
        if (stage !== "place") return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2,
        };
        setIsDraggingClean(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleCleanMove = (e) => {
        if (!isDraggingClean || stage !== "place") return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
        setCleanItemPos({
            x: Math.min(Math.max(x, 5), 95),
            y: Math.min(Math.max(y, 5), 95),
        });
    };

    const handleCleanUp = (e) => {
        setIsDraggingClean(false);
        if (e?.currentTarget && e.pointerId != null) {
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { /* */ }
        }

        // Dropped in the rack area (right side)?
        if (stage === "place" && cleanItemPos.x > 72) {
            handleNextItem();
        } else {
            setCleanItemPos({ x: 50, y: 55 });
        }
    };

    const handleNextItem = () => {
        setPlacedItems(prev => [...prev, currentWashItem]);
        const nextIndex = itemIndex + 1;
        if (nextIndex >= WASH_ITEMS.length) {
            setStage("success");
            setShowSuccessCard(true);
        } else {
            setItemIndex(nextIndex);
            setWashCount(0);
            setIsOverItem(false);
            setSpongePos({ x: 25, y: 40 });
            setStage("wash");
        }
    };

    const getDialogueText = () => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Limpyo na ang tanan! Maayong pagkahugas! 🎉", englishText: "Everything is clean! Well washed! 🎉" };
        if (stage === "wash") return {
            bisayaText: `I-kiskis ang espongha sa ${currentWashItem.labelBisaya}! (${washCount}/3)`,
            englishText: `Scrub the sponge on the ${currentWashItem.labelEnglish}! (${washCount}/3)`
        };
        if (stage === "place") return {
            bisayaText: `Ibutang ang ${currentWashItem.labelBisaya} sa rack sa tuo!`,
            englishText: `Place the ${currentWashItem.labelEnglish} on the rack to the right!`
        };
        return dialogue[0];
    };

    const dialogueText = getDialogueText();

    // Dirty filter to make the item look dirty until fully washed
    const dirtyFilter = washCount < 3
        ? `brightness(${0.6 + washCount * 0.13}) sepia(${0.5 - washCount * 0.15})`
        : "none";

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
                        alt="Kitchen Sink"
                        className="iqm-scene-bg"
                        draggable={false}
                        style={{ objectFit: "cover" }}
                    />

                    {/* ── Already-placed items on the rack ───────────────────── */}
                    {placedItems.map((pi, idx) => (
                        <div key={pi.id} style={{
                            position: "absolute",
                            right: `${8 + idx * 5}%`, top: `${35 + idx * 10}%`,
                            width: "60px", height: "60px",
                            pointerEvents: "none",
                            opacity: 0.85,
                        }}>
                            <img src={pi.image} alt={pi.labelEnglish}
                                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
                                draggable={false} />
                            <span style={{
                                position: "absolute", bottom: "-14px", left: "50%", transform: "translateX(-50%)",
                                fontSize: "10px", color: "#fff", background: "rgba(0,0,0,0.5)",
                                padding: "1px 4px", borderRadius: "4px", whiteSpace: "nowrap"
                            }}>✓ {pi.labelBisaya}</span>
                        </div>
                    ))}

                    {/* ── WASH STAGE ──────────────────────────────────────────── */}
                    {stage === "wash" && currentWashItem && (
                        <>
                            {/* Fixed item in sink */}
                            <div style={{
                                position: "absolute",
                                left: `${ITEM_CENTER.x}%`, top: `${ITEM_CENTER.y}%`,
                                transform: "translate(-50%, -50%)",
                                width: "130px", height: "130px",
                                display: "flex", justifyContent: "center", alignItems: "center",
                                pointerEvents: "none",
                            }}>
                                <img
                                    src={currentWashItem.image}
                                    alt={currentWashItem.labelEnglish}
                                    style={{
                                        maxWidth: "100%", maxHeight: "100%",
                                        filter: dirtyFilter,
                                        transition: "filter 0.4s",
                                        borderRadius: "8px",
                                    }}
                                    draggable={false}
                                />
                                <span style={{
                                    position: "absolute", bottom: "13px", left: "50%", transform: "translateX(-50%)",
                                    fontSize: "12px", color: "#fff", background: "rgba(0,0,0,0.55)",
                                    padding: "2px 8px", borderRadius: "6px", whiteSpace: "nowrap"
                                }}>{currentWashItem.labelBisaya} / {currentWashItem.labelEnglish}</span>

                                {/* Bubble animation when scrubbing */}
                                {washCount > 0 && washCount < 3 && (
                                    <div style={{
                                        position: "absolute", top: "45px", right: "40px",
                                        fontSize: "24px", pointerEvents: "none",
                                        animation: "iqm-float 1s ease-in-out infinite"
                                    }}>🫧</div>
                                )}
                            </div>

                            {/* Drop zone hint on right */}
                            <div style={{
                                position: "absolute",
                                right: "4%", top: "30%",
                                width: "22%", height: "45%",
                                border: "2px dashed rgba(255,255,255,0.35)",
                                borderRadius: "12px",
                                backgroundColor: "rgba(255,255,255,0.08)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                pointerEvents: "none", color: "rgba(255,255,255,0.4)", fontSize: "12px",
                                flexDirection: "column", gap: "4px"
                            }}>
                                <span>🍽️</span>
                                <span>Rack</span>
                            </div>

                            {/* Draggable sponge */}
                            <div
                                className={`iqm-scene-broom ${isDragging ? "iqm-scene-broom--dragging" : ""}`}
                                style={{
                                    left: `${spongePos.x}%`, top: `${spongePos.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    cursor: isDragging ? "grabbing" : "grab",
                                    width: "100px", height: "100px",
                                    zIndex: 10,
                                }}
                                onPointerDown={handleSpongeDown}
                                onPointerMove={handleSpongeMove}
                                onPointerUp={handleSpongeUp}
                                onPointerCancel={handleSpongeUp}
                            >
                                <img src={spongeImg} alt="Sponge"
                                    style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px" }}
                                    draggable={false} />
                            </div>

                            {/* Drag hint */}
                            {!isDragging && washCount === 0 && (
                                <div className="iqm-drag-indicator" style={{ top: `${spongePos.y}%`, left: `${spongePos.x}%` }}>
                                    <div className="iqm-drag-hand">👆</div>
                                </div>
                            )}

                            {/* Wash progress pips */}
                            <div className="iqm-sweep-progress" style={{ top: "12%", bottom: "auto" }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} className={`iqm-sweep-pip ${washCount > i ? "iqm-sweep-pip--done" : ""}`} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── PLACE STAGE ─────────────────────────────────────────── */}
                    {stage === "place" && currentWashItem && (
                        <>
                            {/* Drop Zone Highlight */}
                            <div style={{
                                position: "absolute",
                                right: "4%", top: "30%",
                                width: "22%", height: "45%",
                                border: "3px dashed rgba(255,255,255,0.7)",
                                borderRadius: "15px",
                                backgroundColor: "rgba(76, 175, 80, 0.25)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                pointerEvents: "none", color: "#fff", fontSize: "14px", fontWeight: "bold",
                                flexDirection: "column", gap: "4px"
                            }}>
                                <span style={{ fontSize: "28px" }}>🍽️</span>
                                <span>Ibutang Diri!</span>
                                <span style={{ fontSize: "11px", opacity: 0.7 }}>Drop Here!</span>
                            </div>

                            {/* Draggable clean item */}
                            <div
                                className={`iqm-scene-broom ${isDraggingClean ? "iqm-scene-broom--dragging" : ""}`}
                                style={{
                                    left: `${cleanItemPos.x}%`, top: `${cleanItemPos.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    cursor: isDraggingClean ? "grabbing" : "grab",
                                    width: "130px", height: "130px",
                                    display: "flex", justifyContent: "center", alignItems: "center",
                                    zIndex: 10,
                                }}
                                onPointerDown={handleCleanDown}
                                onPointerMove={handleCleanMove}
                                onPointerUp={handleCleanUp}
                                onPointerCancel={handleCleanUp}
                            >
                                <img
                                    src={currentWashItem.image}
                                    alt={currentWashItem.labelEnglish}
                                    style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "8px" }}
                                    draggable={false}
                                />
                                <div style={{
                                    position: "absolute", top: "-8px", right: "-8px",
                                    fontSize: "20px", pointerEvents: "none",
                                }}>✨</div>
                            </div>
                            {!isDraggingClean && (
                                <div className="iqm-drag-indicator" style={{ top: `${cleanItemPos.y}%`, left: `${cleanItemPos.x}%` }}>
                                    <div className="iqm-drag-hand">👆</div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── SUCCESS ─────────────────────────────────────────────── */}
                    {stage === "success" && showSuccessCard && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🏆✨</div>
                                <div className="iqm-scene-success-text">Nasidlak Na ang mga plato!</div>
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

export default WashDishesGame;
