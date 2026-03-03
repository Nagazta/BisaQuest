import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button          from "../components/Button";
import DialogueBox     from "../components/instructions/DialogueBox";
import ClickableItem   from "./components/ClickableItem";
import LigayaCharacter from "../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import Arrow           from "../assets/images/signs/arrow.png";
import Trash1          from "../assets/items/trash 1.png";
import FoodWrappers    from "../assets/items/foodWrappers.png";
import FoodWrappers2   from "../assets/items/foodWrappers2.png";
import BroomImage      from "../assets/items/broom.png";
import SpilledWater    from "../assets/items/spilledWater.png";
import Water           from "../assets/items/water.png";

import { getPlayerId, saveNPCProgress } from "../utils/playerStorage";
import { DEFAULT_BACKGROUND, SCENE_BACKGROUNDS } from "./dragDropConstants";
import "./ItemAssociation.css";

const TOTAL_ROUNDS = 3;

// ── Hardcoded scene images per scene_type 
const SCENE_IMAGES = {
  living_room: {
    0: [Trash1, FoodWrappers, FoodWrappers2],  // Round 1: dirty floor
    1: [SpilledWater, Water],                   // Round 2: wet table
    2: [],                                      // Round 3: cobwebs (no image yet)
  },
  kitchen: {
    0: [],  // Round 1
    1: [],  // Round 2
    2: [],  // Round 3
  },
  bedroom: {
    0: [],  // Round 1
    1: [],  // Round 2
    2: [],  // Round 3
  },
};

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
    case Phase.SCENARIO: return roundPrompt   || "Click the correct item! / I-click ang tamang sagot!";
    case Phase.CORRECT:  return itemHint      || "Correct! / Husto! ✓";
    case Phase.WRONG: {
      const base = roundReprompt || "Sayop! Try again! / Sulayi pag-usab!";
      return itemHint ? `${base}\n\n${itemHint}` : base;
    }
    case Phase.COMPLETE: return "Ayos kaayo! You got all three! Natapos na nimo! 🎉";
    default:             return "...";
  }
};

const ItemAssociation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const questId       = location.state?.questId       || null;
  const npcId         = location.state?.npcId         || "village_npc_2";
  const npcName       = location.state?.npcName       || "Ligaya";
  const returnTo      = location.state?.returnTo      || "/student/village";
  const questSequence = location.state?.questSequence || [];
  const sequenceIndex = location.state?.sequenceIndex ?? 0;

  const kitchenQuestId = location.state?.kitchenQuestId || null;
  const bedroomQuestId = location.state?.bedroomQuestId || null;
  const iaQuestId      = location.state?.iaQuestId      || null;

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
  const [isSweeping,   setIsSweeping]   = useState(false);

  const phaseTimer = useRef(null);

