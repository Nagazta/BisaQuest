import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button        from "../components/Button";
import DialogueBox   from "../components/instructions/DialogueBox";
import ClickableItem from "./components/ClickableItem";

import { getPlayerId, saveNPCProgress } from "../utils/playerStorage";
import { DEFAULT_BACKGROUND, SCENE_BACKGROUNDS } from "./dragDropConstants";
import "./ItemAssociation.css";

const TOTAL_ROUNDS = 3;

const Phase = {
  INTRO:    "intro",
  SCENARIO: "scenario",
  CORRECT:  "correct",
  WRONG:    "wrong",
  COMPLETE: "complete",
};

const getNPCText = (phase, introText, { roundPrompt, roundReprompt, itemHint }) => {
  switch (phase) {
    case Phase.INTRO:    return introText || "...";
    case Phase.SCENARIO: return roundPrompt    || "Click the correct item!";
    case Phase.CORRECT:  return itemHint       || "Correct! ✓";
    case Phase.WRONG: {
      const base = roundReprompt || "Sayop! Try again!";
      return itemHint ? `${base}\n\n${itemHint}` : base;
    }
    case Phase.COMPLETE: return "Well done! Quest complete! 🎉";
    default:             return "...";
  }
};

const ItemAssociation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const questId    = location.state?.questId   || null;
  const npcId      = location.state?.npcId     || "forest_npc_1";
  const npcName    = location.state?.npcName   || "Guide";
  const returnTo   = location.state?.returnTo  || "/student/forest";

  const playerId = getPlayerId();
  const API      = import.meta.env.VITE_API_URL || "";

  const [rounds,     setRounds]     = useState([[], [], []]);
  const [introSteps, setIntroSteps] = useState([]);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [phase,        setPhase]        = useState(Phase.INTRO);
  const [introStep,    setIntroStep]    = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundKey,     setRoundKey]     = useState(0);
  const [itemHint,     setItemHint]     = useState(null);
  const [lockedId,     setLockedId]     = useState(null);
  const [completed,    setCompleted]    = useState(false);

  const phaseTimer = useRef(null);

  const currentItems  = rounds[currentRound] || [];
  const correctItem   = currentItems.find(i => i?.isCorrect);
  const roundPrompt   = correctItem?.roundPrompt   || null;
  const roundReprompt = correctItem?.roundReprompt || null;
  const introText     = introSteps[introStep]      || "";
  const isLastIntro   = introSteps.length > 0 && introStep === introSteps.length - 1;

  // ── Load quest data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!questId) {
      setIntroSteps(["Click the correct item to complete the quest!"]);
      setRounds([[], [], []]);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [questRes, dialoguesRes, itemsRes] = await Promise.all([
          fetch(`${API}/api/challenge/quest/${questId}`),
          fetch(`${API}/api/challenge/quest/${questId}/dialogues`),
          fetch(`${API}/api/challenge/quest/${questId}/items?randomize=false`),
        ]);
        if (!questRes.ok)     throw new Error(`Quest fetch failed: ${questRes.status}`);
        if (!dialoguesRes.ok) throw new Error(`Dialogues fetch failed: ${dialoguesRes.status}`);
        if (!itemsRes.ok)     throw new Error(`Items fetch failed: ${itemsRes.status}`);

        const { data: questMeta } = await questRes.json();
        const { data: dialogues } = await dialoguesRes.json();
        const { data: rawItems }  = await itemsRes.json();

        const scene = questMeta?.scene_type || "living_room";
        setBackground(SCENE_BACKGROUNDS[scene] || DEFAULT_BACKGROUND);

        setIntroSteps(
          Array.isArray(dialogues) && dialogues.length
            ? dialogues.map(r => r.dialogue_text)
            : [questMeta?.instructions || "Click the correct item!"]
        );

        const grouped = Array.from({ length: TOTAL_ROUNDS }, () => []);
        rawItems.forEach(row => {
          const idx = Number(row.round_number) - 1;
          if (!isNaN(idx) && idx >= 0 && idx < TOTAL_ROUNDS) grouped[idx].push(row);
        });
        grouped.forEach(round => {
          round.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
          while (round.length < 4) round.push(null);
        });

        setRounds(grouped.map(group => group.map(row => row ? {
          id:            String(row.item_id),
          label:         row.label,
          isCorrect:     row.is_correct,
          hint:          row.hint || null,
          roundPrompt:   row.round_prompt || null,
          roundReprompt: row.round_reprompt || null,
        } : null)));

        setLoading(false);
      } catch (err) {
        console.error("[ItemAssociation] Load error:", err);
        setFetchError(err.message);
        setLoading(false);
      }
    };

    load();
  }, [questId, API]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleIntroNext = () => {
    if (!isLastIntro) setIntroStep(s => s + 1);
    else setPhase(Phase.SCENARIO);
  };

  const handleItemClick = (item, isCorrect) => {
    if (phase === Phase.CORRECT || phase === Phase.COMPLETE) return;
    clearTimeout(phaseTimer.current);
    setItemHint(item.hint || null);

    if (isCorrect) {
      setLockedId(item.id);
      setPhase(Phase.CORRECT);
      phaseTimer.current = setTimeout(() => {
        const next = currentRound + 1;
        if (next >= TOTAL_ROUNDS) {
          setPhase(Phase.COMPLETE);
          setCompleted(true);
          submitProgress();
          setTimeout(() => navigate(returnTo, { state: { completed: true } }), 2000);
        } else {
          setCurrentRound(next);
          setLockedId(null);
          setItemHint(null);
          setPhase(Phase.SCENARIO);
          setRoundKey(k => k + 1);
        }
      }, 900);
    } else {
      setPhase(Phase.WRONG);
      phaseTimer.current = setTimeout(() => {
        setPhase(Phase.SCENARIO);
        setItemHint(null);
      }, 3000);
    }
  };

  const submitProgress = () => {
    saveNPCProgress("forest", npcId, TOTAL_ROUNDS, true);
    if (playerId) {
      fetch(`${API}/api/challenge/quest/submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ playerId, questId, npcId, score: TOTAL_ROUNDS, maxScore: TOTAL_ROUNDS, passed: true }),
      }).catch(err => console.warn("[ItemAssociation] Sync failed:", err));
    }
  };

  const handleBack = () => navigate(returnTo);
  const npcText    = getNPCText(phase, introText, { roundPrompt, roundReprompt, itemHint });

  const rightSlot = phase === Phase.INTRO
    ? isLastIntro
      ? <Button variant="primary" onClick={handleIntroNext}>✓ Let's start!</Button>
      : <button className="ia-next-btn" onClick={handleIntroNext}>▶</button>
    : null;

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) return (
    <div className="ia-wrapper"><div className="ia-container">
      <img src={DEFAULT_BACKGROUND} alt="Loading" className="ia-bg" draggable={false} />
      <div className="ia-loading"><span>Gi-load ang dula...</span></div>
    </div></div>
  );

  if (fetchError) return (
    <div className="ia-wrapper"><div className="ia-container">
      <img src={DEFAULT_BACKGROUND} alt="Error" className="ia-bg" draggable={false} />
      <div className="ia-error">
        <p>Dili ma-load ang dula.</p>
        <Button variant="back" onClick={handleBack}>← Back</Button>
      </div>
    </div></div>
  );

  return (
    <div className="ia-wrapper">
      <div className="ia-container">

        <img src={background} alt="Scene" className="ia-bg" draggable={false} />
        <Button variant="back" className="ia-back-btn" onClick={handleBack}>← Back</Button>

        <div className="ia-step-badge">
          {phase === Phase.INTRO
            ? `Intro ${introStep + 1} / ${introSteps.length}`
            : `Round ${currentRound + 1} / ${TOTAL_ROUNDS}`}
        </div>

        {/* Choices grid */}
        {phase !== Phase.INTRO && (
          <div className="ia-choices-grid">
            {currentItems.filter(Boolean).map(item => (
              <ClickableItem
                key={`rk${roundKey}-${item.id}`}
                item={item}
                onClick={handleItemClick}
                locked={lockedId === item.id}
              />
            ))}
          </div>
        )}

        {phase !== Phase.INTRO && currentItems.length === 0 && (
          <div className="ia-empty-warning">
            ⚠️ Round {currentRound + 1} has no items!
          </div>
        )}

        <DialogueBox
          title={npcName}
          text={npcText}
          showNextButton={false}
          rightSlot={rightSlot}
        />

        {/* Completion overlay */}
        {completed && (
          <div className="ia-completion-overlay">
            <div className="ia-completion-card">
              <div className="ia-completion-stars">⭐⭐⭐</div>
              <h2>Quest Complete!</h2>
              <p>Well done! 🎯</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ItemAssociation;