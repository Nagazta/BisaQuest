// ─────────────────────────────────────────────────────────────────────────────
//  ItemQuestModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useRef } from "react";
import { ITEM_IMAGE_MAP } from "../dragDropConstants";
import AssetManifest from "../../services/AssetManifest";
import "./ItemQuestModal.css";

const ITEM_QUESTS = {
    // ── Silhig — scene drag game ───────────────────────────────────────────────
    silhig: {
        mechanic: "scene_drag",
        background: "dirty",   // use livingRoomDirty
        backgroundClean: "clean",
        instructionBisaya: "I-drag ang silhig sa mga hugaw sa salog!",
        instructionEnglish: "Drag the broom to sweep the dirt on the floor!",
        draggable: {
            id: "broom_item",
            label: "Silhig",
            imageKey: "walis",
            startX: 20,   // % from left
            startY: 55,   // % from top
        },
        // Multiple dirt spots to sweep — all must be cleared to win
        dirtSpots: [
            // Left side
            { id: "paper_1", x: 28, y: 72, w: 7, h: 6 },
            { id: "paper_2", x: 34, y: 88, w: 7, h: 6 },
            // Center area
            { id: "paper_3", x: 44, y: 69, w: 6, h: 5 },
            { id: "paper_4", x: 52, y: 63, w: 5, h: 5 },
            { id: "paper_5", x: 55, y: 63, w: 5, h: 5 },
            { id: "chips", x: 44, y: 84, w: 10, h: 8 },
            { id: "candy_1", x: 58, y: 80, w: 7, h: 6 },
            // Right side
            { id: "candy_2", x: 68, y: 86, w: 8, h: 6 },
            { id: "candy_3", x: 80, y: 65, w: 6, h: 5 },
            { id: "can", x: 73, y: 73, w: 6, h: 6 },
            { id: "crumbs_1", x: 39, y: 78, w: 6, h: 5 },
            { id: "crumbs_2", x: 62, y: 84, w: 8, h: 6 },
            { id: "paper_6", x: 84, y: 84, w: 8, h: 6 },
        ],
    },
    mop: {
        mechanic: "scene_drag",
        background: "spill",   // uses livingRoomSpill
        backgroundClean: "clean",
        instructionBisaya: "I-mop ang mga tubig-tubig sa salog!",
        instructionEnglish: "Mop up the water spills on the floor!",
        draggable: {
            id: "mop_item",
            label: "Mop",
            imageKey: "mop",
            startX: 20,
            startY: 55,
        },
        dirtSpots: [
            // Big puddle bottom area
            { id: "spill_1", x: 30, y: 85, w: 10, h: 8 },
            { id: "spill_2", x: 45, y: 88, w: 12, h: 8 },
            { id: "spill_3", x: 60, y: 85, w: 12, h: 8 },
            { id: "spill_4", x: 75, y: 80, w: 10, h: 8 },
            // Middle area puddles
            { id: "spill_5", x: 40, y: 75, w: 9, h: 6 },
            { id: "spill_6", x: 52, y: 77, w: 9, h: 6 },
            { id: "spill_7", x: 65, y: 71, w: 8, h: 6 },
            // Back puddles
            { id: "spill_8", x: 35, y: 65, w: 8, h: 6 },
            { id: "spill_9", x: 48, y: 64, w: 8, h: 6 }
        ],
    },

    // ── Planggana ──────────────────────────────────────────────────────────────
    planggana: {
        mechanic: "wash_and_mop",
        instructionBisaya: "Hugasi ug i-mop ang salog!",
        instructionEnglish: "Wash the mop and clean the floor!",
        washStage: {
            background: "none",
            basinImage: "plangganaWater",
            basinX: 50,
            basinY: 60,
            basinW: 24,
            basinH: 15,
            mopStartX: 20,
            mopStartY: 40,
        },
        mopStage: {
            background: "spill",   // uses livingRoomSpill
            dirtSpots: [
                { id: "spill_1", x: 30, y: 85, w: 10, h: 8 },
                { id: "spill_2", x: 45, y: 88, w: 12, h: 8 },
                { id: "spill_3", x: 60, y: 85, w: 12, h: 8 },
                { id: "spill_4", x: 75, y: 80, w: 10, h: 8 },
                { id: "spill_5", x: 40, y: 75, w: 9, h: 6 },
                { id: "spill_6", x: 52, y: 77, w: 9, h: 6 },
                { id: "spill_7", x: 65, y: 71, w: 8, h: 6 },
                { id: "spill_8", x: 35, y: 65, w: 8, h: 6 },
                { id: "spill_9", x: 48, y: 64, w: 8, h: 6 }
            ],
        }
    },

    toalya: {
        mechanic: "wipe_character",
        instructionBisaya: "Pahiran ang singot ni Ligaya gamit ang toalya!",
        instructionEnglish: "Wipe Ligaya's sweat using the towel!",
        draggable: {
            id: "towel_item",
            label: "Toalya",
            imageKey: "towel",
            startX: 20,
            startY: 50,
        },
        characterStage: {
            dirtyImage: AssetManifest.village.npcs.ligaya_sweating,
            cleanImage: AssetManifest.village.npcs.ligaya,
            sweatSpots: [
                { id: "sweat_1", x: 45, y: 35, w: 10, h: 10 },
                { id: "sweat_2", x: 55, y: 40, w: 10, h: 10 },
                { id: "sweat_3", x: 40, y: 45, w: 10, h: 10 },
                { id: "sweat_4", x: 50, y: 55, w: 10, h: 10 },
                { id: "sweat_5", x: 48, y: 25, w: 10, h: 10 },
            ]
        }
    },

    lampara: {
        mechanic: "item_association",
        instructionBisaya: "Unsay naghatag og suga?",
        instructionEnglish: "Which one gives light?",
        items: [
            { id: "q_lamp", label: "Lampara", imageKey: "lamp", isCorrect: true },
            { id: "q_broom", label: "Silhig", imageKey: "walis", isCorrect: false },
            { id: "q_pot", label: "Kaldero", imageKey: "kaldero", isCorrect: false },
            { id: "q_fan", label: "Bentilador", imageKey: "Bentilador", isCorrect: false },
        ],
    },

    sopa: {
        mechanic: "drag_drop",
        instructionBisaya: "I-drag ang unan sa sopa!",
        instructionEnglish: "Drag the pillow to the sofa!",
        items: [
            { id: "q_pillow", label: "Unan", imageKey: "pillow", isCorrect: true, correctZone: "sopa" },
            { id: "q_broom", label: "Silhig", imageKey: "walis", isCorrect: false, correctZone: null },
            { id: "q_pot", label: "Kaldero", imageKey: "kaldero", isCorrect: false, correctZone: null },
        ],
        zones: [
            { id: "sopa", label: "Sopa / Sofa" },
            { id: "bookshelf", label: "Estante / Shelf" },
        ],
    },

    bookshelf: {
        mechanic: "alphabetical_sort",
        background: AssetManifest.village.scenarios.bookshelf,
        instructionBisaya: "I-drag ang mga libro pinasubay sa alpabeto (A, B, C, D)!",
        instructionEnglish: "Drag the books in alphabetical order (A, B, C, D)!",
        dropZones: [
            { id: "slot_A", x: 45.5, y: 25, w: 5, h: 14 },
            { id: "slot_B", x: 50.5, y: 25, w: 5, h: 14 },
            { id: "slot_C", x: 55.5, y: 25, w: 5, h: 14 },
            { id: "slot_D", x: 60.5, y: 25, w: 5, h: 14 }
        ],
        draggableItems: [
            { id: "book_A", letter: "A", startX: 20, startY: 80, correctZone: "slot_A" },
            { id: "book_B", letter: "B", startX: 80, startY: 82, correctZone: "slot_B" },
            { id: "book_C", letter: "C", startX: 35, startY: 78, correctZone: "slot_C" },
            { id: "book_D", letter: "D", startX: 65, startY: 85, correctZone: "slot_D" }
        ],
    },

    book: {
        mechanic: "scene_drag_drop",
        background: AssetManifest.village.scenarios.house,
        instructionBisaya: "I-hipos ang mga nakakalat nga libro sa estante!",
        instructionEnglish: "Organize the scattered books onto the shelf!",
        dropZones: [
            { id: "bookshelf", x: 80, y: 30, w: 18, h: 55 }
        ],
        draggableItems: [
            { id: "book_1", imageKey: "book", startX: 30, startY: 85, correctZone: "bookshelf" },
            { id: "book_2", imageKey: "book", startX: 45, startY: 88, correctZone: "bookshelf" },
            { id: "book_3", imageKey: "book", startX: 60, startY: 85, correctZone: "bookshelf" },
            { id: "book_4", imageKey: "book", startX: 75, startY: 80, correctZone: "bookshelf" },
            { id: "book_5", imageKey: "book", startX: 35, startY: 70, correctZone: "bookshelf" },
        ],
    },

    _default: {
        mechanic: "item_association",
        instructionBisaya: "Pilia ang husto nga tubag!",
        instructionEnglish: "Choose the correct answer!",
        items: [
            { id: "q_broom", label: "Silhig", imageKey: "walis", isCorrect: true },
            { id: "q_pot", label: "Kaldero", imageKey: "kaldero", isCorrect: false },
            { id: "q_pillow", label: "Unan", imageKey: "pillow", isCorrect: false },
            { id: "q_towel", label: "Toalya", imageKey: "towel", isCorrect: false },
        ],
    },
};

