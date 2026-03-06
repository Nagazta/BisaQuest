import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import BackpackItems from "../../components/BackpackItems";
import ClickableItem from "../../game/components/ClickableItem";
import DeerCharacter from "../../assets/images/characters/deer.png";
import forestSceneImg from "../../assets/images/environments/scenario/forest-scene.png";
import forkedPathImg from "../../assets/images/environments/scenario/forked-path.png";
import forestRiverImg from "../../assets/images/environments/scenario/forest-river.png";
import { getPlayerId, saveNPCProgress } from "../../utils/playerStorage";
import "./ForestScenePage.css";

const SCENE_BG = {
    "forest-scene": forestSceneImg,
    "forked-path": forkedPathImg,
    "forest-river": forestRiverImg,
};
const DEFAULT_BG = forestSceneImg;

// Matches both "item_association" and "item_association1" (or any variant)
const isIAMechanic = (m) => typeof m === "string" && m.startsWith("item_association");

// ── Speaker classifiers (same pattern as HousePage) ───────────────────────────
const isNarration = (speaker) =>
  typeof speaker === "string" && speaker.toLowerCase() === "narration";

const isPlayer = (speaker) =>
  typeof speaker === "string" && speaker.toLowerCase() === "player";

const resolveSpeaker = (speaker, fallback) => {
  if (!speaker) return fallback;
  if (isNarration(speaker)) return "Narration";
  if (isPlayer(speaker))    return "Player";
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

const matchItemToFlow = (item, wrongKeys) => {
    const words = item.label.toLowerCase().split(/[\s/,_-]+/);
    return wrongKeys.find(k => words.some(w => w.length > 2 && k.includes(w))) || null;
};

const EMOJI = { shield: "🛡️", courage: "🛡️", horn: "📯", party: "📯", pillow: "🛏️", soft: "🛏️" };
const toEmoji = (label) => {
    const l = label.toLowerCase();
    for (const [k, v] of Object.entries(EMOJI)) if (l.includes(k)) return v;
    return "📦";
};

const ForestScenePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const playerId = getPlayerId();
    const API = import.meta.env.VITE_API_URL || "";

    const questId = location.state?.questId ?? null;
    const npcId = location.state?.npcId ?? "forest_npc_4";
    const npcName = location.state?.npcName ?? "Deer";
    const returnTo = location.state?.returnTo ?? "/student/forest";

    const [gameMechanic, setGameMechanic] = useState(null);
    const [background, setBackground] = useState(DEFAULT_BG);
    const [flowGroups, setFlowGroups] = useState({});
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [phase, setPhase] = useState("dialogue");
    const [mainIdx, setMainIdx] = useState(0);
    const [branchKey, setBranchKey] = useState(null);
    const [branchIdx, setBranchIdx] = useState(0);

    const [isDeerTarget, setIsDeerTarget] = useState(false);
    const [iaLockedId, setIaLockedId] = useState(null);
    const [iaRoundKey, setIaRoundKey] = useState(0);

    const currentRow =
        phase === "dialogue" ? (flowGroups.main?.[mainIdx] ?? null) :
            phase === "branch" ? (flowGroups[branchKey]?.[branchIdx] ?? null) :
                phase === "ia_branch" ? (flowGroups[branchKey]?.[branchIdx] ?? null) :
                    null;

    useEffect(() => {
        if (!questId) {
            setError("No quest was selected. Please go back and talk to the deer again.");
            setLoading(false);
            return;
        }

        let cancelled = false;
        const load = async () => {
            try {
                const [metaRes, dRes, iRes] = await Promise.all([
                    fetch(`${API}/api/challenge/quest/${questId}`),
                    fetch(`${API}/api/challenge/quest/${questId}/dialogues`),
                    fetch(`${API}/api/challenge/quest/${questId}/all-items`),
                ]);

                if (!metaRes.ok) throw new Error(`Quest meta: ${metaRes.status}`);
                if (!dRes.ok) throw new Error(`Dialogues: ${dRes.status}`);
                if (!iRes.ok) throw new Error(`Items: ${iRes.status}`);

                const { data: meta } = await metaRes.json();
                const { data: dialogues } = await dRes.json();
                const { data: rawItems } = await iRes.json();

                if (cancelled) return;

                if (!dialogues?.length) {
                    setError(`No dialogue found for quest ${questId}.`);
                    setLoading(false);
                    return;
                }

                const sceneType = meta?.scene_type ?? "forest-scene";
                setBackground(SCENE_BG[sceneType] ?? DEFAULT_BG);

                const mechanic = meta?.game_mechanic ?? "drag_drop";
                setGameMechanic(mechanic);

                const groups = groupByFlow(dialogues);
                setFlowGroups(groups);

                console.log("[FSP] mechanic:", mechanic, "| isIA:", isIAMechanic(mechanic));
                console.log("[FSP] flow keys:", Object.keys(groups));

                const mapped = (rawItems ?? []).map(r => ({
                    ...r,
                    id: String(r.item_id),
                    label: r.label,
                    isCorrect: r.is_correct,
                    hint: r.hint ?? null,
                    x: r.position_x ?? 50,
                    y: r.position_y ?? 50,
                    emoji: toEmoji(r.label),
                }));

                setItems(mapped);
                setLoading(false);
            } catch (err) {
                console.error("[ForestScenePage]", err);
                if (!cancelled) { setError(err.message); setLoading(false); }
            }
        };

        load();
        return () => { cancelled = true; };
    }, [questId, API]);

    const handleNext = useCallback(() => {
        if (phase === "dialogue") {
            const max = (flowGroups.main?.length ?? 0) - 1;
            if (mainIdx < max) {
                setMainIdx(i => i + 1);
            } else {
                // Use isIAMechanic() so "item_association1" and "item_association" both work
                if (isIAMechanic(gameMechanic)) setPhase("ia_scene");
                else setPhase("backpack");
            }
        } else if (phase === "branch" || phase === "ia_branch") {
            const max = (flowGroups[branchKey]?.length ?? 0) - 1;
            if (branchIdx < max) {
                setBranchIdx(i => i + 1);
            } else if (branchKey === "correct") {
                setPhase("done");
                submitProgress();
            } else {
                setBranchKey(null);
                setBranchIdx(0);
                if (isIAMechanic(gameMechanic)) {
                    setIaLockedId(null);
                    setIaRoundKey(k => k + 1);
                    setPhase("ia_scene");
                } else {
                    setPhase("backpack");
                }
            }
        }
    }, [phase, mainIdx, branchIdx, branchKey, flowGroups, gameMechanic]);

    const handleIAItemClick = useCallback((item, isCorrect) => {
        if (phase !== "ia_scene") return;
        const wrongKeys = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));

        if (isCorrect) {
            setIaLockedId(item.id);
            const target = flowGroups["correct"] ? "correct" : null;
            if (!target) { setPhase("done"); submitProgress(); return; }
            setBranchKey("correct");
            setBranchIdx(0);
            setPhase("ia_branch");
        } else {
            const wrongMatch = matchItemToFlow(item, wrongKeys);
            const target = wrongMatch && flowGroups[wrongMatch] ? wrongMatch : null;
            if (!target) { setIaRoundKey(k => k + 1); return; }
            setBranchKey(target);
            setBranchIdx(0);
            setPhase("ia_branch");
        }
    }, [phase, flowGroups]);

    const onDragOver = (e) => { e.preventDefault(); setIsDeerTarget(true); };
    const onDragLeave = () => setIsDeerTarget(false);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDeerTarget(false);
        const dropped = items.find(i => String(i.item_id) === e.dataTransfer.getData("item_id"));
        if (!dropped) return;
        const wrongKeys = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));
        const wrongMatch = matchItemToFlow(dropped, wrongKeys);
        const isCorrect = dropped.is_correct === true || (!wrongMatch && wrongKeys.length > 0) || wrongKeys.length === 0;
        const target = isCorrect ? "correct" : wrongMatch;
        if (!target || !flowGroups[target]) { setPhase("done"); submitProgress(); return; }
        setBranchKey(target);
        setBranchIdx(0);
        setPhase("branch");
    }, [items, flowGroups]);

    const submitProgress = () => {
        if (!playerId || !questId) return;
        saveNPCProgress?.("forest", npcId, items.length, true);
        fetch(`${API}/api/challenge/quest/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerId, questId, npcId, score: items.length, maxScore: items.length, passed: true }),
        }).catch(err => console.warn("[ForestScenePage] submit failed:", err));
    };

    const handleBack = () => navigate(returnTo);
    const handleDoneClose = () => navigate(returnTo, { state: { completed: true } });

    if (loading) return (
        <div className="fsp-wrapper">
            <img src={DEFAULT_BG} alt="" className="fsp-bg" />
            <div className="fsp-loading">Loading quest...</div>
        </div>
    );

    if (error) return (
        <div className="fsp-wrapper">
            <img src={DEFAULT_BG} alt="" className="fsp-bg" />
            <div className="fsp-loading fsp-error">
                <p>{error}</p>
                <Button variant="back" onClick={handleBack}>← Back</Button>
            </div>
        </div>
    );

    const showDialogueBar = (phase === "dialogue" || phase === "branch" || phase === "ia_branch") && currentRow;
    const showIAItems = isIAMechanic(gameMechanic) && phase === "ia_scene";
    const showBackpack = !isIAMechanic(gameMechanic) && phase === "backpack";
    const deerIsDropTarget = !isIAMechanic(gameMechanic) && phase === "backpack";

    // ── Derived dialogue values (same pattern as HousePage) ───────────────────
    const currentSpeaker = currentRow?.speaker || null;
    const dialogueSpeaker = currentRow
        ? resolveSpeaker(currentSpeaker, npcName)
        : npcName;
    const dialogueText = currentRow?.dialogue_text || "";

    return (
        <div className="fsp-wrapper">
            <img src={background} alt="Forest Scene" className="fsp-bg" draggable={false} />

            <Button variant="back" className="fsp-back" onClick={handleBack}>← Back</Button>

            {/* Deer — drag_drop phases */}
            {!isIAMechanic(gameMechanic) && (
                <div
                    className={["fsp-deer-wrap", isDeerTarget ? "fsp-deer-wrap--target" : ""].filter(Boolean).join(" ")}
                    onDragOver={deerIsDropTarget ? onDragOver : undefined}
                    onDragLeave={deerIsDropTarget ? onDragLeave : undefined}
                    onDrop={deerIsDropTarget ? onDrop : undefined}
                >
                    <img src={DeerCharacter} alt={npcName} className="fsp-deer-img" draggable={false} />
                    {phase === "backpack" && <div className="fsp-deer-hint">Drop an item here</div>}
                </div>
            )}

            {/* Deer — IA dialogue phases only (hidden during ia_scene) */}
            {isIAMechanic(gameMechanic) && phase !== "ia_scene" && (
                <div className="fsp-deer-wrap">
                    <img src={DeerCharacter} alt={npcName} className="fsp-deer-img" draggable={false} />
                </div>
            )}

            {/* Item Association: clickable items placed on background */}
            {showIAItems && (
                <>
                    {items.length === 0 && (
                        <div style={{
                            position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)",
                            background: "rgba(200,0,0,0.85)", color: "#fff", padding: "12px 24px",
                            borderRadius: 8, zIndex: 100, fontSize: 13, textAlign: "center",
                        }}>
                            ⚠️ No items found for quest {questId}.
                        </div>
                    )}
                    {items.map(item => (
                        <ClickableItem
                            key={`ia-${iaRoundKey}-${item.id}`}
                            item={item}
                            onClick={handleIAItemClick}
                            locked={iaLockedId === item.id}
                        />
                    ))}
                </>
            )}

            {/* Dialogue bar — shared DialogueBox with full speaker support */}
            {showDialogueBar && (
                <DialogueBox
                    title={dialogueSpeaker}
                    text={dialogueText}
                    isNarration={isNarration(currentSpeaker)}
                    isPlayer={isPlayer(currentSpeaker)}
                    showNextButton={true}
                    onNext={handleNext}
                />
            )}

            {/* Drag & Drop backpack */}
            {showBackpack && <BackpackItems items={items} />}

            {/* Quest complete */}
            {phase === "done" && (
                <div className="fsp-complete-overlay">
                    <div className="fsp-complete-card">
                        <div className="fsp-complete-stars">⭐⭐⭐</div>
                        <h2>Quest Complete!</h2>
                        <p>Good job!</p>
                        <Button variant="primary" onClick={handleDoneClose}>Continue →</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForestScenePage;