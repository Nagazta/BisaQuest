import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button          from "../components/Button";
import DialogueBox     from "../components/instructions/DialogueBox";
import ClickableItem   from "./components/ClickableItem";
import LigayaCharacter from "../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import Arrow           from "../assets/images/signs/arrow.png";

import { getPlayerId, saveNPCProgress } from "../utils/playerStorage";
import { DEFAULT_BACKGROUND, SCENE_BACKGROUNDS, IA_ITEM_POSITIONS } from "./dragDropConstants";
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
    case Phase.SCENARIO: return roundPrompt   || "Click the correct item! / I-click ang tamang sagot!";
    case Phase.CORRECT:  return itemHint      || "Correct! / Husto! ✓";
    case Phase.WRONG: {
      const base = roundReprompt || "Not quite! Try again! / Hindi pa! Sulayi pag-usab!";
      return itemHint ? `${base}\n\n${itemHint}` : base;
    }
    case Phase.COMPLETE: return "Amazing! You got all three right! / Kahanga-hanga! 🎉";
    default:             return "...";
  }
};

const ItemAssociation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const questId  = location.state?.questId  || null;
  const npcId    = location.state?.npcId    || "village_npc_2";
  const npcName  = location.state?.npcName  || "Ligaya";
  const returnTo = location.state?.returnTo || "/student/village";
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
  const [roundKey,     setRoundKey]     = useState(0);   // forces card remount each round
  const [itemHint,     setItemHint]     = useState(null);
  const [lockedId,     setLockedId]     = useState(null);
  const [completed,    setCompleted]    = useState(false);

  const phaseTimer = useRef(null);

  const currentItems  = rounds[currentRound] || [];
  const correctItem   = currentItems.find(i => i.isCorrect);
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

        if (!questRes.ok)     throw new Error(`Quest fetch failed: ${questRes.status}`);
        if (!dialoguesRes.ok) throw new Error(`Dialogues fetch failed: ${dialoguesRes.status}`);
        if (!itemsRes.ok)     throw new Error(`Items fetch failed: ${itemsRes.status}`);

        const { data: questMeta } = await questRes.json();
        const { data: dialogues } = await dialoguesRes.json();
        const { data: rawItems }  = await itemsRes.json();

        const scene = questMeta?.scene_type || "living_room";
        setBackground(SCENE_BACKGROUNDS[scene] || DEFAULT_BACKGROUND);

        setIntroSteps(
          Array.isArray(dialogues) && dialogues.length > 0
            ? dialogues.map(r => r.dialogue_text)
            : [questMeta?.instructions || "Click the correct item!"]
        );

        // Group by round_number 1/2/3 → array index 0/1/2
        const grouped = [[], [], []];
        for (const row of rawItems) {
          const idx = (row.round_number ?? 1) - 1;
          if (idx >= 0 && idx < TOTAL_ROUNDS) grouped[idx].push(row);
        }

        // Debug — remove after confirming data
        console.log("[IA] items by round:", grouped.map((g,i) => `R${i+1}:${g.length}`).join(" "));

        const mapped = grouped.map(group => {
          if (!group.length) return [];
          return [...group]
            .sort(() => Math.random() - 0.5)
            .map((row, i) => ({
              id:            String(row.item_id),
              label:         row.label,
              isCorrect:     row.is_correct,
              hint:          row.hint           || null,
              roundPrompt:   row.round_prompt   || null,
              roundReprompt: row.round_reprompt || null,
              x:             IA_ITEM_POSITIONS[i]?.x ?? 50,
              y:             IA_ITEM_POSITIONS[i]?.y ?? 50,
            }));
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
      setPhase(Phase.CORRECT);

      phaseTimer.current = setTimeout(() => {
        const next = currentRound + 1;
        if (next >= TOTAL_ROUNDS) {
          setPhase(Phase.COMPLETE);
          setCompleted(true);
          finishQuest();
        } else {
          // Reset ALL per-round state before advancing
          setCurrentRound(next);
          setLockedId(null);        // ← clear locked card
          setItemHint(null);
          setPhase(Phase.SCENARIO);
          setRoundKey(k => k + 1); // ← force ClickableItem remount
        }
      }, 1800);
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, questId, npcId, score: TOTAL_ROUNDS, maxScore: TOTAL_ROUNDS, passed: true }),
      }).catch(err => console.warn("[IA] Sync failed:", err));
    }
    setTimeout(() => navigate(returnTo, { state: { completedQuestId: questId } }), 2000);
  };

  const handleBack = () => navigate(returnTo);

  const npcText = getNPCText(phase, introText, { roundPrompt, roundReprompt, itemHint });

  if (loading) return (
    <div className="ia-wrapper"><div className="ia-container">
      <img src={DEFAULT_BACKGROUND} alt="Loading" className="ia-bg" draggable={false} />
      <div className="ia-loading"><span>Loading... / Gi-load...</span></div>
    </div></div>
  );

  if (fetchError) return (
    <div className="ia-wrapper"><div className="ia-container">
      <img src={DEFAULT_BACKGROUND} alt="Error" className="ia-bg" draggable={false} />
      <div className="ia-error">
        <p>Could not load. / Dili ma-load.</p>
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

        {phase !== Phase.INTRO && (
          <div className="ia-round-dots">
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <div key={i} className={`ia-dot ${
                i < currentRound   ? "ia-dot--done"   :
                i === currentRound ? "ia-dot--active" :
                                     "ia-dot--pending"
              }`} />
            ))}
          </div>
        )}

        {/* Items — key includes roundKey so cards fully remount each round */}
        {phase !== Phase.INTRO && currentItems.map(item => (
          <ClickableItem
            key={`rk${roundKey}-${item.id}`}
            item={item}
            onClick={handleItemClick}
            locked={lockedId === item.id}
          />
        ))}

        {/* Dev warning if a round has no items */}
        {phase !== Phase.INTRO && currentItems.length === 0 && (
          <div style={{
            position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)",
            background:"rgba(200,0,0,0.85)", color:"#fff", padding:"12px 24px",
            borderRadius:8, zIndex:100, fontSize:13, textAlign:"center",
          }}>
            ⚠️ Round {currentRound + 1} has no items!<br/>
            Check round_number = {currentRound + 1} in challenge_items.
          </div>
        )}

        <div className="ia-npc-section">
          <img src={LigayaCharacter} alt={npcName} className="ia-npc-img" draggable={false} />
          <div className="ia-dialogue-wrapper">
            <DialogueBox
              title={npcName}
              text={npcText}
              showNextButton={false}
              variant={
                phase === Phase.WRONG   ? "error"   :
                phase === Phase.CORRECT ? "success" : "default"
              }
            />
            {phase === Phase.INTRO && (
              isLastIntroStep ? (
                <div className="ia-intro-choices">
                  <Button variant="primary" onClick={handleIntroNext}>
                    ✓ Let's start! / Sugod na!
                  </Button>
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
              <h2>Challenge Complete! / Tapos na ang Hamon!</h2>
              <p>You finished all challenges! / Natapos mo ang lahat!</p>
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
        roundPrompt:"Floor is full of trash! Which tool sweeps it?",
        roundReprompt:"Not quite! Which sweeps?",
        hint:"Yes! A broom sweeps the floor!" },
      { id:"r1w1", label:"Bucket / Timba",    isCorrect:false, roundPrompt:null, roundReprompt:null, hint:"Bucket holds water!" },
      { id:"r1w2", label:"Pillow / Almohada", isCorrect:false, roundPrompt:null, roundReprompt:null, hint:"Pillow is for sleeping!" },
      { id:"r1w3", label:"Book / Libro",      isCorrect:false, roundPrompt:null, roundReprompt:null, hint:"Book is for reading!" },
    ],
    [
      { id:"r2c",  label:"Wet Rag / Trapo",   isCorrect:true,
        roundPrompt:"Table is wet! Which tool wipes it?",
        roundReprompt:"Not that one! Which wipes?",
        hint:"Correct! Wet rag wipes surfaces!" },
      { id:"r2w1", label:"Broom / Walis",     isCorrect:false, roundPrompt:null, roundReprompt:null, hint:"Broom sweeps dry floors!" },
      { id:"r2w2", label:"Fork / Tinidor",    isCorrect:false, roundPrompt:null, roundReprompt:null, hint:"Fork is for eating!" },
      { id:"r2w3", label:"Blanket / Habol",   isCorrect:false, roundPrompt:null, roundReprompt:null, hint:"Blanket keeps you warm!" },
    ],
    [
      { id:"r3c",  label:"Brush / Sipilyo",   isCorrect:true,
        roundPrompt:"Cobwebs on the ceiling! Which removes them?",
        roundReprompt:"Not quite! Which reaches cobwebs?",
        hint:"Right! Brush removes cobwebs!" },
      { id:"r3w1", label:"Mop / Mop",         isCorrect:false, roundPrompt:null, roundReprompt:null, hint:"Mop cleans the floor!" },
      { id:"r3w2", label:"Pencil / Lapis",    isCorrect:false, roundPrompt:null, roundReprompt:null, hint:"Pencil is for writing!" },
      { id:"r3w3", label:"Spoon / Kutsara",   isCorrect:false, roundPrompt:null, roundReprompt:null, hint:"Spoon is for eating!" },
    ],
  ];
  return raw.map(group => {
    const shuffled = [...group].sort(() => Math.random() - 0.5);
    return shuffled.map((item, i) => ({
      ...item,
      x: IA_ITEM_POSITIONS[i]?.x ?? 50,
      y: IA_ITEM_POSITIONS[i]?.y ?? 50,
    }));
  });
};

export default ItemAssociation;