// ── Current correct item safely
const currentItems  = rounds[currentRound] || [];
const correctItem   = currentItems.find(i => i?.isCorrect);
const roundPrompt   = correctItem?.roundPrompt   || null;
const roundReprompt = correctItem?.roundReprompt || null;

  const introText       = introSteps[introStep] || "";
  const isLastIntroStep = introSteps.length > 0 && introStep === introSteps.length - 1;

  useEffect(() => {
    if (!questId) {
      setIntroSteps([
        "Help me find the right cleaning tool! / Tulungan mo akong hanapin ang tamang kagamitan!",
        "Listen carefully and click the right one! / Pakinggan mo at i-click ang tamang sagot!",
      ]);
      setRounds(buildFallbackRounds());
      setBackground(SCENE_BACKGROUNDS.living_room);
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

        if (!questRes.ok) throw new Error(`Quest fetch failed: ${questRes.status}`);
        if (!dialoguesRes.ok) throw new Error(`Dialogues fetch failed: ${dialoguesRes.status}`);
        if (!itemsRes.ok) throw new Error(`Items fetch failed: ${itemsRes.status}`);

        const { data: questMeta } = await questRes.json();
        const { data: dialogues } = await dialoguesRes.json();
        const { data: rawItems } = await itemsRes.json();

        const scene = questMeta?.scene_type || "living_room";
        setBackground(SCENE_BACKGROUNDS[scene] || DEFAULT_BACKGROUND);

        setIntroSteps(
          Array.isArray(dialogues) && dialogues.length > 0
            ? dialogues.map(r => r.dialogue_text)
            : [questMeta?.instructions || "Click the correct item!"]
        );

        // ── Group items robustly by round_number (1-indexed)
        const grouped = Array.from({ length: TOTAL_ROUNDS }, () => []);

        rawItems.forEach(row => {
          const roundIdx = Number(row.round_number) - 1; // rounds are 1-indexed
          if (isNaN(roundIdx) || roundIdx < 0 || roundIdx >= TOTAL_ROUNDS) {
            console.warn("[IA] Invalid round_number:", row.item_id, row.round_number);
          } else {
            grouped[roundIdx].push(row);
          }
        });

        // Sort items in each round by display_order
        grouped.forEach(round => {
          round.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
        });

        // Ensure each round has exactly 4 items (pad with null if needed)
        grouped.forEach(round => {
          while (round.length < 4) round.push(null);
        });

        console.log("[IA] items by round (after fix):", grouped.map((g, i) => `R${i + 1}:${g.length}`).join(" "));

        // ── Map items + inject scene images only on correct items
        const mapped = grouped.map((group, roundIdx) => {
          const images = SCENE_IMAGES[scene]?.[roundIdx] ?? [];
          return group.map(row =>
            row
              ? {
                  id: String(row.item_id),
                  label: row.label,
                  isCorrect: row.is_correct,
                  hint: row.hint || null,
                  roundPrompt: row.round_prompt || null,
                  roundReprompt: row.round_reprompt || null,
                  ...(row.is_correct && images.length ? { sceneImages: images } : {}),
                }
              : null
          );
        });

        setRounds(mapped);
        setLoading(false);
      } catch (err) {
        console.error("[IA] Load error:", err);
        setFetchError(err.message);
        setLoading(false);
      }
    };

    load();
  }, [questId, API]);
  const handleIntroNext = () => {
    if (!isLastIntroStep) setIntroStep(s => s + 1);
    else setPhase(Phase.SCENARIO);
  };

  const handleItemClick = (item, isCorrect) => {
    if (phase === Phase.CORRECT || phase === Phase.COMPLETE) return;
    clearTimeout(phaseTimer.current);
    setItemHint(item.hint || null);

    if (isCorrect) {
      setLockedId(item.id);
      if (currentRound === 0) setIsSweeping(true);
      setPhase(Phase.CORRECT);

      phaseTimer.current = setTimeout(() => {
        setIsSweeping(false);
        const next = currentRound + 1;
        if (next >= TOTAL_ROUNDS) {
          setPhase(Phase.COMPLETE);
          setCompleted(true);
          finishQuest();
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

  const finishQuest = () => {
    saveNPCProgress("village", npcId, TOTAL_ROUNDS, true);
    if (playerId) {
      fetch(`${API}/api/challenge/quest/submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ playerId, questId, npcId, score: TOTAL_ROUNDS, maxScore: TOTAL_ROUNDS, passed: true }),
      }).catch(err => console.warn("[IA] Sync failed:", err));
    }

    setTimeout(() => {
      const nextIndex = sequenceIndex + 1;
      const nextStep  = questSequence[nextIndex];
      const sharedState = { questId, kitchenQuestId, bedroomQuestId, iaQuestId, npcId, npcName, returnTo, questSequence };

      if (!nextStep) {
        navigate(returnTo, { state: { completed: true } });
        return;
      }
      if (nextStep.type === "drag_drop") {
        navigate("/student/house", {
          state: { ...sharedState, questId: nextStep.questId, sceneType: nextStep.sceneType, sequenceIndex: nextIndex },
        });
      }
    }, 2000);
  };

  const handleBack = () => navigate(returnTo);
  const npcText = getNPCText(phase, introText, { roundPrompt, roundReprompt, itemHint });

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
          Step 2 of 2 &nbsp;|&nbsp;
          {phase === Phase.INTRO
            ? `Intro ${introStep + 1} / ${introSteps.length}`
            : `Round ${currentRound + 1} / ${TOTAL_ROUNDS}`}
        </div>

        // ── Choices grid rendering safely
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

        {/* ── Scene images safely ──────────────────────────────────────────── */}
        {phase !== Phase.INTRO && correctItem?.sceneImages?.filter(Boolean)?.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Scene element"
            className={`ia-scene ia-scene-${currentRound}-${index}`}
            draggable={false}
          />
        ))}

        {isSweeping && currentRound === 0 && (
          <img src={BroomImage} alt="Broom sweeping" className="ia-broom-sweep" draggable={false} />
        )}

        {phase !== Phase.INTRO && currentItems.length === 0 && (
          <div style={{
            position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)",
            background:"rgba(200,0,0,0.85)", color:"#fff", padding:"12px 24px",
            borderRadius:8, zIndex:100, fontSize:13, textAlign:"center",
          }}>
            ⚠️ Round {currentRound + 1} has no items!<br/>
            Check display_order = {currentRound + 1} in challenge_items.
          </div>
        )}

        <div className="ia-npc-section">
          <img src={LigayaCharacter} alt={npcName} className="ia-npc-img" draggable={false} />
          <div className="ia-dialogue-wrapper">
            <DialogueBox
              title={npcName} text={npcText} showNextButton={false}
              variant={
                phase === Phase.WRONG   ? "error"   :
                phase === Phase.CORRECT ? "success" : "default"
              }
            />
            {phase === Phase.INTRO && (
              isLastIntroStep ? (
                <div className="ia-intro-choices">
                  <Button variant="primary" onClick={handleIntroNext}>✓ Let's start! / Sugod na!</Button>
                </div>
              ) : (
                <Button variant="arrow" className="ia-next-btn" onClick={handleIntroNext}>
                  <img src={Arrow} alt="Next" className="ia-arrow-img" />
                </Button>
              )
            )}
          </div>
        </div>

        {completed && (
          <div className="ia-completion-overlay">
            <div className="ia-completion-card">
              <div className="ia-completion-stars">⭐⭐⭐</div>
              <h2>Ayos kaayo! Challenge Complete!</h2>
              <p>Padayon sa sunod na round! 🎯</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const buildFallbackRounds = () => {
  const raw = [
    [
      { id:"r1c",  label:"Broom / Walis",     isCorrect:true,
        roundPrompt:"Dirty ang salog! Unsa ang gamiton para mag-silhig?",
        roundReprompt:"Sulayi pag-usab! Unsa ang para sa pag-silhig?",
        hint:"Tama! Broom / Walis ang gamiton sa pag-silhig!",
        sceneImages:[Trash1, FoodWrappers, FoodWrappers2] },
      { id:"r1w1", label:"Bucket / Timba",    isCorrect:false, hint:"Bucket / Timba holds water!" },
      { id:"r1w2", label:"Pillow / Almohada", isCorrect:false, hint:"Pillow / Almohada is for sleeping!" },
      { id:"r1w3", label:"Book / Libro",      isCorrect:false, hint:"Book / Libro is for reading!" },
    ],
    [
      { id:"r2c",  label:"Wet Rag / Trapo",   isCorrect:true,
        roundPrompt:"Basa ang lamesa! Unsa ang gamiton para mag-punas?",
        roundReprompt:"Sayop! Unsa ang para sa pag-punas?",
        hint:"Tama! Wet Rag / Trapo ang gamiton sa pag-punas!",
        sceneImages:[SpilledWater, Water] },
      { id:"r2w1", label:"Broom / Walis",     isCorrect:false, hint:"Broom / Walis sweeps dry floors!" },
      { id:"r2w2", label:"Fork / Tinidor",    isCorrect:false, hint:"Fork / Tinidor is for eating!" },
      { id:"r2w3", label:"Blanket / Habol",   isCorrect:false, hint:"Blanket / Habol keeps you warm!" },
    ],
    [
      { id:"r3c",  label:"Brush / Sipilyo",   isCorrect:true,
        roundPrompt:"May sapot sa kisame! Unsa ang gamiton para tangtangon?",
        roundReprompt:"Dili na! Unsa ang para sa sapot sa kisame?",
        hint:"Husto! Brush / Sipilyo ang gamiton para sa sapot!" },
      { id:"r3w1", label:"Mop / Mop",         isCorrect:false, hint:"Mop / Mop cleans the floor!" },
      { id:"r3w2", label:"Pencil / Lapis",    isCorrect:false, hint:"Pencil / Lapis is for writing!" },
      { id:"r3w3", label:"Spoon / Kutsara",   isCorrect:false, hint:"Spoon / Kutsara is for eating!" },
    ],
  ];
  return raw.map(group => [...group].sort(() => Math.random() - 0.5));
};

export default ItemAssociation;