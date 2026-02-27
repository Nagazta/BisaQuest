// ForestScenePage.jsx
//
// Receives questId from ForestPage via location.state. Never re-resolves it.
//
// Dialogue phases:
//   "dialogue" → plays main flow_type rows in step_order
//   "backpack"  → shows draggable items; deer is the drop target
//   "branch"    → plays correct / wrong_* rows in step_order
//   "done"      → quest complete overlay
//
// Item→branch matching: item label words matched against "wrong_*" flow_type keys.
// e.g. "Party Horn" → wrong_horn, "Soft Pillow" → wrong_pillow
// Item with no wrong match (or is_correct=true) → "correct" branch.

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import BackpackItems from "../../components/BackpackItems";
import DeerCharacter from "../../assets/images/characters/deer.png";
import forestScenario from "../../assets/images/environments/scenario/forest-scenario.png";
import { getPlayerId, saveNPCProgress } from "../../utils/playerStorage";
import "./ForestScenePage.css";

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
const toEmoji = (label) => { const l = label.toLowerCase(); for (const [k, v] of Object.entries(EMOJI)) if (l.includes(k)) return v; return "📦"; };

const ForestScenePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const playerId = getPlayerId();
    const API = import.meta.env.VITE_API_URL || "";

    // Provided by ForestPage — do NOT re-resolve here
    const questId = location.state?.questId ?? null;
    const npcId = location.state?.npcId ?? "forest_npc_4";
    const npcName = location.state?.npcName ?? "Deer";
    const returnTo = location.state?.returnTo ?? "/student/forest";

    const [flowGroups, setFlowGroups] = useState({});
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [phase, setPhase] = useState("dialogue");
    const [mainIdx, setMainIdx] = useState(0);
    const [branchKey, setBranchKey] = useState(null);
    const [branchIdx, setBranchIdx] = useState(0);
    const [isDeerTarget, setIsDeerTarget] = useState(false);

    const currentRow =
        phase === "dialogue" ? (flowGroups.main?.[mainIdx] ?? null) :
            phase === "branch" ? (flowGroups[branchKey]?.[branchIdx] ?? null) : null;

    // ── Fetch dialogues + ALL items for the quest ─────────────────────────
    useEffect(() => {
        if (!questId) {
            setError("No quest was selected. Please go back and talk to the deer again.");
            setLoading(false);
            return;
        }

        let cancelled = false;
        const load = async () => {
            try {
                const [dRes, iRes] = await Promise.all([
                    fetch(`${API}/api/challenge/quest/${questId}/dialogues`),
                    // /all-items returns ALL rows for this quest in display_order,
                    // unlike /items which randomly picks 4 for drag-to-zone games
                    fetch(`${API}/api/challenge/quest/${questId}/all-items`),
                ]);

                if (!dRes.ok) throw new Error(`Dialogues: ${dRes.status}`);
                if (!iRes.ok) throw new Error(`Items: ${iRes.status}`);

                const { data: dialogues } = await dRes.json();
                const { data: rawItems } = await iRes.json();

                if (cancelled) return;

                if (!dialogues?.length) {
                    setError(`No dialogue found for quest ${questId}. Check the npc_dialogues table.`);
                    setLoading(false);
                    return;
                }

                setFlowGroups(groupByFlow(dialogues));
                setItems((rawItems ?? []).map(r => ({ ...r, emoji: toEmoji(r.label) })));
                setLoading(false);
            } catch (err) {
                console.error("[ForestScenePage]", err);
                if (!cancelled) { setError(err.message); setLoading(false); }
            }
        };

        load();
        return () => { cancelled = true; };
    }, [questId, API]);

    // ── Advance dialogue ───────────────────────────────────────────────────
    const handleNext = useCallback(() => {
        if (phase === "dialogue") {
            const max = (flowGroups.main?.length ?? 0) - 1;
            if (mainIdx < max) setMainIdx(i => i + 1);
            else setPhase("backpack");
        } else if (phase === "branch") {
            const max = (flowGroups[branchKey]?.length ?? 0) - 1;
            if (branchIdx < max) {
                setBranchIdx(i => i + 1);
            } else if (branchKey === "correct") {
                setPhase("done");
                submitProgress();
            } else {
                // Wrong branch finished → backpack again
                setBranchKey(null); setBranchIdx(0); setPhase("backpack");
            }
        }
    }, [phase, mainIdx, branchIdx, branchKey, flowGroups]);

    // ── Drag onto deer ─────────────────────────────────────────────────────
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
        setBranchKey(target); setBranchIdx(0); setPhase("branch");
    }, [items, flowGroups]);

    const submitProgress = () => {
        if (!playerId || !questId) return;
        saveNPCProgress?.("forest", npcId, items.length, true);
        fetch(`${API}/api/challenge/quest/submit`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerId, questId, npcId, score: items.length, maxScore: items.length, passed: true }),
        }).catch(err => console.warn("[ForestScenePage] submit failed:", err));
    };

    const handleBack = () => navigate(returnTo);
    const handleDoneClose = () => navigate(returnTo, { state: { completed: true } });

    if (loading) return (
        <div className="fsp-wrapper">
            <img src={forestScenario} alt="" className="fsp-bg" />
            <div className="fsp-loading">Loading quest...</div>
        </div>
    );
    if (error) return (
        <div className="fsp-wrapper">
            <img src={forestScenario} alt="" className="fsp-bg" />
            <div className="fsp-loading fsp-error">
                <p>{error}</p>
                <Button variant="back" onClick={handleBack}>← Back</Button>
            </div>
        </div>
    );

    return (
        <div className="fsp-wrapper">
            <img src={forestScenario} alt="Forest Scene" className="fsp-bg" draggable={false} />

            <Button variant="back" className="fsp-back" onClick={handleBack}>← Back</Button>

            {/* Deer — centered on screen, drop target when backpack is open */}
            <div
                className={["fsp-deer-wrap", isDeerTarget ? "fsp-deer-wrap--target" : ""].filter(Boolean).join(" ")}
                onDragOver={phase === "backpack" ? onDragOver : undefined}
                onDragLeave={phase === "backpack" ? onDragLeave : undefined}
                onDrop={phase === "backpack" ? onDrop : undefined}
            >
                <img src={DeerCharacter} alt={npcName} className="fsp-deer-img" draggable={false} />
                {phase === "backpack" && <div className="fsp-deer-hint">Drop an item here</div>}
            </div>

            {/* Dialogue bar — full width, fixed bottom */}
            {(phase === "dialogue" || phase === "branch") && currentRow && (
                <div className="fsp-dialogue-bar">
                    <div className="fsp-dialogue-speaker">{currentRow.speaker || npcName}</div>
                    <div className="fsp-dialogue-text">{currentRow.dialogue_text}</div>
                    <button className="fsp-next-btn" onClick={handleNext}>▶</button>
                </div>
            )}

            {/* Backpack — full width, fixed bottom */}
            {phase === "backpack" && <BackpackItems items={items} />}

            {/* Complete overlay */}
            {phase === "done" && (
                <div className="fsp-complete-overlay">
                    <div className="fsp-complete-card">
                        <div className="fsp-complete-stars">⭐⭐⭐</div>
                        <h2>Quest Complete!</h2>
                        <p>The deer feels better. Good job!</p>
                        <Button variant="primary" onClick={handleDoneClose}>Continue →</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForestScenePage;