import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import PrincessHara from "../../assets/images/characters/princess-hara.png";
import gardenBg from "../../assets/images/environments/scenario/castle-garden.fountain.png";
import { getPlayerId, saveNPCProgress } from "../../utils/playerStorage";
import "./GardenFountainPage.css";

const DEFAULT_BG = gardenBg;

// ── Speaker classifiers ────────────────────────────────────────────────────────
const isNarration = (speaker) =>
    typeof speaker === "string" && speaker.toLowerCase() === "narration";

const isPlayer = (speaker) =>
    typeof speaker === "string" && speaker.toLowerCase() === "player";

const resolveSpeaker = (speaker, fallback) => {
    if (!speaker) return fallback;
    if (isNarration(speaker)) return "Narration";
    if (isPlayer(speaker)) return "Player";
    return speaker;
};

const groupByFlow = (rows) => {
    const groups = {};
    for (const row of rows) {
        const key = row.flow_type || "main";
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
    }
    return groups;
};

const matchPairToFlow = (selectedItems, wrongKeys) => {
    const words = selectedItems.flatMap(item =>
        item.label.toLowerCase().split(/[\s/,_-]+/)
    );
    return wrongKeys.find(k => words.some(w => w.length > 2 && k.includes(w))) || wrongKeys[0] || null;
};

const EMOJI_MAP = {
    water: "💧", fall: "🌊", fire: "🔥", stone: "🪨",
    sun: "☀️", light: "💡", rain: "🌧️", snow: "❄️",
};

const toEmoji = (label) => {
    const l = label.toLowerCase();
    for (const [k, v] of Object.entries(EMOJI_MAP)) {
        if (l.includes(k)) return v;
    }
    return "📦";
};

