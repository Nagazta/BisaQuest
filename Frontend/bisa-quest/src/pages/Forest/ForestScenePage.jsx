import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import BackpackItems from "../../components/BackpackItems";
import SceneItem from "../../game/components/SceneItem";
import { ITEM_IMAGE_MAP } from "../../game/dragDropConstants";
import AssetManifest from "../../services/AssetManifest";
import {
    getPlayerId,
    saveNPCProgress,
    shouldAwardForestFragment,
    awardLibroPage,
    getLibroPageCount,
    getLibroPageCountForEnv,
} from "../../utils/playerStorage";
import BookCollectModal from "../../game/components/BookCollectModal";
import "./ForestScenePage.css";

// ── Eager-load every image in assets/items/ so we can resolve by key ────────
const itemModules = {
    ...import.meta.glob("../../assets/items/*.png", { eager: true }),
    ...import.meta.glob("../../assets/items/*.jpg", { eager: true }),
    ...import.meta.glob("../../assets/items/*.jpeg", { eager: true }),
    ...import.meta.glob("../../assets/items/*.webp", { eager: true }),
};

const resolveItemImage = (key) => {
    if (!key) return null;
    if (ITEM_IMAGE_MAP[key]) return ITEM_IMAGE_MAP[key];
    const normalizedKey = key.split("/").pop().replace(/\.[^.]+$/, "").toLowerCase();
    for (const [path, mod] of Object.entries(itemModules)) {
        const filename = path.split("/").pop().replace(/\.[^.]+$/, "").toLowerCase();
        if (filename === normalizedKey) return mod.default;
    }
    return null;
};

// ── NPC image map ───────────────────────────────────────────────────────────
const NPC_IMAGES = {
    forest_npc_1: AssetManifest.forest.npcs.forest_guardian,
    forest_npc_2: AssetManifest.forest.npcs.wandering_bard,
    forest_npc_3: AssetManifest.forest.npcs.diwata,
    forest_npc_4: AssetManifest.forest.npcs.deer,
};

const SCENE_BG = {
    "forest-scene": AssetManifest.forest.scenarios.forestScene,
    "forked-path": AssetManifest.forest.scenarios.forkedPath,
    "forest-river": AssetManifest.forest.scenarios.river,
    "forest-pond": AssetManifest.forest.scenarios.pond,
    "forest-glow": AssetManifest.forest.scenarios.glow,
};
const DEFAULT_BG = AssetManifest.forest.scenarios.forestScene;

const isDeerNpc = (id) => id === "forest_npc_4";

const isIAMechanic = (m) => typeof m === "string" && m.startsWith("item_association");

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

    const NpcImage = NPC_IMAGES[npcId] || AssetManifest.forest.npcs.deer;
    const useBackpack = isDeerNpc(npcId);

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

    const [isNpcDropTarget, setIsNpcDropTarget] = useState(false);
    const [iaLockedId, setIaLockedId] = useState(null);
    const [iaRoundKey, setIaRoundKey] = useState(0);

    // ── Fragment modal state ──────────────────────────────────────────────────
    const [showPageModal, setShowPageModal] = useState(false);
    const [collectedPage, setCollectedPage] = useState(null);

    const currentRow =
        phase === "dialogue" ? (flowGroups.main?.[mainIdx] ?? null) :
            phase === "branch" ? (flowGroups[branchKey]?.[branchIdx] ?? null) :
                phase === "ia_branch" ? (flowGroups[branchKey]?.[branchIdx] ?? null) :
                    null;

    useEffect(() => {
        if (!questId) {
            setError("No quest was selected. Please go back and talk to the NPC again.");
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

                const mapped = (rawItems ?? []).map(r => ({
                    ...r,
                    id: String(r.item_id),
                    label: r.label,
                    isCorrect: r.is_correct,
                    hint: r.hint ?? null,
                    x: r.position_x ?? 50,
                    y: r.position_y ?? 50,
                    widthPercent: r.width_percent ?? null,
                    heightPercent: r.height_percent ?? null,
                    emoji: toEmoji(r.label),
                    imageKey: r.image_key || null,
                    resolvedImage: resolveItemImage(r.image_key),
                }));

                console.log("[DEBUG] raw item sample:", rawItems?.[0]);
                console.log("[DEBUG] mapped item sample:", mapped?.[0]);

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
                if (isIAMechanic(gameMechanic)) setPhase("ia_scene");
                else if (useBackpack) setPhase("backpack");
                else setPhase("items_on_screen");
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
                } else if (useBackpack) {
                    setPhase("backpack");
                } else {
                    setPhase("items_on_screen");
                }
            }
        }
    }, [phase, mainIdx, branchIdx, branchKey, flowGroups, gameMechanic, useBackpack]);

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

    const onDragOver = (e) => { e.preventDefault(); setIsNpcDropTarget(true); };
    const onDragLeave = () => setIsNpcDropTarget(false);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsNpcDropTarget(false);
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

    const doBackendSubmit = () => {
        if (!playerId || !questId) return;
        fetch(`${API}/api/challenge/quest/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerId, questId, npcId, score: items.length, maxScore: items.length, passed: true }),
        }).catch(err => console.warn("[ForestScenePage] submit failed:", err));
    };

    const submitProgress = () => {
        if (!playerId || !questId) return;

        // Save NPC progress — npcCount=3 (Ronaldo excluded until quests are ready)
        saveNPCProgress("forest", npcId, items.length, true, 3);

        // Award a Forest Fragment if the player qualifies (≥3 encounters OR NPC fully completed)
        if (shouldAwardForestFragment(npcId)) {
            const isNewPage = awardLibroPage("forest", npcId);
            if (isNewPage) {
                const pageNumber = getLibroPageCountForEnv("forest");
                const totalCollected = getLibroPageCount();
                setCollectedPage({ pageNumber, totalCollected });
                setShowPageModal(true);
                return; // Wait for modal close before navigating
            }
        }

        // No new fragment — submit and continue immediately
        doBackendSubmit();
        navigate(returnTo, { state: { completed: true } });
    };

    const handleBack = () => navigate(returnTo);
    const handleDoneClose = () => navigate(returnTo, { state: { completed: true } });
    const handleFragmentModalClose = () => {
        setShowPageModal(false);
        setCollectedPage(null);
        doBackendSubmit();
        navigate(returnTo, { state: { completed: true } });
    };

    if (loading) return (
        <div className="fsp-wrapper">
            <div className="fsp-loading">Loading quest...</div>
        </div>
    );

    if (error) return (
        <div className="fsp-wrapper">
            <div className="fsp-loading fsp-error">
                <p>{error}</p>
                <Button variant="back" onClick={handleBack}>← Back</Button>
            </div>
        </div>
    );

    const showDialogueBar = (phase === "dialogue" || phase === "branch" || phase === "ia_branch") && currentRow;
    const showIAItems = isIAMechanic(gameMechanic) && phase === "ia_scene";
    const showBackpack = useBackpack && !isIAMechanic(gameMechanic) && phase === "backpack";
    const showOnScreenItems = !useBackpack && !isIAMechanic(gameMechanic) && phase === "items_on_screen";
    const npcIsDropTarget = !isIAMechanic(gameMechanic) && (phase === "backpack" || phase === "items_on_screen");

    const currentSpeaker = currentRow?.speaker || null;
    const dialogueSpeaker = currentRow
        ? resolveSpeaker(currentSpeaker, npcName)
        : npcName;
    const dialogueText = currentRow?.dialogue_text || "";

    return (
        <div className="fsp-wrapper">
            <img src={background} alt="Forest Scene" className="fsp-bg" draggable={false} />

            <Button variant="back" className="fsp-back" onClick={handleBack}>← Back</Button>

            {/* NPC character — drag_drop / items_on_screen phases */}
            {!isIAMechanic(gameMechanic) && (
                <div
                    className={["fsp-npc-wrap", isNpcDropTarget ? "fsp-npc-wrap--target" : ""].filter(Boolean).join(" ")}
                    onDragOver={npcIsDropTarget ? onDragOver : undefined}
                    onDragLeave={npcIsDropTarget ? onDragLeave : undefined}
                    onDrop={npcIsDropTarget ? onDrop : undefined}
                >
                    <img src={NpcImage} alt={npcName} className="fsp-npc-img" draggable={false} />
                    {(phase === "backpack" || phase === "items_on_screen") && (
                        <div className="fsp-npc-hint">Drop an item here</div>
                    )}
                </div>
            )}

            {/* NPC character — IA dialogue phases only (hidden during ia_scene) */}
            {isIAMechanic(gameMechanic) && phase !== "ia_scene" && (
                <div className="fsp-npc-wrap">
                    <img src={NpcImage} alt={npcName} className="fsp-npc-img" draggable={false} />
                </div>
            )}

            {/* On-screen draggable items (for NPCs 1–3 drag_drop, no backpack) */}
            {showOnScreenItems && (
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
                        <div
                            key={`dd-${item.id}`}
                            className="fsp-scene-item"
                            style={{ left: `${item.x}%`, top: `${item.y}%` }}
                            draggable
                            onDragStart={e => {
                                e.dataTransfer.setData("item_id", String(item.item_id));
                            }}
                        >
                            {item.resolvedImage ? (
                                <img
                                    src={item.resolvedImage}
                                    alt={item.label}
                                    className="fsp-scene-item-img"
                                    draggable={false}
                                />
                            ) : (
                                <span className="fsp-scene-item-emoji">{item.emoji}</span>
                            )}
                            <span className="fsp-scene-item-label">{item.label}</span>
                        </div>
                    ))}
                </>
            )}

            {/* Item Association: clickable items inside scene canvas for correct scaling */}
            {showIAItems && (
                <div className="fsp-scene-canvas">
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
                        <SceneItem
                            key={`ia-${iaRoundKey}-${item.id}`}
                            item={item}
                            onClick={handleIAItemClick}
                            locked={iaLockedId === item.id}
                        />
                    ))}
                </div>
            )}

            {/* Dialogue bar */}
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

            {/* Drag & Drop backpack (Deer only) */}
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

            {/* Forest Fragment collect modal */}
            <BookCollectModal
                isOpen={showPageModal}
                npcName={npcName}
                pageNumber={collectedPage?.pageNumber}
                totalPages={collectedPage?.totalCollected}
                environment="forest"
                onClose={handleFragmentModalClose}
            />
        </div>
    );
};

export default ForestScenePage;