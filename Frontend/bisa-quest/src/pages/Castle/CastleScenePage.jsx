import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import AssetManifest from "../../services/AssetManifest";
import { getPlayerId, saveNPCProgress } from "../../utils/playerStorage";
import "./CastleScenePage.css";

const SCENE_BG = {
    "castle-library": AssetManifest.castle.scenarios.library,
    "garden-fountain": AssetManifest.castle.scenarios.garden,
    "night-garden": AssetManifest.castle.scenarios.nightGarden,
    "castle-courtyard": AssetManifest.castle.scenarios.courtyard,
    "castle-firewood": AssetManifest.castle.scenarios.firewood,
    "castle-firework": AssetManifest.castle.scenarios.firework,
    "castle-moonlight-room": AssetManifest.castle.scenarios.moonlightRoom,
    "castle-rainbow": AssetManifest.castle.scenarios.rainbow,
};

// NPC character sprites (null = no character shown)
const NPC_CHARACTER = {
    "castle_npc_1": AssetManifest.castle.npcs.princess_hara,
    "castle_npc_2": AssetManifest.castle.npcs.manong_kwill,
    "castle_npc_3": AssetManifest.castle.npcs.gulo,
};
const DEFAULT_BG = AssetManifest.castle.scenarios.library;

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

// Match selected pair labels against wrong flow keys
const matchPairToFlow = (selectedItems, wrongKeys) => {
    const words = selectedItems.flatMap(item =>
        item.label.toLowerCase().split(/[\s/,_-]+/)
    );
    return wrongKeys.find(k => words.some(w => w.length > 2 && k.includes(w))) || wrongKeys[0] || null;
};

// Fallback emoji map for common compound-word items
const EMOJI_MAP = {
    sun: "☀️", light: "💡", fire: "🔥", fly: "🪰",
    rain: "🌧️", bow: "🏹", snow: "❄️", flake: "❄️",
    thunder: "⚡", storm: "⛈️", moon: "🌙", star: "⭐",
    water: "💧", fall: "🌊", stone: "🪨",
    court: "🏰", yard: "🌳", wood: "🪵", window: "🪟",
    play: "🎭", work: "⚙️", cloud: "☁️",

};

const toEmoji = (label) => {
    const l = label.toLowerCase();
    for (const [k, v] of Object.entries(EMOJI_MAP)) {
        if (l.includes(k)) return v;
    }
    return "📦";
};

const CastleScenePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const playerId = getPlayerId();
    const API = import.meta.env.VITE_API_URL || "";

    const questId = location.state?.questId ?? null;
    const npcId = location.state?.npcId ?? "castle_npc_1";
    const npcName = location.state?.npcName ?? "Princess Hara";
    const returnTo = location.state?.returnTo ?? "/student/castle";

    const [background, setBackground] = useState(DEFAULT_BG);
    const [flowGroups, setFlowGroups] = useState({});
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Quest chaining
    const [npcQuests, setNpcQuests] = useState([]);
    const [currentQuestId, setCurrentQuestId] = useState(null);

    // Phase: "dialogue" | "combine" | "branch" | "done"
    const [phase, setPhase] = useState("dialogue");
    const [mainIdx, setMainIdx] = useState(0);
    const [branchKey, setBranchKey] = useState(null);
    const [branchIdx, setBranchIdx] = useState(0);

    // Spell-circle drag & drop state
    const [slots, setSlots] = useState([null, null]); // [itemId, itemId]
    const [dragItemId, setDragItemId] = useState(null);
    const [combining, setCombining] = useState(false);
    const [combineRound, setCombineRound] = useState(0);
    const [showTryAgain, setShowTryAgain] = useState(false);
    const [isLit, setIsLit] = useState(false);

    const currentRow =
        phase === "dialogue" ? (flowGroups.main?.[mainIdx] ?? null) :
            phase === "branch" ? (flowGroups[branchKey]?.[branchIdx] ?? null) :
                null;

    // ── Reset game state on quest change ──────────────────────────────────────
    useEffect(() => {
        setPhase("dialogue");
        setMainIdx(0);
        setBranchKey(null);
        setBranchIdx(0);
        setSlots([null, null]);
        setCombining(false);
        setCombineRound(0);
        setShowTryAgain(false);
        setIsLit(false);
        setBackground(DEFAULT_BG);
        setFlowGroups({});
        setItems([]);
        setLoading(true);
        setError(null);
    }, [questId, npcId]);

    // ── Load quest data ────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                // Always fetch all NPC quests for chaining
                const npcQuestRes = await fetch(`${API}/api/challenge/npc/${npcId}/quest`);
                if (!npcQuestRes.ok) throw new Error(`Quest lookup: ${npcQuestRes.status}`);
                const { data: allNpcQuests } = await npcQuestRes.json();
                if (!cancelled) setNpcQuests(allNpcQuests ?? []);

                // Resolve which quest to load
                let resolvedQuestId = questId ?? allNpcQuests?.[0]?.quest_id ?? null;

                if (!resolvedQuestId) {
                    setError("No quest found for this NPC. Please check the database.");
                    setLoading(false);
                    return;
                }

                if (!cancelled) setCurrentQuestId(resolvedQuestId);

                // Fetch dialogues and items — required
                // Meta is optional (only used for scene_type); don't fail if it 500s
                const [dRes, iRes] = await Promise.all([
                    fetch(`${API}/api/challenge/quest/${resolvedQuestId}/dialogues`),
                    fetch(`${API}/api/challenge/quest/${resolvedQuestId}/all-items`),
                ]);

                if (!dRes.ok) throw new Error(`Dialogues: ${dRes.status}`);
                if (!iRes.ok) throw new Error(`Items: ${iRes.status}`);

                const { data: dialogues } = await dRes.json();
                const { data: rawItems } = await iRes.json();

                if (cancelled) return;

                if (!dialogues?.length) {
                    setError(`No dialogue found for quest ${resolvedQuestId}.`);
                    setLoading(false);
                    return;
                }

                // Scene type — try meta but default to castle-library on failure
                let sceneType = "castle-library";
                try {
                    const metaRes = await fetch(`${API}/api/challenge/quest/${resolvedQuestId}`);
                    if (metaRes.ok) {
                        const { data: meta } = await metaRes.json();
                        sceneType = meta?.scene_type ?? "castle-library";
                    }
                } catch (_) { /* use default */ }
                setBackground(SCENE_BG[sceneType] ?? DEFAULT_BG);

                setFlowGroups(groupByFlow(dialogues));

                const mapped = (rawItems ?? []).map(r => ({
                    ...r,
                    id: String(r.item_id),
                    label: r.label,
                    isCorrect: r.is_correct,
                    hint: r.hint ?? null,
                    emoji: r.emoji ?? toEmoji(r.label),
                }));

                setItems(mapped);
                setLoading(false);
            } catch (err) {
                console.error("[CastleScenePage]", err);
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
                // Wrong branch ended — show try again prompt
                setBranchKey(null);
                setBranchIdx(0);
                setShowTryAgain(true);
            }
        }
    }, [phase, mainIdx, branchIdx, branchKey, flowGroups]);

    // ── Drag & drop handlers ───────────────────────────────────────────────────
    const handleDragStart = useCallback((itemId) => {
        if (combining) return;
        setDragItemId(itemId);
    }, [combining]);

    const handleDropOnSlot = useCallback((slotIdx) => {
        if (!dragItemId || combining) return;
        setSlots(prev => {
            const next = [...prev];
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

    // ── Cast Spell button ──────────────────────────────────────────────────────
    const handleCastSpell = useCallback(() => {
        if (!slots[0] || !slots[1] || combining) return;

        setCombining(true);

        const selected = items.filter(i => slots.includes(i.id));
        const allCorrect = selected.every(i => i.isCorrect);
        const wrongKeys = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));

        setTimeout(() => {
            if (allCorrect) {
                setIsLit(true);
                setBackground(prev => prev === AssetManifest.castle.scenarios.library ? AssetManifest.castle.scenarios.libraryLit : prev);
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
    }, [slots, combining, items, flowGroups]);

    // ── Submit progress ────────────────────────────────────────────────────────
    const submitProgress = () => {
        if (!playerId || !currentQuestId) return;
        saveNPCProgress?.("castle", npcId, items.length, true);
        fetch(`${API}/api/challenge/quest/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                playerId, questId: currentQuestId, npcId,
                score: items.length, maxScore: items.length, passed: true,
            }),
        }).catch(err => console.warn("[CastleScenePage] submit failed:", err));
    };

    const handleTryAgain = () => {
        setShowTryAgain(false);
        setSlots([null, null]);
        setCombineRound(k => k + 1);
        setPhase("combine");
    };

    const handleBack = () => navigate(returnTo);

    const handleDoneClose = () => {
        const idx = npcQuests.findIndex(q => String(q.quest_id) === String(currentQuestId));
        const next = npcQuests[idx + 1];
        if (next) {
            // Chain to next quest for same NPC — navigate pushes new location.state
            navigate("/student/library", {
                state: { npcId, npcName, questId: next.quest_id, returnTo },
            });
        } else {
            navigate(returnTo, { state: { completed: true } });
        }
    };

    // ── Loading / error states ─────────────────────────────────────────────────
    if (loading) return (
        <div className="csp-wrapper">
            <img src={DEFAULT_BG} alt="" className="csp-bg" />
            <div className="csp-loading">Loading quest...</div>
        </div>
    );

    if (error) return (
        <div className="csp-wrapper">
            <img src={DEFAULT_BG} alt="" className="csp-bg" />
            <div className="csp-loading csp-error">
                <p>{error}</p>
                <Button variant="back" onClick={handleBack}>← Back</Button>
            </div>
        </div>
    );

    const showDialogueBar = (phase === "dialogue" || phase === "branch") && currentRow;
    const showCombine = phase === "combine";

    const currentSpeaker = currentRow?.speaker || null;
    const dialogueSpeaker = currentRow
        ? resolveSpeaker(currentSpeaker, npcName)
        : npcName;
    const dialogueText = currentRow?.dialogue_text || "";

    return (
        <div className="csp-wrapper">
            <img src={background} alt="Castle Library" className={`csp-bg${isLit ? " csp-bg--lit" : ""}`} draggable={false} />

            <Button variant="back" className="csp-back" onClick={handleBack}>← Back</Button>

            {/* NPC character — only shown when a sprite exists for this NPC */}
            {phase !== "combine" && NPC_CHARACTER[npcId] && (
                <div className="csp-princess-wrap">
                    <img
                        src={NPC_CHARACTER[npcId]}
                        alt={npcName}
                        className="csp-princess-img"
                        draggable={false}
                    />
                </div>
            )}

            {/* Spell circle — drag & drop */}
            {showCombine && (
                <div className="csp-combine-area" key={`combine-${combineRound}`}>

                    {/* Prompt */}
                    <p className="csp-combine-prompt">
                        Drag icons into the spell circle!
                    </p>

                    {/* Spell circle — two drop slots + cast button */}
                    <div className="csp-spell-circle">
                        {/* Slots row */}
                        <div className="csp-spell-slots">
                            {/* Slot 1 */}
                            <div
                                className={["csp-slot", slots[0] ? "csp-slot--filled" : "csp-slot--empty", combining ? "csp-slot--locked" : ""].filter(Boolean).join(" ")}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => { e.preventDefault(); handleDropOnSlot(0); }}
                                onClick={() => slots[0] && handleRemoveFromSlot(0)}
                                title={slots[0] ? "Click to remove" : "Drop here"}
                            >
                                {slots[0] ? (() => { const it = items.find(i => i.id === slots[0]); return (<><span className="csp-slot-emoji">{it?.emoji}</span><span className="csp-slot-label">{it?.label}</span></>); })() : <span className="csp-slot-placeholder">?</span>}
                            </div>

                            <span className="csp-spell-plus">+</span>

                            {/* Slot 2 */}
                            <div
                                className={["csp-slot", slots[1] ? "csp-slot--filled" : "csp-slot--empty", combining ? "csp-slot--locked" : ""].filter(Boolean).join(" ")}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => { e.preventDefault(); handleDropOnSlot(1); }}
                                onClick={() => slots[1] && handleRemoveFromSlot(1)}
                                title={slots[1] ? "Click to remove" : "Drop here"}
                            >
                                {slots[1] ? (() => { const it = items.find(i => i.id === slots[1]); return (<><span className="csp-slot-emoji">{it?.emoji}</span><span className="csp-slot-label">{it?.label}</span></>); })() : <span className="csp-slot-placeholder">?</span>}
                            </div>
                        </div>

                        <button
                            className={["csp-cast-btn", slots[0] && slots[1] && !combining ? "csp-cast-btn--ready" : "csp-cast-btn--disabled"].filter(Boolean).join(" ")}
                            onClick={handleCastSpell}
                            disabled={!slots[0] || !slots[1] || combining}
                        >
                            Cast Spell
                        </button>
                    </div>

                    {/* Inventory bar */}
                    <div className="csp-inventory-bar">
                        {items.map(item => {
                            const inSlot = slots.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    className={["csp-inv-card", inSlot ? "csp-inv-card--used" : "", combining ? "csp-inv-card--locked" : ""].filter(Boolean).join(" ")}
                                    draggable={!combining && !inSlot}
                                    onDragStart={() => handleDragStart(item.id)}
                                    aria-label={item.label}
                                >
                                    <span className="csp-inv-emoji">{item.emoji}</span>
                                    <span className="csp-inv-label">{item.label}</span>
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
                    language={currentRow?.language ?? "ceb-en"}
                    showNextButton={true}
                    onNext={handleNext}
                />
            )}

            {/* Try Again overlay */}
            {showTryAgain && (
                <div className="csp-complete-overlay">
                    <div className="csp-complete-card">
                        <div className="csp-libro-fragment">❌</div>
                        <h2>Oops! Try Again!</h2>
                        <p>That combination didn't work. Choose 2 icons to make a compound word!</p>
                        <Button variant="primary" onClick={handleTryAgain}>Try Again →</Button>
                    </div>
                </div>
            )}

            {/* Quest complete */}
            {phase === "done" && (
                <div className="csp-complete-overlay">
                    <div className="csp-complete-card">
                        <div className="csp-libro-fragment">📖</div>
                        <div className="csp-complete-stars">✨✨✨</div>
                        <h2>Quest Complete!</h2>
                        <p>A Libro fragment floats into your hands!</p>
                        <Button variant="primary" onClick={handleDoneClose}>Continue →</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CastleScenePage;