const GardenFountainPage = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const playerId  = getPlayerId();
    const API       = import.meta.env.VITE_API_URL || "";

    const questId  = location.state?.questId  ?? null;
    const npcId    = location.state?.npcId    ?? "castle_npc_garden";
    const npcName  = location.state?.npcName  ?? "Princess Hara";
    const returnTo = location.state?.returnTo ?? "/student/castle";

    const [background, setBackground] = useState(DEFAULT_BG);
    const [flowGroups, setFlowGroups] = useState({});
    const [items, setItems]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);

    // Phase: "dialogue" | "combine" | "branch" | "done"
    const [phase, setPhase]         = useState("dialogue");
    const [mainIdx, setMainIdx]     = useState(0);
    const [branchKey, setBranchKey] = useState(null);
    const [branchIdx, setBranchIdx] = useState(0);

    // Drag & drop state
    const [slots, setSlots]               = useState([null, null]);
    const [dragItemId, setDragItemId]     = useState(null);
    const [combining, setCombining]       = useState(false);
    const [combineRound, setCombineRound] = useState(0);
    const [showTryAgain, setShowTryAgain] = useState(false);
    const [isLit, setIsLit]               = useState(false);

    const currentRow =
        phase === "dialogue" ? (flowGroups.main?.[mainIdx]      ?? null) :
        phase === "branch"   ? (flowGroups[branchKey]?.[branchIdx] ?? null) :
        null;

    // ── Load quest data ────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                let resolvedQuestId = questId;

                if (!resolvedQuestId) {
                    const res = await fetch(`${API}/api/challenge/npc/${npcId}/quest`);
                    if (!res.ok) throw new Error(`Quest lookup: ${res.status}`);
                    const { data } = await res.json();
                    resolvedQuestId = data?.[0]?.quest_id ?? null;
                }

                if (!resolvedQuestId) {
                    setError("No quest found for this NPC.");
                    setLoading(false);
                    return;
                }

                const [dRes, iRes] = await Promise.all([
                    fetch(`${API}/api/challenge/quest/${resolvedQuestId}/dialogues`),
                    fetch(`${API}/api/challenge/quest/${resolvedQuestId}/all-items`),
                ]);

                if (!dRes.ok) throw new Error(`Dialogues: ${dRes.status}`);
                if (!iRes.ok) throw new Error(`Items: ${iRes.status}`);

                const { data: dialogues } = await dRes.json();
                const { data: rawItems }  = await iRes.json();

                if (cancelled) return;

                if (!dialogues?.length) {
                    setError(`No dialogue found for quest ${resolvedQuestId}.`);
                    setLoading(false);
                    return;
                }

                setFlowGroups(groupByFlow(dialogues));

                const mapped = (rawItems ?? []).map(r => ({
                    ...r,
                    id:        String(r.item_id),
                    label:     r.label,
                    isCorrect: r.is_correct,
                    emoji:     r.emoji ?? toEmoji(r.label),
                }));

                setItems(mapped);
                setLoading(false);
            } catch (err) {
                console.error("[GardenFountainPage]", err);
                if (!cancelled) { setError(err.message); setLoading(false); }
            }
        };

        load();
        return () => { cancelled = true; };
    }, [questId, npcId, API]);

    // ── Dialogue navigation ────────────────────────────────────────────────────
    const handleNext = useCallback(() => {
        if (phase === "dialogue") {
            const max = (flowGroups.main?.length ?? 0) - 1;
            if (mainIdx < max) {
                setMainIdx(i => i + 1);
            } else {
                setPhase("combine");
            }
        } else if (phase === "branch") {
            const max = (flowGroups[branchKey]?.length ?? 0) - 1;
            if (branchIdx < max) {
                setBranchIdx(i => i + 1);
            } else if (branchKey === "correct") {
                setPhase("done");
                submitProgress();
            } else {
                setBranchKey(null);
                setBranchIdx(0);
                setShowTryAgain(true);
            }
        }
    }, [phase, mainIdx, branchIdx, branchKey, flowGroups]);

    // ── Drag handlers ──────────────────────────────────────────────────────────
    const handleDragStart = useCallback((itemId) => {
        setDragItemId(itemId);
    }, []);

    const handleDropOnSlot = useCallback((slotIdx) => {
        if (!dragItemId || combining) return;
        setSlots(prev => {
            const next = [...prev];
            // Remove item from its current slot if already placed
            const existing = next.indexOf(dragItemId);
            if (existing !== -1) next[existing] = null;
            next[slotIdx] = dragItemId;
            return next;
        });
        setDragItemId(null);
    }, [dragItemId, combining]);

    const handleRemoveFromSlot = useCallback((slotIdx) => {
        if (combining) return;
        setSlots(prev => { const next = [...prev]; next[slotIdx] = null; return next; });
    }, [combining]);

    // ── Auto-check when both slots filled ─────────────────────────────────────
    useEffect(() => {
        if (phase !== "combine" || slots[0] === null || slots[1] === null || combining) return;

        setCombining(true);

        const selected  = items.filter(i => slots.includes(i.id));
        const allCorrect = selected.every(i => i.isCorrect);
        const wrongKeys  = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));

        setTimeout(() => {
            if (allCorrect) {
                setIsLit(true);
                const target = flowGroups["correct"] ? "correct" : null;
                if (!target) { setPhase("done"); submitProgress(); return; }
                setBranchKey("correct");
                setBranchIdx(0);
                setPhase("branch");
            } else {
                const target = matchPairToFlow(selected, wrongKeys);
                if (!target || !flowGroups[target]) {
                    setCombining(false);
                    setShowTryAgain(true);
                    return;
                }
                setBranchKey(target);
                setBranchIdx(0);
                setPhase("branch");
            }
            setCombining(false);
        }, 500);
    }, [phase, slots, combining, items, flowGroups]);

    // ── Submit progress ────────────────────────────────────────────────────────
    const submitProgress = () => {
        if (!playerId || !questId) return;
        saveNPCProgress?.("castle", npcId, items.length, true);
        fetch(`${API}/api/challenge/quest/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                playerId, questId, npcId,
                score: items.length, maxScore: items.length, passed: true,
            }),
        }).catch(err => console.warn("[GardenFountainPage] submit failed:", err));
    };

    const handleTryAgain = () => {
        setShowTryAgain(false);
        setSlots([null, null]);
        setCombineRound(k => k + 1);
        setPhase("combine");
    };

    const handleBack      = () => navigate(returnTo);
    const handleDoneClose = () => navigate(returnTo, { state: { completed: true } });

    // ── Loading / error ────────────────────────────────────────────────────────
    if (loading) return (
        <div className="gfp-wrapper">
            <img src={DEFAULT_BG} alt="" className="gfp-bg" />
            <div className="gfp-loading">Loading quest...</div>
        </div>
    );

    if (error) return (
        <div className="gfp-wrapper">
            <img src={DEFAULT_BG} alt="" className="gfp-bg" />
            <div className="gfp-loading gfp-error">
                <p>{error}</p>
                <Button variant="back" onClick={handleBack}>← Back</Button>
            </div>
        </div>
    );

    const showDialogueBar = (phase === "dialogue" || phase === "branch") && currentRow;
    const showCombine     = phase === "combine";

    const currentSpeaker  = currentRow?.speaker || null;
    const dialogueSpeaker = currentRow
        ? resolveSpeaker(currentSpeaker, npcName)
        : npcName;
    const dialogueText = currentRow?.dialogue_text || "";

    const slot0Item = slots[0] ? items.find(i => i.id === slots[0]) : null;
    const slot1Item = slots[1] ? items.find(i => i.id === slots[1]) : null;

    return (
        <div className="gfp-wrapper">
            <img
                src={background}
                alt="Garden Fountain"
                className={`gfp-bg${isLit ? " gfp-bg--lit" : ""}`}
                draggable={false}
            />

            <Button variant="back" className="gfp-back" onClick={handleBack}>← Back</Button>

            {/* Princess Hara — hidden during combine phase */}
            {phase !== "combine" && (
                <div className="gfp-princess-wrap">
                    <img
                        src={PrincessHara}
                        alt="Princess Hara"
                        className="gfp-princess-img"
                        draggable={false}
                    />
                </div>
            )}

            {/* Drag & drop combine mechanic */}
            {showCombine && (
                <div className="gfp-combine-area">
                    <p className="gfp-combine-prompt">
                        Drag 2 icons into the spell circle to make a compound word!
                    </p>

                    {/* Drop slots */}
                    <div className="gfp-spell-zone" key={`spell-${combineRound}`}>
                        <div
                            className={[
                                "gfp-slot",
                                slot0Item ? "gfp-slot--filled" : "gfp-slot--empty",
                                combining  ? "gfp-slot--locked" : "",
                            ].filter(Boolean).join(" ")}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); handleDropOnSlot(0); }}
                            onClick={() => slot0Item && handleRemoveFromSlot(0)}
                            title={slot0Item ? "Click to remove" : "Drop here"}
                        >
                            {slot0Item ? (
                                <>
                                    <span className="gfp-slot-emoji">{slot0Item.emoji}</span>
                                    <span className="gfp-slot-label">{slot0Item.label}</span>
                                </>
                            ) : (
                                <span className="gfp-slot-placeholder">?</span>
                            )}
                        </div>

                        <span className="gfp-plus">+</span>

                        <div
                            className={[
                                "gfp-slot",
                                slot1Item ? "gfp-slot--filled" : "gfp-slot--empty",
                                combining  ? "gfp-slot--locked" : "",
                            ].filter(Boolean).join(" ")}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); handleDropOnSlot(1); }}
                            onClick={() => slot1Item && handleRemoveFromSlot(1)}
                            title={slot1Item ? "Click to remove" : "Drop here"}
                        >
                            {slot1Item ? (
                                <>
                                    <span className="gfp-slot-emoji">{slot1Item.emoji}</span>
                                    <span className="gfp-slot-label">{slot1Item.label}</span>
                                </>
                            ) : (
                                <span className="gfp-slot-placeholder">?</span>
                            )}
                        </div>
                    </div>

                    {/* Source icon grid */}
                    <div className="gfp-icons-grid" key={`grid-${combineRound}`}>
                        {items.map(item => {
                            const inSlot = slots.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    className={[
                                        "gfp-icon-card",
                                        inSlot   ? "gfp-icon-card--used"   : "",
                                        combining ? "gfp-icon-card--locked" : "",
                                    ].filter(Boolean).join(" ")}
                                    draggable={!combining && !inSlot}
                                    onDragStart={() => handleDragStart(item.id)}
                                    aria-label={item.label}
                                >
                                    <span className="gfp-icon-emoji">{item.emoji}</span>
                                    <span className="gfp-icon-label">{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Dialogue bar */}
            {showDialogueBar && (
                <DialogueBox
                    title={dialogueSpeaker}
                    text={dialogueText}
                    isNarration={isNarration(currentSpeaker)}
                    isPlayer={isPlayer(currentSpeaker)}
                    language={currentRow?.language ?? "en"}
                    showNextButton={true}
                    onNext={handleNext}
                />
            )}

            {/* Try Again overlay */}
            {showTryAgain && (
                <div className="gfp-overlay">
                    <div className="gfp-overlay-card">
                        <div className="gfp-overlay-icon">❌</div>
                        <h2>Oops! Try Again!</h2>
                        <p>That combination didn&apos;t work.<br />Drag the right icons to fix the fountain spell!</p>
                        <Button variant="primary" onClick={handleTryAgain}>Try Again →</Button>
                    </div>
                </div>
            )}

            {/* Quest complete */}
            {phase === "done" && (
                <div className="gfp-overlay">
                    <div className="gfp-overlay-card">
                        <div className="gfp-overlay-icon">🌊</div>
                        <div className="gfp-complete-stars">✨✨✨</div>
                        <h2>Quest Complete!</h2>
                        <p>The fountain flows again!<br />A Libro fragment floats into your hands!</p>
                        <Button variant="primary" onClick={handleDoneClose}>Continue →</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GardenFountainPage;