const buildQuestDialogue = (quest, item) => [
    {
        bisayaText: `Tan-awa ang ${item.labelBisaya}! Sulayi kining mini-game!`,
        englishText: `Look at the ${item.labelEnglish}! Try this mini-game!`,
    },
    {
        bisayaText: quest.instructionBisaya,
        englishText: quest.instructionEnglish,
    },
];

// ── SceneDragGame — broom sweep mechanic ──────────────────────────────────────
const SceneDragGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success
    const [swept, setSwept] = useState(new Set());
    const [broomPos, setBroomPos] = useState({ x: quest.draggable.startX, y: quest.draggable.startY });
    const [isDragging, setIsDragging] = useState(false);
    const [showClean, setShowClean] = useState(false);
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const broomImg = ITEM_IMAGE_MAP[quest.draggable.imageKey] || null;
    const allSwept = swept.size >= quest.dirtSpots.length;

    const dirtyBg = quest.background === "spill"
        ? AssetManifest.village.scenarios.livingRoomSpill
        : AssetManifest.village.scenarios.livingRoomDirty;

    const background = showClean
        ? AssetManifest.village.scenarios.house
        : dirtyBg;

    // ── Pointer drag handlers ──────────────────────────────────────────────────
    const handleBroomPointerDown = (e) => {
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

    const handleBroomPointerMove = (e) => {
        if (!isDragging || stage !== "playing") return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
        const cx = Math.min(Math.max(x, 5), 90);
        const cy = Math.min(Math.max(y, 5), 85);
        setBroomPos({ x: cx, y: cy });

        // Check if broom overlaps any unswept dirt spot
        quest.dirtSpots.forEach(spot => {
            if (swept.has(spot.id)) return;
            const overlap =
                cx + 4 > spot.x && cx - 4 < spot.x + spot.w &&
                cy + 4 > spot.y && cy - 4 < spot.y + spot.h;
            if (overlap) {
                setSwept(prev => {
                    const next = new Set([...prev, spot.id]);
                    if (next.size >= quest.dirtSpots.length) {
                        // All swept — trigger success
                        setTimeout(() => {
                            setShowClean(true);
                            setStage("success");
                        }, 300);
                    }
                    return next;
                });
            }
        });
    };

    const handleBroomPointerUp = () => setIsDragging(false);

    // ── Dialogue line ──────────────────────────────────────────────────────────
    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Limpyo na ang salog! Maayo kaayo! 🎉", englishText: "The floor is clean! Well done! 🎉" };
        const remaining = quest.dirtSpots.length - swept.size;
        if (remaining > 0) return {
            bisayaText: `${remaining} hugaw pa ang nahibilin! I-silhig na!`,
            englishText: `${remaining} more dirt spots to sweep!`,
        };
        return { bisayaText: quest.instructionBisaya, englishText: quest.instructionEnglish };
    })();

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(s => s + 1);
        else setStage("playing");
    };

    return (
        <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="iqm-modal iqm-modal--scene">

                <button className="iqm-close" onClick={onClose}>✕</button>

                {/* Header */}
                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">
                        Clean the Floor
                    </span>
                </div>

                {/* ── Scene canvas ────────────────────────────────────────────────── */}
                <div className="iqm-scene-canvas" ref={containerRef}>
                    {/* Background — dirty or clean */}
                    <img
                        src={background}
                        alt="Room"
                        className={[
                            "iqm-scene-bg",
                            showClean ? "iqm-scene-bg--reveal" : "",
                        ].filter(Boolean).join(" ")}
                        draggable={false}
                    />

                    {/* Dirt spots */}
                    {stage !== "intro" && quest.dirtSpots.map(spot => (
                        <div
                            key={spot.id}
                            className={[
                                "iqm-dirt-spot",
                                quest.background === "spill" ? "iqm-dirt-spot--spill" : "",
                                swept.has(spot.id) ? "iqm-dirt-spot--swept" : "",
                            ].filter(Boolean).join(" ")}
                            style={{
                                left: `${spot.x}%`,
                                top: `${spot.y}%`,
                                width: `${spot.w}%`,
                                height: `${spot.h}%`,
                            }}
                        />
                    ))}

                    {/* Progress indicator */}
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress">
                            {quest.dirtSpots.map(spot => (
                                <span
                                    key={spot.id}
                                    className={`iqm-sweep-pip ${swept.has(spot.id) ? "iqm-sweep-pip--done" : ""}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Draggable broom */}
                    {stage !== "intro" && (
                        <div
                            className={[
                                "iqm-scene-broom",
                                isDragging ? "iqm-scene-broom--dragging" : "",
                                stage === "success" ? "iqm-scene-broom--hidden" : "",
                            ].filter(Boolean).join(" ")}
                            style={{
                                left: `${broomPos.x}%`,
                                top: `${broomPos.y}%`,
                                transform: "translate(-50%, -50%)",
                                cursor: stage === "playing" ? (isDragging ? "grabbing" : "grab") : "default",
                            }}
                            onPointerDown={handleBroomPointerDown}
                            onPointerMove={handleBroomPointerMove}
                            onPointerUp={handleBroomPointerUp}
                            onPointerCancel={handleBroomPointerUp}
                        >
                            {broomImg
                                ? <img src={broomImg} alt="Silhig" className="iqm-scene-broom-img" draggable={false} />
                                : <span style={{ fontSize: 40 }}>🧹</span>
                            }
                            {/* Drag Indicator */}
                            {stage === "playing" && !isDragging && (
                                <div className="iqm-drag-indicator">
                                    <span className="iqm-drag-hand">🖐️</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── NPC dialogue row ─────────────────────────────────────────────── */}
                <div className="iqm-dialogue-row">
                    <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
                    <div className="iqm-dialogue-bubble">
                        <div className="iqm-dialogue-speaker">{npcName}</div>
                        <div className="iqm-dialogue-text">
                            <span className="iqm-dialogue-bisaya">{dialogueText.bisayaText}</span>
                            <span className="iqm-dialogue-english">{dialogueText.englishText}</span>
                        </div>
                        {stage === "intro" && (
                            <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>
                        )}
                        {stage === "success" && (
                            <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

// ── WashAndMopGame ───────────────────────────────────────────────────────────
const WashAndMopGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | wash | mop | success
    
    // Wash stage
    const [mopWashPos, setMopWashPos] = useState({ x: quest.washStage.mopStartX, y: quest.washStage.mopStartY });
    const [washCount, setWashCount] = useState(0);
    const [isInBasin, setIsInBasin] = useState(false);
    
    // Mop stage
    const [swept, setSwept] = useState(new Set());
    const [mopFloorPos, setMopFloorPos] = useState({ x: 20, y: 55 });
    const [showClean, setShowClean] = useState(false);

    // Shared
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const basinImg = AssetManifest.village.items[quest.washStage.basinImage];
    const mopImg = ITEM_IMAGE_MAP["mop"] || null;

    // ── Pointer drag handlers ──────────────────────────────────────────────────
    const handlePointerDown = (e, type) => {
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

    const handlePointerMove = (e, type) => {
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
            
            // Check overlap with basin 
            const bX = 50;
            const bY = 50;
            const bW = 40; // reduced slightly to require actual dragging in and out
            const bH = 40;
            
            const overlapping = cx > bX - bW/2 && cx < bX + bW/2 && cy > bY - bH/2 && cy < bY + bH/2;
            
            if (overlapping && !isInBasin) {
                setIsInBasin(true);
                setWashCount(prev => {
                    const next = prev + 1;
                    if (next >= 3) {
                        setTimeout(() => {
                            setIsDragging(false);
                            setStage("mop");
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

            // Check overlap with dirt/spills
            quest.mopStage.dirtSpots.forEach(spot => {
                if (swept.has(spot.id)) return;
                const overlap =
                    cx + 4 > spot.x && cx - 4 < spot.x + spot.w &&
                    cy + 4 > spot.y && cy - 4 < spot.y + spot.h;
                if (overlap) {
                    setSwept(prev => {
                        const next = new Set([...prev, spot.id]);
                        if (next.size >= quest.mopStage.dirtSpots.length) {
                            setTimeout(() => {
                                setShowClean(true);
                                setStage("success");
                            }, 300);
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
        if (introStep < dialogue.length - 1) {
            setIntroStep(prev => prev + 1);
        } else {
            setStage("wash");
        }
    };

    const dialogueText = stage === "success"
        ? { bisayaText: "Limpyo na ang salog! Maayong pagka-mop!", englishText: "The floor is clean! Well mopped!" }
        : stage === "wash"
            ? { bisayaText: `Hugasi ang mop sa planggana! (${washCount}/3)`, englishText: `Wash the mop in the basin! (${washCount}/3)` }
            : dialogue[introStep];

    const bgImage = (stage === "intro" || stage === "wash") ? basinImg : AssetManifest.village.scenarios.house;

    return (
        <div className="iqm-overlay">
            <div className={`iqm-modal iqm-modal--scene`}>
                <button className="iqm-close" onClick={onClose}>✕</button>

                <div className="iqm-header">
                    <div className="iqm-header-text">
                        <div className="iqm-header-bisaya">{item.labelBisaya}</div>
                        <div className="iqm-header-english">{item.labelEnglish}</div>
                    </div>
                </div>

                <div className="iqm-scene-canvas" ref={containerRef}>
                    {/* Background image always renders */}
                    <img
                        src={bgImage}
                        alt="Background"
                        className={`iqm-scene-bg ${showClean ? "iqm-scene-bg--reveal" : ""}`}
                        draggable={false}
                        style={{ objectFit: (stage === "intro" || stage === "wash") ? "contain" : "cover" }}
                    />

                    {/* Wash Stage Render */}
                    {stage === "wash" && (
                        <>
                            <div
                                className={`iqm-scene-broom ${isDragging ? "iqm-scene-broom--dragging" : ""}`}
                                style={{
                                    left: `${mopWashPos.x}%`,
                                    top: `${mopWashPos.y}%`,
                                    transform: "translate(-50%, -50%) scale(1.5)",
                                    cursor: isDragging ? "grabbing" : "grab"
                                }}
                                onPointerDown={(e) => handlePointerDown(e, "wash")}
                                onPointerMove={(e) => handlePointerMove(e, "wash")}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                            >
                                {mopImg && <img src={mopImg} alt="Mop" className="iqm-scene-broom-img" style={{width: 180, height: 180}} draggable={false} />}
                            </div>

                            {!isDragging && (
                                <div className="iqm-drag-indicator" style={{ top: "35%", left: "50%" }}>
                                    <div className="iqm-drag-hand">👆</div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Mop Stage Render */}
                    {stage === "mop" && !showClean && (
                        <>
                            {quest.mopStage.dirtSpots.map(spot => {
                                const isSwept = swept.has(spot.id);
                                return (
                                    <div
                                        key={spot.id}
                                        className={`iqm-dirt-spot iqm-dirt-spot--spill ${isSwept ? "iqm-dirt-spot--swept" : ""}`}
                                        style={{
                                            left: `${spot.x}%`,
                                            top: `${spot.y}%`,
                                            width: `${spot.w}%`,
                                            height: `${spot.h}%`
                                        }}
                                    />
                                );
                            })}
                            <div className="iqm-sweep-progress">
                                {quest.mopStage.dirtSpots.map((spot, i) => (
                                    <div key={i} className={`iqm-sweep-pip ${swept.has(spot.id) ? "iqm-sweep-pip--done" : ""}`} />
                                ))}
                            </div>
                            <div
                                className={`iqm-scene-broom ${isDragging ? "iqm-scene-broom--dragging" : ""}`}
                                style={{
                                    left: `${mopFloorPos.x}%`, // using tip of broom
                                    top: `${mopFloorPos.y}%`,
                                    transform: "translate(-20%, -80%)", // offset so cursor is near mop head
                                    cursor: isDragging ? "grabbing" : "grab"
                                }}
                                onPointerDown={(e) => handlePointerDown(e, "mop")}
                                onPointerMove={(e) => handlePointerMove(e, "mop")}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                            >
                                {mopImg && <img src={mopImg} alt="Mop" className="iqm-scene-broom-img" draggable={false} />}
                            </div>
                            {!isDragging && swept.size === 0 && (
                                <div className="iqm-drag-indicator" style={{ top: "35%", left: "50%" }}>
                                    <div className="iqm-drag-hand">👆</div>
                                </div>
                            )}
                        </>
                    )}

                    {stage === "success" && showClean && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🎊✨</div>
                                <div className="iqm-scene-success-text">Nasidlak Na!</div>
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
                        {stage === "intro" && (
                            <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>
                        )}
                        {stage === "success" && (
                            <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── SceneDragDropGame — scatter items on background ──────────────────────────
const SceneDragDropGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);
    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success

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
            [draggingId]: { ...prev[draggingId], x: Math.min(Math.max(x, 2), 98), y: Math.min(Math.max(y, 2), 98) }
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
            const allPlaced = Object.values(next).every(s => s.isPlaced);
            if (allPlaced && stage !== "success") {
                setStage("success");
            }
            return next;
        });

        setDraggingId(null);
    };

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(s => s + 1);
        else setStage("playing");
    };

    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Limpyo na! Maayo kaayo! 🎉", englishText: "It's clean! Well done! 🎉" };
        const remaining = Object.values(itemsState).filter(s => !s.isPlaced).length;
        if (remaining > 0) return {
            bisayaText: `${remaining} libro pa ang nahibilin! Ibutang sa estante!`,
            englishText: `${remaining} more books left! Put them on the shelf!`,
        };
        return { bisayaText: quest.instructionBisaya, englishText: quest.instructionEnglish };
    })();

    const placedCount = Object.values(itemsState).filter(s => s.isPlaced).length;

    return (
        <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>

                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">
                        Organize the Room
                    </span>
                </div>

                <div className="iqm-scene-canvas" ref={containerRef}>
                    <img
                        src={quest.background}
                        alt="Room"
                        className="iqm-scene-bg iqm-scene-bg--reveal"
                        draggable={false}
                    />

                    {/* Progress indicator */}
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress">
                            {quest.draggableItems.map((_, i) => (
                                <span
                                    key={i}
                                    className={`iqm-sweep-pip ${i < placedCount ? "iqm-sweep-pip--done" : ""}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Drop Zones (invisible, but mapped out) */}
                    {stage !== "intro" && quest.dropZones.map(zone => (
                        <div
                            key={zone.id}
                            className={`iqm-sdd-zone ${stage === "success" ? "iqm-sdd-zone--success" : ""}`}
                            style={{
                                left: `${zone.x}%`,
                                top: `${zone.y}%`,
                                width: `${zone.w}%`,
                                height: `${zone.h}%`,
                            }}
                        />
                    ))}

                    {/* Draggable Items */}
                    {stage !== "intro" && quest.draggableItems.map(dItem => {
                        const img = ITEM_IMAGE_MAP[dItem.imageKey] || null;
                        const state = itemsState[dItem.id];
                        const isDragging = draggingId === dItem.id;
                        return (
                            <div
                                key={dItem.id}
                                className={[
                                    "iqm-sdd-item",
                                    isDragging ? "iqm-sdd-item--dragging" : "",
                                    state.isPlaced ? "iqm-sdd-item--placed" : "",
                                ].filter(Boolean).join(" ")}
                                style={{
                                    left: `${state.x}%`,
                                    top: `${state.y}%`,
                                    transform: "translate(-50%, -50%)"
                                }}
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
                        {stage === "intro" && (
                            <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>
                        )}
                        {stage === "success" && (
                            <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── WipeCharacterGame — towel wipe mechanic ────────────────────────────────
const WipeCharacterGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success
    const [wiped, setWiped] = useState(new Set());
    const [towelPos, setTowelPos] = useState({ x: quest.draggable.startX, y: quest.draggable.startY });
    const [isDragging, setIsDragging] = useState(false);
    const [showClean, setShowClean] = useState(false);
    const containerRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const towelImg = ITEM_IMAGE_MAP[quest.draggable.imageKey] || null;
    const allWiped = wiped.size >= quest.characterStage.sweatSpots.length;

    const background = showClean
        ? quest.characterStage.cleanImage
        : quest.characterStage.dirtyImage;

    // ── Pointer drag handlers ──────────────────────────────────────────────────
    const handleTowelPointerDown = (e) => {
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

    const handleTowelPointerMove = (e) => {
        if (!isDragging || stage !== "playing") return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
        const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
        const cx = Math.min(Math.max(x, 5), 90);
        const cy = Math.min(Math.max(y, 5), 85);
        setTowelPos({ x: cx, y: cy });

        // Check if towel overlaps any unwiped sweat spot
        quest.characterStage.sweatSpots.forEach(spot => {
            if (wiped.has(spot.id)) return;
            const overlap =
                cx + 4 > spot.x && cx - 4 < spot.x + spot.w &&
                cy + 4 > spot.y && cy - 4 < spot.y + spot.h;
            if (overlap) {
                setWiped(prev => {
                    const next = new Set([...prev, spot.id]);
                    if (next.size >= quest.characterStage.sweatSpots.length) {
                        // All wiped — trigger success
                        setTimeout(() => {
                            setShowClean(true);
                            setStage("success");
                        }, 300);
                    }
                    return next;
                });
            }
        });
    };

    const handleTowelPointerUp = () => setIsDragging(false);

    // ── Dialogue line ──────────────────────────────────────────────────────────
    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Presko na siya! Maayo kaayo! 🎉", englishText: "She's fresh now! Well done! 🎉" };
        const remaining = quest.characterStage.sweatSpots.length - wiped.size;
        if (remaining > 0) return {
            bisayaText: `${remaining} ka singot pa ang nahibilin! Pahiri na!`,
            englishText: `${remaining} more sweat spots to wipe!`,
        };
        return { bisayaText: quest.instructionBisaya, englishText: quest.instructionEnglish };
    })();

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(s => s + 1);
        else setStage("playing");
    };

    return (
        <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="iqm-modal iqm-modal--scene">

                <button className="iqm-close" onClick={onClose}>✕</button>

                {/* Header */}
                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">
                        Wipe the Sweat
                    </span>
                </div>

                {/* ── Scene canvas ────────────────────────────────────────────────── */}
                <div className="iqm-scene-canvas" ref={containerRef}>
                    <img
                        src={AssetManifest.village.scenarios.house}
                        alt="House Background"
                        className="iqm-scene-bg"
                        draggable={false}
                    />

                    {/* Character image (dirty/clean) - placed over background */}
                    <img
                        src={background}
                        alt="Character"
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            height: "80%",
                            objectFit: "contain",
                            pointerEvents: "none", // Prevent dragging character image
                            transition: "opacity 0.3s ease",
                        }}
                        draggable={false}
                    />

                    {/* Sweat spots */}
                    {stage !== "intro" && quest.characterStage.sweatSpots.map(spot => (
                        <div
                            key={spot.id}
                            className={[
                                "iqm-dirt-spot",
                                wiped.has(spot.id) ? "iqm-dirt-spot--swept" : "",
                            ].filter(Boolean).join(" ")}
                            style={{
                                left: `${spot.x}%`,
                                top: `${spot.y}%`,
                                width: `${spot.w}%`,
                                height: `${spot.h}%`,
                                // For debugging, you could slightly color the spots, but invisible is best for release
                                // backgroundColor: "rgba(0,0,255,0.2)",
                            }}
                        />
                    ))}

                    {/* Progress indicator */}
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress">
                            {quest.characterStage.sweatSpots.map(spot => (
                                <span
                                    key={spot.id}
                                    className={`iqm-sweep-pip ${wiped.has(spot.id) ? "iqm-sweep-pip--done" : ""}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Draggable towel */}
                    {stage !== "intro" && (
                        <div
                            className={[
                                "iqm-scene-broom",
                                isDragging ? "iqm-scene-broom--dragging" : "",
                                stage === "success" ? "iqm-scene-broom--hidden" : "",
                            ].filter(Boolean).join(" ")}
                            style={{
                                left: `${towelPos.x}%`,
                                top: `${towelPos.y}%`,
                                transform: "translate(-50%, -50%)",
                                cursor: stage === "playing" ? (isDragging ? "grabbing" : "grab") : "default",
                                zIndex: 10,
                            }}
                            onPointerDown={handleTowelPointerDown}
                            onPointerMove={handleTowelPointerMove}
                            onPointerUp={handleTowelPointerUp}
                            onPointerCancel={handleTowelPointerUp}
                        >
                            {towelImg
                                ? <img src={towelImg} alt="Toalya" className="iqm-scene-broom-img" style={{ width: 100, height: 100 }} draggable={false} />
                                : <span style={{ fontSize: 40 }}>🧻</span>
                            }
                            {/* Drag Indicator */}
                            {stage === "playing" && !isDragging && (
                                <div className="iqm-drag-indicator">
                                    <span className="iqm-drag-hand">🖐️</span>
                                </div>
                            )}
                        </div>
                    )}

                    {stage === "success" && showClean && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🎊✨</div>
                                <div className="iqm-scene-success-text">Presko Na!</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── NPC dialogue row ─────────────────────────────────────────────── */}
                <div className="iqm-dialogue-row">
                    <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
                    <div className="iqm-dialogue-bubble">
                        <div className="iqm-dialogue-speaker">{npcName}</div>
                        <div className="iqm-dialogue-text">
                            <span className="iqm-dialogue-bisaya">{dialogueText.bisayaText}</span>
                            <span className="iqm-dialogue-english">{dialogueText.englishText}</span>
                        </div>
                        {stage === "intro" && (
                            <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>
                        )}
                        {stage === "success" && (
                            <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

// ── AlphabeticalSortGame — arrange books alphabetically ───────────────────────
const AlphabeticalSortGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);
    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success

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
            [draggingId]: { ...prev[draggingId], x: Math.min(Math.max(x, 2), 98), y: Math.min(Math.max(y, 2), 98) }
        }));
    };

    const handlePointerUp = (e) => {
        if (!draggingId) return;
        const currentItemState = itemsState[draggingId];
        const itemConfig = quest.draggableItems.find(i => i.id === draggingId);
        const targetZone = quest.dropZones.find(z => z.id === itemConfig.correctZone);

        let placed = false;
        let newX = currentItemState.x;
        let newY = currentItemState.y;

        if (targetZone) {
            const { x, y } = currentItemState;
            // Center of book must be within the target zone bounds (zone x/y are top-left)
            if (x >= targetZone.x && x <= targetZone.x + targetZone.w &&
                y >= targetZone.y && y <= targetZone.y + targetZone.h) {
                placed = true;
                // Snap to center of zone
                newX = targetZone.x + targetZone.w / 2;
                newY = targetZone.y + targetZone.h / 2;
            }
        }

        // Remove native pointer capture on some browsers to prevent unexpected behaviours
        if (e && e.currentTarget && e.pointerId) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }

        setItemsState(prev => {
            const next = { ...prev, [draggingId]: { ...prev[draggingId], x: newX, y: newY, isPlaced: placed } };
            const allPlaced = Object.values(next).every(s => s.isPlaced);
            if (allPlaced && stage !== "success") {
                setStage("success");
            }
            return next;
        });

        setDraggingId(null);
    };

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(s => s + 1);
        else setStage("playing");
    };

    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Nahan-ay na! Maayo kaayo! 🎉", englishText: "It's sorted! Well done! 🎉" };
        const remaining = Object.values(itemsState).filter(s => !s.isPlaced).length;
        if (remaining > 0) return {
            bisayaText: `${remaining} libro pa ang nahibilin! Ibutang sa estante pinaagi sa alpabeto!`,
            englishText: `${remaining} more books left! Put them on the shelf alphabetically!`,
        };
        return { bisayaText: quest.instructionBisaya, englishText: quest.instructionEnglish };
    })();

    const placedCount = Object.values(itemsState).filter(s => s.isPlaced).length;

    return (
        <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>

                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">
                        Sort Alphabetically
                    </span>
                </div>

                <div className="iqm-scene-canvas" ref={containerRef}>
                    <img
                        src={quest.background}
                        alt="Room"
                        className="iqm-scene-bg iqm-scene-bg--reveal"
                        draggable={false}
                    />

                    {/* Progress indicator */}
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress">
                            {quest.draggableItems.map((_, i) => (
                                <span
                                    key={i}
                                    className={`iqm-sweep-pip ${i < placedCount ? "iqm-sweep-pip--done" : ""}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Drop Zones (invisible, but mapped out) */}
                    {stage !== "intro" && quest.dropZones.map(zone => (
                        <div
                            key={zone.id}
                            className={`iqm-sdd-zone ${stage === "success" ? "iqm-sdd-zone--success" : ""}`}
                            style={{
                                left: `${zone.x}%`,
                                top: `${zone.y}%`,
                                width: `${zone.w}%`,
                                height: `${zone.h}%`,
                                border: '2px dashed rgba(255, 255, 255, 0.4)' // Optional guide
                            }}
                        />
                    ))}

                    {/* Draggable Items */}
                    {stage !== "intro" && quest.draggableItems.map(dItem => {
                        const state = itemsState[dItem.id];
                        const isDragging = draggingId === dItem.id;
                        return (
                            <div
                                key={dItem.id}
                                className={[
                                    "iqm-sdd-item",
                                    isDragging ? "iqm-sdd-item--dragging" : "",
                                ].filter(Boolean).join(" ")}
                                style={{
                                    left: `${state.x}%`,
                                    top: `${state.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    width: "5%",
                                    height: "14%",
                                    backgroundColor: dItem.letter === "A" ? "#e63946" :
                                        dItem.letter === "B" ? "#f4a261" :
                                            dItem.letter === "C" ? "#2a9d8f" :
                                                "#264653",
                                    border: "2px solid #1a1a1a",
                                    borderRadius: "3px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: isDragging ? "2px 10px 15px rgba(0,0,0,0.5)" : "2px 4px 5px rgba(0,0,0,0.4)",
                                    zIndex: isDragging ? 20 : (state.isPlaced ? 5 : 10),
                                    cursor: state.isPlaced ? "default" : (isDragging ? "grabbing" : "grab"),
                                    transition: isDragging ? "none" : "all 0.3s ease",
                                }}
                                onPointerDown={(e) => handlePointerDown(dItem.id, e)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                            >
                                <div style={{
                                    width: "80%",
                                    height: "90%",
                                    borderLeft: "2px solid rgba(255,255,255,0.3)",
                                    borderRight: "2px solid rgba(0,0,0,0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative"
                                }}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        fontFamily: "'Fredoka One', cursive",
                                        fontSize: '1.8vw',
                                        color: '#fff',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                    }}>
                                        {dItem.letter}
                                    </span>
                                </div>
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
                        {stage === "intro" && (
                            <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>
                        )}
                        {stage === "success" && (
                            <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── ItemQuestModal — router ───────────────────────────────────────────────────
const ItemQuestModal = ({ item, npcName, npcImage, onClose, onComplete }) => {
    const quest = ITEM_QUESTS[item.id] || ITEM_QUESTS._default;

    if (quest.mechanic === "scene_drag") {
        return (
            <SceneDragGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />
        );
    }

    if (quest.mechanic === "scene_drag_drop") {
        return (
            <SceneDragDropGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />
        );
    }

    if (quest.mechanic === "alphabetical_sort") {
        return (
            <AlphabeticalSortGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />
        );
    }

    if (quest.mechanic === "wash_and_mop") {
        return (
            <WashAndMopGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />
        );
    }

    if (quest.mechanic === "wipe_character") {
        return (
            <WipeCharacterGame quest={quest} item={item} npcName={npcName} npcImage={npcImage} onClose={onClose} onComplete={onComplete} />
        );
    }

    // ── Standard modal for drag_drop / item_association ───────────────────────
    const dialogue = buildQuestDialogue(quest, item);

    const [stage, setStage] = useState("intro");
    const [introStep, setIntroStep] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [draggedId, setDraggedId] = useState(null);
    const [shake, setShake] = useState(null);
    const [dropHover, setDropHover] = useState(null);
    const [placed, setPlaced] = useState({});

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(s => s + 1);
        else setStage("playing");
    };

    const handleIAClick = useCallback((clickedItem) => {
        if (stage !== "playing") return;
        setSelectedId(clickedItem.id);
        if (clickedItem.isCorrect) {
            setStage("success");
            // waits for user checkmark
        } else {
            setStage("fail");
            setTimeout(() => { setStage("playing"); setSelectedId(null); }, 1000);
        }
    }, [stage, item, onComplete]);

    const handleDragStart = (card, e) => {
        if (placed[card.id]) return;
        e.dataTransfer.setData("cardId", card.id);
        setDraggedId(card.id);
    };

    const handleDrop = useCallback((zoneId, e) => {
        e.preventDefault();
        setDropHover(null);
        const cardId = e.dataTransfer.getData("cardId");
        setDraggedId(null);
        const card = quest.items.find(c => c.id === cardId);
        if (!card) return;
        if (card.isCorrect && card.correctZone === zoneId) {
            setPlaced(p => {
                const nextPlaced = { ...p, [cardId]: zoneId };
                const requiredItems = quest.items.filter(c => c.isCorrect);
                const isAllPlaced = requiredItems.every(c => nextPlaced[c.id] === c.correctZone);
                if (isAllPlaced) setStage("success");
                return nextPlaced;
            });
        } else {
            setShake(cardId);
            setStage("fail");
            setTimeout(() => { setShake(null); setStage("playing"); }, 900);
        }
    }, [quest, item, onComplete]);

    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Tama! Maayo kaayo! 🎉", englishText: "Correct! Well done! 🎉" };
        if (stage === "fail") return { bisayaText: "Sayop! Sulayi pag-usab!", englishText: "Wrong! Try again!" };
        return { bisayaText: quest.instructionBisaya, englishText: quest.instructionEnglish };
    })();

    return (
        <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="iqm-modal">
                <button className="iqm-close" onClick={onClose}>✕</button>

                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className={`iqm-mechanic-badge iqm-mechanic-badge--${quest.mechanic}`}>
                        {quest.mechanic === "drag_drop" ? "Drag & Drop" : "Choose the Answer"}
                    </span>
                </div>

                <div className="iqm-game-area">
                    {stage !== "intro" && quest.mechanic === "item_association" && (
                        <div className="iqm-ia-grid">
                            {quest.items.map(qItem => {
                                const img = ITEM_IMAGE_MAP[qItem.imageKey] || null;
                                const isSelected = selectedId === qItem.id;
                                const stateClass = isSelected
                                    ? stage === "success" ? "iqm-ia-card--correct" : "iqm-ia-card--wrong"
                                    : "";
                                return (
                                    <button
                                        key={qItem.id}
                                        className={`iqm-ia-card ${stateClass}`}
                                        onClick={() => handleIAClick(qItem)}
                                        disabled={stage !== "playing"}
                                    >
                                        {img
                                            ? <img src={img} alt={qItem.label} className="iqm-ia-img" draggable={false} />
                                            : <span className="iqm-ia-emoji">🖼️</span>
                                        }
                                        <span className="iqm-ia-label">{qItem.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {stage !== "intro" && quest.mechanic === "drag_drop" && (
                        <div className="iqm-dd-area">
                            <div className="iqm-dd-cards">
                                {quest.items.map(card => {
                                    const img = ITEM_IMAGE_MAP[card.imageKey] || null;
                                    const isPlaced = !!placed[card.id];
                                    const isShaking = shake === card.id;
                                    return (
                                        <div
                                            key={card.id}
                                            className={[
                                                "iqm-dd-card",
                                                isPlaced ? "iqm-dd-card--placed" : "",
                                                isShaking ? "iqm-dd-card--shake" : "",
                                                draggedId === card.id ? "iqm-dd-card--dragging" : "",
                                            ].filter(Boolean).join(" ")}
                                            draggable={!isPlaced}
                                            onDragStart={(e) => handleDragStart(card, e)}
                                            onDragEnd={() => setDraggedId(null)}
                                        >
                                            {img
                                                ? <img src={img} alt={card.label} className="iqm-dd-card-img" draggable={false} />
                                                : <span className="iqm-dd-card-emoji">🖼️</span>
                                            }
                                            <span className="iqm-dd-card-label">{card.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="iqm-dd-zones">
                                {quest.zones.map(zone => {
                                    const placedCards = quest.items.filter(c => placed[c.id] === zone.id);
                                    return (
                                        <div
                                            key={zone.id}
                                            className={[
                                                "iqm-dd-zone",
                                                dropHover === zone.id ? "iqm-dd-zone--hover" : "",
                                                placedCards.length ? "iqm-dd-zone--filled" : "",
                                            ].filter(Boolean).join(" ")}
                                            onDragOver={(e) => { e.preventDefault(); setDropHover(zone.id); }}
                                            onDragLeave={() => setDropHover(null)}
                                            onDrop={(e) => handleDrop(zone.id, e)}
                                        >
                                            <span className="iqm-dd-zone-label">{zone.label}</span>
                                            {placedCards.map(c => {
                                                const img = ITEM_IMAGE_MAP[c.imageKey] || null;
                                                return img
                                                    ? <img key={c.id} src={img} alt={c.label} className="iqm-dd-zone-img" draggable={false} />
                                                    : <span key={c.id} className="iqm-dd-chip">{c.label}</span>;
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {stage === "intro" && (
                        <div className="iqm-intro-placeholder">
                            <div className={`iqm-intro-icon iqm-intro-icon--${quest.mechanic}`}>
                                {quest.mechanic === "drag_drop" ? "↕" : "?"}
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
                        {stage === "intro" && (
                            <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>
                        )}
                        {stage === "success" && (
                            <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemQuestModal;