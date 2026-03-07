import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import PrincessHara from "../../assets/images/characters/princess-hara.png";
import castleLibraryImg from "../../assets/images/environments/scenario/castle-library.png";
import castleLibraryLitImg from "../../assets/images/environments/scenario/castle-library-light.png";
import { getPlayerId, saveNPCProgress } from "../../utils/playerStorage";
import "./CastleScenePage.css";

const SCENE_BG = {
    "castle-library": castleLibraryImg,
};
const DEFAULT_BG = castleLibraryImg;

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

    const questId  = location.state?.questId  ?? null;
    const npcId    = location.state?.npcId    ?? "castle_npc_1";
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

    // Combine mechanic state
    const [selectedIds, setSelectedIds] = useState([]);
    const [combining, setCombining]     = useState(false); // brief "checking" lock
    const [combineRound, setCombineRound] = useState(0);   // reset key on retry
    const [showTryAgain, setShowTryAgain] = useState(false);
    const [isLit, setIsLit]             = useState(false); // true after correct answer

    const currentRow =
        phase === "dialogue" ? (flowGroups.main?.[mainIdx] ?? null) :
        phase === "branch"   ? (flowGroups[branchKey]?.[branchIdx] ?? null) :
        null;

    // ── Load quest data ────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                // Resolve the questId — use state value or look it up by npcId
                let resolvedQuestId = questId;

                if (!resolvedQuestId) {
                    const npcQuestRes = await fetch(`${API}/api/challenge/npc/${npcId}/quest`);
                    if (!npcQuestRes.ok) throw new Error(`Quest lookup: ${npcQuestRes.status}`);
                    const { data: npcQuests } = await npcQuestRes.json();
                    resolvedQuestId = npcQuests?.[0]?.quest_id ?? null;
                }

                if (!resolvedQuestId) {
                    setError("No quest found for this NPC. Please check the database.");
                    setLoading(false);
                    return;
                }

                // Fetch dialogues and items — required
                // Meta is optional (only used for scene_type); don't fail if it 500s
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
                    id:        String(r.item_id),
                    label:     r.label,
                    isCorrect: r.is_correct,
                    hint:      r.hint ?? null,
                    emoji:     r.emoji ?? toEmoji(r.label),
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

    // ── Combine mechanic ───────────────────────────────────────────────────────
    const handleIconClick = useCallback((item) => {
        if (combining) return;

        setSelectedIds(prev => {
            // Toggle off if already selected
            if (prev.includes(item.id)) return prev.filter(id => id !== item.id);
            // Already have 2 — replace oldest
            if (prev.length >= 2) return [prev[1], item.id];
            return [...prev, item.id];
        });
    }, [combining]);

    // Auto-check when 2 are selected
    useEffect(() => {
        if (phase !== "combine" || selectedIds.length !== 2 || combining) return;

        setCombining(true);

        const selected = items.filter(i => selectedIds.includes(i.id));
        const allCorrect = selected.every(i => i.isCorrect);
        const wrongKeys  = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));

        setTimeout(() => {
            if (allCorrect) {
                setIsLit(true);
                setBackground(castleLibraryLitImg);
                const target = flowGroups["correct"] ? "correct" : null;
                if (!target) { setPhase("done"); submitProgress(); return; }
                setBranchKey("correct");
                setBranchIdx(0);
                setPhase("branch");
            } else {
                const target = matchPairToFlow(selected, wrongKeys);
                if (!target || !flowGroups[target]) {
                    // No wrong branch in DB — show try again prompt directly
                    setCombining(false);
                    setShowTryAgain(true);
                    return;
                }
                setBranchKey(target);
                setBranchIdx(0);
                setPhase("branch");
            }
            setCombining(false);
        }, 500); // brief pause so selection is visible
    }, [phase, selectedIds, combining, items, flowGroups]);

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
        }).catch(err => console.warn("[CastleScenePage] submit failed:", err));
    };

    const handleTryAgain = () => {
        setShowTryAgain(false);
        setSelectedIds([]);
        setCombineRound(k => k + 1);
        setPhase("combine");
    };

    const handleBack     = () => navigate(returnTo);
    const handleDoneClose = () => navigate(returnTo, { state: { completed: true } });

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
    const showCombine     = phase === "combine";

    const currentSpeaker  = currentRow?.speaker || null;
    const dialogueSpeaker = currentRow
        ? resolveSpeaker(currentSpeaker, npcName)
        : npcName;
    const dialogueText = currentRow?.dialogue_text || "";

    // Hint — from first wrong item if available
    const wrongHint = items.find(i => !i.isCorrect && i.hint)?.hint
        ?? "Think of something that shines in the sky.";

    return (
        <div className="csp-wrapper">
            <img src={background} alt="Castle Library" className={`csp-bg${isLit ? " csp-bg--lit" : ""}`} draggable={false} />

            <Button variant="back" className="csp-back" onClick={handleBack}>← Back</Button>

            {/* Princess Hara — visible unless combine phase */}
            {phase !== "combine" && (
                <div className="csp-princess-wrap">
                    <img
                        src={PrincessHara}
                        alt="Princess Hara"
                        className="csp-princess-img"
                        draggable={false}
                    />
                </div>
            )}

            {/* Combine mechanic — icon selection grid */}
            {showCombine && (
                <div className="csp-combine-area">
                    <p className="csp-combine-prompt">
                        Choose 2 icons to make a compound word!
                    </p>

                    <div className="csp-combine-hint" key={`hint-${combineRound}`}>
                        {wrongHint}
                    </div>

                    <div className="csp-icons-grid" key={`grid-${combineRound}`}>
                        {items.map(item => {
                            const isSelected = selectedIds.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    className={[
                                        "csp-icon-card",
                                        isSelected ? "csp-icon-card--selected" : "",
                                        combining   ? "csp-icon-card--locked"   : "",
                                    ].filter(Boolean).join(" ")}
                                    onClick={() => handleIconClick(item)}
                                    disabled={combining}
                                    aria-pressed={isSelected}
                                    aria-label={item.label}
                                >
                                    <span className="csp-icon-emoji">{item.emoji}</span>
                                    <span className="csp-icon-label">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {selectedIds.length === 2 && (
                        <div className="csp-combine-preview">
                            {selectedIds.map((id, idx) => {
                                const item = items.find(i => i.id === id);
                                return (
                                    <span key={id}>
                                        <span className="csp-preview-emoji">{item?.emoji}</span>
                                        {idx === 0 && <span className="csp-preview-plus"> + </span>}
                                    </span>
                                );
                            })}
                        </div>
                    )}
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