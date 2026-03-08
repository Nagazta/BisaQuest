// ─────────────────────────────────────────────────────────────────────────────
//  FarmPage.jsx  —  Scenario-driven Village quest page (Nando's Farm)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import BookCollectModal from "../../game/components/BookCollectModal";

import NandoCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_3.png";
import VicenteCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_1.png";
import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import farmBackground from "../../assets/images/environments/scenario/farm.png";
import wateringCanWater from "../../assets/items/wateringCan-water.png";

import { ITEM_IMAGE_MAP } from "../../game/dragDropConstants";
import {
    getPlayerId,
    saveNPCProgress,
    awardLibroPage,
    getLibroPageCount,
    getLibroPageCountForEnv,
} from "../../utils/playerStorage";
import "./FarmPage.css";

// ── NPC map ───────────────────────────────────────────────────────────────────
const NPC_IMAGES = {
    village_npc_3: NandoCharacter,
    village_npc_1: VicenteCharacter,
    village_npc_2: LigayaCharacter,
};



// ── Placed-state image overrides (imageKey → active asset) ───────────────────
const ZONE_PLACED_IMAGES = {
    wateringcan: wateringCanWater,
    watering_can: wateringCanWater,
    regadera: wateringCanWater,
};

// ── Farm drop zone registry ───────────────────────────────────────────────────
const SCENE_DROP_ZONES = {
    farm: {
        soil_patch_1: { x: 13, y: 50 },
        soil_patch_2: { x: 95, y: 50 },
        soil_patch_3: { x: 60, y: 50 },
        basket_farm: { x: 75, y: 55 },
        water_trough: { x: 50, y: 40 },
        barn_door: { x: 82, y: 38 },
        fence_left: { x: 15, y: 42 },
        fence_right: { x: 85, y: 42 },
    },
};

const resolveDropZones = (zoneKey, sceneZones) => {
    if (!zoneKey || !sceneZones) return [];
    return zoneKey.split(",")
        .map(k => k.trim())
        .filter(k => k && sceneZones[k])
        .map(k => ({ key: k, ...sceneZones[k] }));
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const isNarration = (s) => typeof s === "string" && s.toLowerCase() === "narration";
const isPlayer = (s) => typeof s === "string" && s.toLowerCase() === "player";
const resolveSpeaker = (speaker, fallback) => {
    if (!speaker) return fallback;
    if (isNarration(speaker)) return "Narration";
    if (isPlayer(speaker)) return "Player";
    return speaker;
};

const Phase = {
    STORY: "story",
    COMPREHENSION: "comprehension",
    COMP_BRANCH: "comp_branch",
    DRAG_DROP: "drag_drop",
    FEEDBACK: "feedback",
    DONE: "done",
};

const groupByFlow = (rows) => {
    const g = {};
    for (const r of rows) {
        const key = r.flow_type || "main";
        if (!g[key]) g[key] = [];
        g[key].push(r);
    }
    for (const key of Object.keys(g)) {
        g[key].sort((a, b) => Number(a.step_order) - Number(b.step_order));
    }
    return g;
};

// ── Comprehension card (text-only) ────────────────────────────────────────────
const CompCard = ({ item, onSelect, locked, result }) => {
    const stateClass = result === "correct" ? "fp-comp-card--correct"
        : result === "wrong" ? "fp-comp-card--wrong"
            : "";

    return (
        <div
            className={`fp-comp-card fp-comp-card--text-only ${stateClass} ${locked ? "fp-comp-card--locked" : ""}`}
            onClick={() => !locked && onSelect(item)}
            role="button"
            tabIndex={locked ? -1 : 0}
            onKeyDown={e => e.key === "Enter" && !locked && onSelect(item)}
        >
            <span className="fp-comp-card-text">{item.label}</span>
            {result === "correct" && <div className="fp-comp-card-badge fp-comp-card-badge--correct">✓</div>}
            {result === "wrong" && <div className="fp-comp-card-badge fp-comp-card-badge--wrong">✗</div>}
        </div>
    );
};

// ── Component ─────────────────────────────────────────────────────────────────
const FarmPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const playerId = getPlayerId();
    const API = import.meta.env.VITE_API_URL || "";

    const questId = location.state?.questId || null;
    const npcId = location.state?.npcId || "village_npc_3";
    const npcName = location.state?.npcName || "Nando";
    const returnTo = location.state?.returnTo || "/student/village";
    const questSequence = location.state?.questSequence || [];
    const seqIndex = location.state?.sequenceIndex ?? 0;

    const NpcImage = NPC_IMAGES[npcId] || NandoCharacter;

    // ── State ──────────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [background, setBackground] = useState(farmBackground);
    const [flowGroups, setFlowGroups] = useState({});
    const [compItems, setCompItems] = useState([]);
    const [ddWordCards, setDdWordCards] = useState([]);
    const [ddDropZoneLabel, setDdDropZoneLabel] = useState("");
    const [ddInstruction, setDdInstruction] = useState("");

    const [phase, setPhase] = useState(Phase.STORY);
    const [storyIdx, setStoryIdx] = useState(0);
    const [branchKey, setBranchKey] = useState(null);
    const [branchIdx, setBranchIdx] = useState(0);
    const [feedbackKey, setFeedbackKey] = useState(null);
    const [feedbackIdx, setFeedbackIdx] = useState(0);

    const [compResult, setCompResult] = useState({});
    const [compLocked, setCompLocked] = useState(false);

    const [ddIntroItems, setDdIntroItems] = useState(null);
    const [ddPlaced, setDdPlaced] = useState({});
    const [ddShake, setDdShake] = useState(null);
    const [ddCompleted, setDdCompleted] = useState(false);
    const [draggingWord, setDraggingWord] = useState(null);
    const [dropHover, setDropHover] = useState(null);
    const [ddDropZones, setDdDropZones] = useState([]);
    const [ddDropMode, setDdDropMode] = useState("equip");
    const [gridMode, setGridMode] = useState(false);
    const [hoverCell, setHoverCell] = useState(null);

    // ── Modal state ────────────────────────────────────────────────────────────
    const [showPageModal, setShowPageModal] = useState(false);
    const [collectedPage, setCollectedPage] = useState(null);

    const containerRef = useRef(null);

    // ── Derived ────────────────────────────────────────────────────────────────
    const currentRow = (() => {
        if (phase === Phase.STORY) return flowGroups.main?.[storyIdx] ?? null;
        if (phase === Phase.COMP_BRANCH) return flowGroups[branchKey]?.[branchIdx] ?? null;
        if (phase === Phase.FEEDBACK) return flowGroups[feedbackKey]?.[feedbackIdx] ?? null;
        return null;
    })();

    const isLastStoryStep = flowGroups.main
        ? storyIdx === flowGroups.main.length - 1
        : false;

    // ── Load quest data ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!questId) { setFetchError("No quest selected."); setLoading(false); return; }
        let cancelled = false;

        const load = async () => {
            try {
                // ── DEV MOCK: bypass API for mock quest IDs ─────────────────────
                let meta, dialogues, rawItems;
                if (questId?.startsWith?.('mock_')) {
                    const { getMockQuestData } = await import('../../game/mockData/villageQuestMocks.js');
                    const mock = getMockQuestData(questId);
                    if (!mock) throw new Error(`Mock quest "${questId}" not found.`);
                    meta = mock.meta; dialogues = mock.dialogues; rawItems = mock.items;
                } else {
                    const [metaRes, dialoguesRes, itemsRes] = await Promise.all([
                        fetch(`${API}/api/challenge/quest/${questId}`),
                        fetch(`${API}/api/challenge/quest/${questId}/dialogues`),
                        fetch(`${API}/api/challenge/quest/${questId}/items?randomize=false`),
                    ]);
                    if (!metaRes.ok || !dialoguesRes.ok || !itemsRes.ok)
                        throw new Error("Failed to load quest data.");
                    ({ data: meta } = await metaRes.json());
                    ({ data: dialogues } = await dialoguesRes.json());
                    ({ data: rawItems } = await itemsRes.json());
                }

                if (cancelled) return;


                setDdInstruction(meta?.instructions || "");
                if (!dialogues?.length) throw new Error("No dialogues found.");
                setFlowGroups(groupByFlow(dialogues));

                const sorted = [...(rawItems || [])].sort(
                    (a, b) => Number(a.display_order ?? 99) - Number(b.display_order ?? 99)
                );

                // Phase 2 — comprehension (round_number = 0)
                setCompItems(
                    sorted.filter(r => Number(r.round_number) === 0).map(r => ({
                        id: String(r.item_id),
                        label: r.label,
                        imageKey: r.image_key || null,
                        isCorrect: Boolean(r.is_correct),
                        belongsTo: r.belongs_to || null,
                        x: Number(r.position_x ?? 30),
                        y: Number(r.position_y ?? 30),
                    }))
                );

                // Phase 3 — DD (round_number = 1)
                const ddRaw = sorted.filter(r => Number(r.round_number) === 1);
                const correctDDItems = ddRaw.filter(r => Boolean(r.is_correct));
                setDdDropZoneLabel(correctDDItems[0]?.label || "");
                setDdIntroItems(correctDDItems.length > 0
                    ? correctDDItems.map(item => ({ id: String(item.item_id), label: item.label, imageKey: item.image_key || null }))
                    : null
                );

                const scene = meta?.scene_type || "farm";
                const zoneKey = correctDDItems[0]?.correct_zone || null;
                const sceneZones = SCENE_DROP_ZONES[scene] || SCENE_DROP_ZONES["farm"];
                const zones = resolveDropZones(zoneKey, sceneZones);
                setDdDropMode(zones.length > 0 ? "scene" : "equip");
                setDdDropZones(zones);

                setDdWordCards(
                    ddRaw.map(r => ({
                        id: String(r.item_id),
                        label: r.label,
                        imageKey: r.image_key || null,
                        isCorrect: Boolean(r.is_correct),
                        belongsTo: r.belongs_to || null,
                        x: Number(r.position_x ?? 50),
                        y: Number(r.position_y ?? 55),
                    }))
                );

                setDdPlaced({});
                setLoading(false);
            } catch (err) {
                if (!cancelled) { setFetchError(err.message); setLoading(false); }
            }
        };

        load();
        return () => { cancelled = true; };
    }, [questId, API]);

    // ── Navigation ────────────────────────────────────────────────────────────
    const handleNext = useCallback(() => {
        if (phase === Phase.STORY) {
            if (!isLastStoryStep) { setStoryIdx(i => i + 1); }
            else { compItems.length > 0 ? setPhase(Phase.COMPREHENSION) : setPhase(Phase.DRAG_DROP); }
            return;
        }
        if (phase === Phase.COMP_BRANCH) {
            const rows = flowGroups[branchKey] || [];
            if (branchIdx < rows.length - 1) { setBranchIdx(i => i + 1); }
            else if (branchKey === "correct_comp") {
                setCompLocked(false);
                setCompResult({});
                setPhase(Phase.DRAG_DROP);
            } else {
                setCompLocked(false);
                setCompResult({});
                setBranchKey(null);
                setBranchIdx(0);
                setPhase(Phase.COMPREHENSION);
            }
            return;
        }
        if (phase === Phase.FEEDBACK) {
            const rows = flowGroups[feedbackKey] || [];
            if (feedbackIdx < rows.length - 1) { setFeedbackIdx(i => i + 1); }
            else if (feedbackKey === "correct") {
                submitProgress();
            } else {
                setDdPlaced({});
                setDdShake(null);
                setDdCompleted(false);
                setFeedbackKey(null);
                setFeedbackIdx(0);
                setPhase(Phase.DRAG_DROP);
            }
            return;
        }
    }, [phase, isLastStoryStep, branchKey, branchIdx, feedbackKey, feedbackIdx, flowGroups, compItems]);

    // ── Phase 2: Comprehension ────────────────────────────────────────────────
    const handleCompSelect = useCallback((item) => {
        if (compLocked) return;
        setCompLocked(true);

        if (item.isCorrect) {
            setCompResult({ [item.id]: "correct" });
            const target = flowGroups["correct_comp"] ? "correct_comp" : null;
            if (!target) { setPhase(Phase.DRAG_DROP); return; }
            setBranchKey("correct_comp");
            setBranchIdx(0);
            setPhase(Phase.COMP_BRANCH);
        } else {
            setCompResult({ [item.id]: "wrong" });
            const wrongKeys = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));
            const target = (item.belongsTo && flowGroups[item.belongsTo])
                ? item.belongsTo
                : (() => {
                    const words = item.label.toLowerCase().split(/[\s/,_-]+/);
                    const match = wrongKeys.find(k => words.some(w => w.length > 2 && k.includes(w)));
                    return (match && flowGroups[match]) ? match : wrongKeys[0] || null;
                })();
            if (!target) { setCompLocked(false); setCompResult({}); return; }
            setBranchKey(target);
            setBranchIdx(0);
            setPhase(Phase.COMP_BRANCH);
        }
    }, [compLocked, flowGroups]);

    // ── Phase 3: DD handlers ──────────────────────────────────────────────────
    const handleWordDragStart = (card, e) => {
        if (ddPlaced[card.id] !== undefined) return;
        e.dataTransfer.setData("cardId", card.id);
        setDraggingWord(card.id);
    };

    const handleDropZoneDragOver = (e) => { e.preventDefault(); };
    const makeZoneDragEnter = (zoneKey) => () => setDropHover(zoneKey);
    const makeZoneDragLeave = (zoneKey) => () => setDropHover(prev => prev === zoneKey ? null : prev);

    const makeZoneDrop = useCallback((zoneKey) => (e) => {
        e.preventDefault();
        setDropHover(null);
        const cardId = e.dataTransfer.getData("cardId");
        setDraggingWord(null);
        const card = ddWordCards.find(c => c.id === cardId);
        if (!card) return;

        if (card.isCorrect) {
            const newPlaced = { ...ddPlaced, [cardId]: zoneKey };
            setDdPlaced(newPlaced);
            const allPlaced = ddWordCards.filter(c => c.isCorrect).every(c => newPlaced[c.id] !== undefined);
            if (allPlaced) setDdCompleted(true);
        } else {
            setDdShake(cardId);
            setTimeout(() => setDdShake(null), 600);
            const wrongKeys = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));
            const target = (card.belongsTo && flowGroups[card.belongsTo])
                ? card.belongsTo
                : (() => {
                    const words = (card.label || "").toLowerCase().split(/[\s/,_-]+/);
                    const match = wrongKeys.find(k => words.some(w => w.length > 2 && k.includes(w)));
                    if (match && flowGroups[match]) return match;
                    if (wrongKeys.length > 0) return wrongKeys[0];
                    if (flowGroups["wrong"]) return "wrong";
                    return null;
                })();
            if (target) { setFeedbackKey(target); setFeedbackIdx(0); setPhase(Phase.FEEDBACK); }
        }
    }, [ddWordCards, ddPlaced, flowGroups]);

    const handleEquipDrop = useCallback((e) => {
        e.preventDefault();
        setDropHover(null);
        const cardId = e.dataTransfer.getData("cardId");
        setDraggingWord(null);
        const card = ddWordCards.find(c => c.id === cardId);
        if (!card) return;

        if (card.isCorrect) {
            const newPlaced = { ...ddPlaced, [cardId]: "equip" };
            setDdPlaced(newPlaced);
            const allPlaced = ddWordCards.filter(c => c.isCorrect).every(c => newPlaced[c.id] !== undefined);
            if (allPlaced) setDdCompleted(true);
        } else {
            setDdShake(cardId);
            setTimeout(() => setDdShake(null), 600);
            const wrongKeys = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));
            const target = (card.belongsTo && flowGroups[card.belongsTo])
                ? card.belongsTo
                : (() => {
                    const words = (card.label || "").toLowerCase().split(/[\s/,_-]+/);
                    const match = wrongKeys.find(k => words.some(w => w.length > 2 && k.includes(w)));
                    if (match && flowGroups[match]) return match;
                    if (wrongKeys.length > 0) return wrongKeys[0];
                    if (flowGroups["wrong"]) return "wrong";
                    return null;
                })();
            if (target) { setFeedbackKey(target); setFeedbackIdx(0); setPhase(Phase.FEEDBACK); }
        }
    }, [ddWordCards, ddPlaced, flowGroups]);

    const handleDDComplete = () => {
        if (!ddCompleted) return;
        const target = flowGroups["correct"] ? "correct" : null;
        if (!target) { submitProgress(); return; }
        setFeedbackKey("correct");
        setFeedbackIdx(0);
        setPhase(Phase.FEEDBACK);
    };

    // ── Submit + advance ──────────────────────────────────────────────────────
    const submitProgress = () => {
        // Collect only the words from this specific quest's loaded items
        const words = [...new Set(ddWordCards.map(c => c.label))];
        saveNPCProgress("village", npcId, 1, true, 3, words);

        const isNewPage = awardLibroPage("village", npcId);
        if (isNewPage) {
            const pageNumber = getLibroPageCountForEnv("village");
            const totalCollected = getLibroPageCount();
            setCollectedPage({ pageNumber, totalCollected });
            setShowPageModal(true);
            return;
        }

        if (playerId) {
            fetch(`${API}/api/challenge/quest/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playerId, questId, npcId, score: 1, maxScore: 1, passed: true }),
            }).catch(err => console.warn("[FarmPage] submit failed:", err));
        }

        advanceSequence();
    };

    const advanceSequence = useCallback(() => {
        const nextIndex = seqIndex + 1;
        const nextStep = questSequence[nextIndex];
        if (!nextStep) { navigate(returnTo, { state: { completed: true } }); return; }
        navigate("/student/farm", {
            state: {
                questId: nextStep.questId, npcId, npcName, returnTo,
                questSequence, sequenceIndex: nextIndex, sceneType: nextStep.sceneType,
            },
        });
    }, [seqIndex, questSequence, navigate, returnTo, npcId, npcName]);

    const handleBack = () => navigate(returnTo);

    // ── Dialogue ──────────────────────────────────────────────────────────────
    const currentSpeaker = currentRow?.speaker || null;
    const dialogueSpeaker = currentRow ? resolveSpeaker(currentSpeaker, npcName) : npcName;

    const dialogueText = (() => {
        if (loading) return "...";
        if (currentRow) return currentRow.dialogue_text || "";
        if (phase === Phase.COMPREHENSION)
            return flowGroups.main?.[flowGroups.main.length - 2]?.dialogue_text
                || "Pilia ang husto! Click the correct one!";
        if (phase === Phase.DRAG_DROP) return ddCompleted
            ? "Tama! Now click Complete to confirm!"
            : (ddInstruction || "Drag the correct word card to the picture!");
        return "";
    })();

    const showNextBtn = !!(currentRow) && phase !== Phase.COMPREHENSION && phase !== Phase.DRAG_DROP;

    const rightSlot = phase === Phase.DRAG_DROP ? (
        <div className="fp-dd-bar-slot-wrap">
            {ddDropMode === "equip" && (
                <div
                    className={[
                        "fp-dd-equip-slot",
                        dropHover === "equip" ? "fp-dd-equip-slot--hover" : "",
                        ddCompleted ? "fp-dd-equip-slot--complete" : "",
                    ].filter(Boolean).join(" ")}
                    onDragOver={(e) => { e.preventDefault(); setDropHover("equip"); }}
                    onDragLeave={() => setDropHover(null)}
                    onDrop={handleEquipDrop}
                >
                    {ddWordCards.filter(c => ddPlaced[c.id] === "equip").length > 0
                        ? <div className="fp-dd-equip-chips">
                            {ddWordCards.filter(c => ddPlaced[c.id] === "equip").map(c => {
                                const activeImg = c.imageKey
                                    ? ZONE_PLACED_IMAGES[c.imageKey.trim().toLowerCase()]
                                    : null;
                                return activeImg ? (
                                    <img
                                        key={c.id}
                                        src={activeImg}
                                        alt={c.label}
                                        className="fp-dd-placed-img"
                                        draggable={false}
                                    />
                                ) : (
                                    <span key={c.id} className="fp-dd-chip fp-dd-chip--correct">{c.label}</span>
                                );
                            })}
                        </div>
                        : <span className="fp-dd-equip-hint">Drop here</span>
                    }
                </div>
            )}
            <button
                className={`fp-complete-btn ${ddCompleted ? "fp-complete-btn--active" : "fp-complete-btn--disabled"}`}
                onClick={handleDDComplete}
                disabled={!ddCompleted}
            >
                Completo na!
            </button>
        </div>
    ) : null;

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="fp-container">
            <img src={farmBackground} alt="" className="fp-background" draggable={false} />
            <div className="fp-loading"><span>Gi-load ang dula...</span></div>
        </div>
    );

    if (fetchError) return (
        <div className="fp-container">
            <img src={farmBackground} alt="" className="fp-background" draggable={false} />
            <div className="fp-loading">
                <p style={{ color: "#fff", fontFamily: "'Fredoka One', cursive", fontSize: 18 }}>{fetchError}</p>
                <Button variant="back" onClick={handleBack}>← Back</Button>
            </div>
        </div>
    );

    return (
        <div className="fp-container">
            <img src={background} alt="Farm" className="fp-background" draggable={false} />
            <Button variant="back" className="fp-back" onClick={handleBack}>← Back</Button>

            <button
                className={`fp-grid-btn ${gridMode ? "fp-grid-btn--on" : ""}`}
                onClick={() => setGridMode(p => !p)}
            >
                {gridMode ? "📐 Grid ON" : "📐 Grid"}
            </button>

            <div className="fp-scene-label">
                {phase === Phase.STORY && "Story Introduction"}
                {phase === Phase.COMPREHENSION && "Comprehension Check"}
                {phase === Phase.COMP_BRANCH && "Comprehension Check"}
                {phase === Phase.DRAG_DROP && "Drag & Drop Activity"}
                {phase === Phase.FEEDBACK && "Feedback"}
            </div>

            {/* Phase 2: Comprehension */}
            {phase === Phase.COMPREHENSION && (
                <div className="fp-comp-wrap">
                    <div className="fp-comp-grid">
                        {compItems.map(item => (
                            <CompCard
                                key={item.id}
                                item={item}
                                onSelect={handleCompSelect}
                                locked={compLocked}
                                result={compResult[item.id] || null}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Phase 3: Drag & Drop */}
            {phase === Phase.DRAG_DROP && (
                <div className="fp-dd-scene" ref={containerRef}>

                    {ddDropMode === "scene" && ddDropZones.map(zone => (
                        <div
                            key={zone.key}
                            className={[
                                "fp-dd-dropzone",
                                dropHover === zone.key ? "fp-dd-dropzone--hover" : "",
                                ddCompleted ? "fp-dd-dropzone--complete" : "",
                            ].filter(Boolean).join(" ")}
                            style={{
                                left: `${Math.min(Math.max(zone.x, 5), 85)}%`,
                                top: `${Math.min(Math.max(zone.y, 5), 72)}%`,
                            }}
                            onDragOver={handleDropZoneDragOver}
                            onDragEnter={makeZoneDragEnter(zone.key)}
                            onDragLeave={makeZoneDragLeave(zone.key)}
                            onDrop={makeZoneDrop(zone.key)}
                        >
                            <div className="fp-dd-placed-chips">
                                {ddWordCards.filter(c => ddPlaced[c.id] === zone.key).map(c => {
                                    const activeImg = c.imageKey
                                        ? ZONE_PLACED_IMAGES[c.imageKey.trim().toLowerCase()]
                                        : null;
                                    return activeImg ? (
                                        <img
                                            key={c.id}
                                            src={activeImg}
                                            alt={c.label}
                                            className="fp-dd-placed-img"
                                            draggable={false}
                                        />
                                    ) : (
                                        <span key={c.id} className="fp-dd-chip fp-dd-chip--correct">{c.label}</span>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {ddWordCards.map(card => {
                        const placed = ddPlaced[card.id] !== undefined;
                        const shaking = ddShake === card.id;
                        const imgSrc = card.imageKey
                            ? (ITEM_IMAGE_MAP[card.imageKey.trim().toLowerCase()] || ITEM_IMAGE_MAP[card.imageKey] || null)
                            : null;
                        return (
                            <div
                                key={card.id}
                                className={[
                                    "fp-dd-card",
                                    placed ? "fp-dd-card--placed" : "",
                                    shaking ? "fp-dd-card--shake" : "",
                                    draggingWord === card.id ? "fp-dd-card--dragging" : "",
                                ].filter(Boolean).join(" ")}
                                style={{
                                    left: `${Math.min(Math.max(card.x, 5), 88)}%`,
                                    top: `${Math.min(Math.max(card.y, 5), 72)}%`,
                                    transform: "translate(-50%, -50%)",
                                }}
                                draggable={!placed}
                                onDragStart={(e) => handleWordDragStart(card, e)}
                                onDragEnd={() => setDraggingWord(null)}
                            >
                                {imgSrc
                                    ? <img src={imgSrc} alt={card.label} className="fp-dd-card-img" draggable={false} />
                                    : <span className="fp-dd-card-emoji">🖼️</span>
                                }
                                <span className="fp-dd-card-label">{card.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Dev grid */}
            {gridMode && (
                <div
                    className="fp-grid-overlay"
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoverCell({
                            x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
                            y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
                        });
                    }}
                    onMouseLeave={() => setHoverCell(null)}
                >
                    {Array.from({ length: 11 }, (_, i) => <div key={`v${i}`} className="fp-grid-line fp-grid-line--v" style={{ left: `${i * 10}%` }} />)}
                    {Array.from({ length: 11 }, (_, i) => <div key={`h${i}`} className="fp-grid-line fp-grid-line--h" style={{ top: `${i * 10}%` }} />)}
                    {Array.from({ length: 10 }, (_, i) => <span key={`xl${i}`} className="fp-grid-label fp-grid-label--x" style={{ left: `${i * 10 + 5}%`, top: 2 }}>{i * 10 + 5}</span>)}
                    {Array.from({ length: 10 }, (_, i) => <span key={`yl${i}`} className="fp-grid-label fp-grid-label--y" style={{ top: `${i * 10 + 5}%`, left: 4 }}>{i * 10 + 5}</span>)}
                    {hoverCell && (
                        <>
                            <div className="fp-grid-crosshair fp-grid-crosshair--v" style={{ left: `${hoverCell.x}%` }} />
                            <div className="fp-grid-crosshair fp-grid-crosshair--h" style={{ top: `${hoverCell.y}%` }} />
                            <div className="fp-grid-coord" style={{ left: `${Math.min(hoverCell.x + 1, 72)}%`, top: `${Math.max(hoverCell.y - 6, 2)}%` }}>
                                x: {hoverCell.x}, y: {hoverCell.y}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* NPC */}
            <div className="fp-npc-wrap">
                <img src={NpcImage} alt={npcName} className="fp-npc-image" draggable={false} />
            </div>

            {/* DialogueBox */}
            <DialogueBox
                title={dialogueSpeaker}
                text={dialogueText}
                isNarration={isNarration(currentSpeaker)}
                isPlayer={isPlayer(currentSpeaker)}
                showNextButton={showNextBtn}
                onNext={handleNext}
                rightSlot={rightSlot}
                introItems={
                    phase === Phase.STORY && ddIntroItems && Number(currentRow?.step_order) >= 3
                        ? ddIntroItems
                        : null
                }
            />

            {/* Done overlay */}
            {phase === Phase.DONE && (
                <div className="fp-overlay">
                    <div className="fp-card">
                        <div className="fp-card-stars">⭐⭐⭐</div>
                        <h2>Scenario Complete!</h2>
                        <p>Padayon sa sunod! 🎯</p>
                    </div>
                </div>
            )}

            {/* BookCollectModal */}
            <BookCollectModal
                isOpen={showPageModal}
                npcName={npcName}
                pageNumber={collectedPage?.pageNumber}
                totalPages={collectedPage?.totalCollected}
                environment="village"
                onClose={() => {
                    setShowPageModal(false);
                    setCollectedPage(null);
                    if (playerId) {
                        fetch(`${API}/api/challenge/quest/submit`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ playerId, questId, npcId, score: 1, maxScore: 1, passed: true }),
                        }).catch(err => console.warn("[FarmPage] submit failed:", err));
                    }
                    advanceSequence();
                }}
            />
        </div>
    );
};

export default FarmPage;