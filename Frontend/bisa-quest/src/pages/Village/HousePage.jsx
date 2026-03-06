// ─────────────────────────────────────────────────────────────────────────────
//  HousePage.jsx  —  Scenario-driven Village quest page
//
//  One questId = one full scenario:
//    Phase 1 — Story Introduction  (flow_type: main, step_order 1..N)
//    Phase 2 — Comprehension       (last main step shows 2 ClickableItems)
//    Phase 3 — Drag & Drop         (challenge_items: label only, one card per row)
//    Phase 4 — Feedback            (flow_type: correct / wrong_*)
//
//  Speaker field drives DialogueBox style:
//    "Narration" → italic narration bar
//    anything else → normal NPC bar
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button           from "../../components/Button";
import DialogueBox      from "../../components/instructions/DialogueBox";
import ClickableItem    from "../../game/components/ClickableItem";
import ZoneDebugOverlay from "../../game/components/ZoneDebugOverlay";

import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import houseBackground from "../../assets/images/environments/scenario/house.jpg";

import {
  SCENE_BACKGROUNDS,
  ZONE_REGISTRY,
  SCENE_ZONE_OVERRIDES,
  DEFAULT_BACKGROUND,
  ITEM_IMAGE_MAP,
} from "../../game/dragDropConstants";
import { getPlayerId, saveNPCProgress } from "../../utils/playerStorage";
import "./HousePage.css";

// ── NPC image map (extend as Vicente / Nando are added) ───────────────────────
const NPC_IMAGES = {
  village_npc_2: LigayaCharacter,
};

const SCENE_BG = {
  living_room: houseBackground,
  // kitchen: kitchenBackground,   ← add when asset ready
  // bedroom: bedroomBackground,
};

// ── Speaker classifiers ───────────────────────────────────────────────────────
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

// ── Phase enum ────────────────────────────────────────────────────────────────
const Phase = {
  STORY:         "story",          // Phase 1 — story intro dialogues
  COMPREHENSION: "comprehension",  // Phase 2 — 2-choice picture click
  COMP_BRANCH:   "comp_branch",    // Phase 2 — correct/wrong branch after click
  DRAG_DROP:     "drag_drop",      // Phase 3 — word card drag & drop
  FEEDBACK:      "feedback",       // Phase 4 — post-DD feedback dialogues
  DONE:          "done",           // scenario complete
};

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Component ─────────────────────────────────────────────────────────────────
const HousePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playerId = getPlayerId();
  const API      = import.meta.env.VITE_API_URL || "";

  // Route state
  const questId       = location.state?.questId       || null;
  const npcId         = location.state?.npcId         || "village_npc_2";
  const npcName       = location.state?.npcName       || "Ligaya";
  const returnTo      = location.state?.returnTo      || "/student/village";
  const questSequence = location.state?.questSequence || [];
  const seqIndex      = location.state?.sequenceIndex ?? 0;

  const NpcImage = NPC_IMAGES[npcId] || LigayaCharacter;

  // ── Data state ─────────────────────────────────────────────────────────────
  const [loading,         setLoading]         = useState(true);
  const [fetchError,      setFetchError]      = useState(null);
  const [background,      setBackground]      = useState(houseBackground);
  const [flowGroups,      setFlowGroups]      = useState({});
  const [compItems,       setCompItems]       = useState([]);
  const [ddWordCards,     setDdWordCards]     = useState([]);
  const [ddDropZoneLabel, setDdDropZoneLabel] = useState("");

  // ── Phase + dialogue cursor state ─────────────────────────────────────────
  const [phase,       setPhase]       = useState(Phase.STORY);
  const [storyIdx,    setStoryIdx]    = useState(0);
  const [branchKey,   setBranchKey]   = useState(null);
  const [branchIdx,   setBranchIdx]   = useState(0);
  const [feedbackKey, setFeedbackKey] = useState(null);
  const [feedbackIdx, setFeedbackIdx] = useState(0);
  const [compLocked,  setCompLocked]  = useState(null);

  // ── DD state ───────────────────────────────────────────────────────────────
  const [ddIntroItem,   setDdIntroItem]   = useState(null);  // correct item shown during story steps
  const [ddPlaced,      setDdPlaced]      = useState({});
  const [ddShake,       setDdShake]       = useState(null);
  const [ddCompleted,   setDdCompleted]   = useState(false);
  const [draggingWord,  setDraggingWord]  = useState(null);
  const [dropHover,     setDropHover]     = useState(false);
  const [ddDropZonePos, setDdDropZonePos] = useState({ x: 50, y: 40 });
  const [gridMode,      setGridMode]      = useState(false);
  const [hoverCell,     setHoverCell]     = useState(null);

  const containerRef = useRef(null);

  // ── Derived current dialogue row ──────────────────────────────────────────
  const currentRow = (() => {
    if (phase === Phase.STORY)       return flowGroups.main?.[storyIdx]          ?? null;
    if (phase === Phase.COMP_BRANCH) return flowGroups[branchKey]?.[branchIdx]   ?? null;
    if (phase === Phase.FEEDBACK)    return flowGroups[feedbackKey]?.[feedbackIdx] ?? null;
    return null;
  })();

  const isLastStoryStep = flowGroups.main
    ? storyIdx === flowGroups.main.length - 1
    : false;

  // ── Load quest data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!questId) {
      setFetchError("No quest selected. Please go back and try again.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const [metaRes, dialoguesRes, itemsRes] = await Promise.all([
          fetch(`${API}/api/challenge/quest/${questId}`),
          fetch(`${API}/api/challenge/quest/${questId}/dialogues`),
          fetch(`${API}/api/challenge/quest/${questId}/items?randomize=false`), // ← get ALL items, no random filtering
        ]);
        if (!metaRes.ok)      throw new Error(`Quest meta: ${metaRes.status}`);
        if (!dialoguesRes.ok) throw new Error(`Dialogues: ${dialoguesRes.status}`);
        if (!itemsRes.ok)     throw new Error(`Items: ${itemsRes.status}`);

        const { data: meta }      = await metaRes.json();
        const { data: dialogues } = await dialoguesRes.json();
        const { data: rawItems }  = await itemsRes.json();

        if (cancelled) return;

        const scene = meta?.scene_type || "living_room";
        setBackground(SCENE_BG[scene] || houseBackground);

        if (!dialogues?.length) throw new Error("No dialogues found for this quest.");
        setFlowGroups(groupByFlow(dialogues));

        const sortedItems = [...(rawItems || [])].sort(
          (a, b) => Number(a.display_order ?? 99) - Number(b.display_order ?? 99)
        );

        // ── Phase 2: Comprehension (round_number = 0) ────────────────────────
        // Dynamic x/y preserved. belongsTo added for accurate branch matching.
        const compRaw = sortedItems.filter(r => Number(r.round_number) === 0);
        if (compRaw.length === 0)
          console.warn("[HousePage] No comprehension items (round_number=0) found for quest", questId);
        setCompItems(compRaw.map(r => ({
          id:        String(r.item_id),
          label:     r.label,
          imageKey:  r.image_key  || null,
          isCorrect: Boolean(r.is_correct),
          hint:      r.hint       || null,
          belongsTo: r.belongs_to || null,   // ← FIX 1: carry belongs_to from DB
          x:         Number(r.position_x ?? 60),
          y:         Number(r.position_y ?? 30),
        })));

        // ── Phase 3: DD (round_number = 1) ───────────────────────────────────
        // ONE card per DB row using label — dynamic x/y preserved.
        const ddRaw = sortedItems.filter(r => Number(r.round_number) === 1);
        if (ddRaw.length === 0)
          console.warn("[HousePage] No DD items (round_number=1) found for quest", questId);

        const correctDDItem = ddRaw.find(r => Boolean(r.is_correct));
        setDdDropZoneLabel(correctDDItem?.label || "");
        setDdIntroItem(correctDDItem ? {
          id:       String(correctDDItem.item_id),
          label:    correctDDItem.label,
          imageKey: correctDDItem.image_key || null,
        } : null);

        // Hardcoded drop zone positions — mirrors ZONE_REGISTRY in dragDropConstants
        // Set correct_zone in SQL to pick which zone the drop target uses
        const SCENE_DROP_ZONES = {
          living_room: {
            bookshelf: { x: 83, y: 40 },
            sofa:      { x: 50, y: 48 },
            aparador:  { x: 73, y: 48 },
            lamesa:    { x: 53, y: 64 },
            sulok:     { x: 42, y: 40 },
            planggana: { x: 35, y: 62 },
          },
          kitchen: {
            stove:     { x: 57, y: 55 },
            counter:   { x: 20, y: 55 },
            rack:      { x: 25, y: 28 },
            dish_rack: { x: 78, y: 20 },
            ref:       { x: 67, y: 50 },
            sink:      { x: 45, y: 52 },
          },
          bedroom: {
            higdaanan:   { x: 28, y: 50 },
            bedAparador: { x: 70, y: 50 },
            salog:       { x: 30, y: 72 },
          },
        };
        const zoneKey    = correctDDItem?.correct_zone || null;
        const sceneZones = SCENE_DROP_ZONES[scene] || {};
        setDdDropZonePos(sceneZones[zoneKey] || sceneZones[Object.keys(sceneZones)[0]] || { x: 50, y: 40 });

        // ← FIX 2: one card per row, label only (no word_left / word_right split)
        const cards = ddRaw.map(r => ({
          id:        String(r.item_id),
          label:     r.label,
          imageKey:  r.image_key  || null,
          isCorrect: Boolean(r.is_correct),
          belongsTo: r.belongs_to || null,
          x:         Number(r.position_x ?? 50),
          y:         Number(r.position_y ?? 60),
        }));

        console.log(`[HousePage] quest=${questId} | comp=${compRaw.length} items | dd=${cards.length} cards`);
        setDdWordCards(cards);
        setDdPlaced({});
        setLoading(false);
      } catch (err) {
        console.error("[HousePage]", err);
        if (!cancelled) { setFetchError(err.message); setLoading(false); }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [questId, API]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {

    if (phase === Phase.STORY) {
      if (!isLastStoryStep) {
        setStoryIdx(i => i + 1);
      } else {
        compItems.length > 0 ? setPhase(Phase.COMPREHENSION) : setPhase(Phase.DRAG_DROP);
      }
      return;
    }

    if (phase === Phase.COMP_BRANCH) {
      const branchRows = flowGroups[branchKey] || [];
      if (branchIdx < branchRows.length - 1) {
        setBranchIdx(i => i + 1);
      } else if (branchKey === "correct_comp") {   // ← FIX 3: SQL uses "correct_comp"
        setCompLocked(null);
        setPhase(Phase.DRAG_DROP);
      } else {
        setCompLocked(null);
        setBranchKey(null);
        setBranchIdx(0);
        setPhase(Phase.COMPREHENSION);
      }
      return;
    }

    if (phase === Phase.FEEDBACK) {
      const feedbackRows = flowGroups[feedbackKey] || [];
      if (feedbackIdx < feedbackRows.length - 1) {
        setFeedbackIdx(i => i + 1);
      } else if (feedbackKey === "correct") {
        submitProgress();
        advanceSequence();
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
  }, [phase, isLastStoryStep, storyIdx, branchKey, branchIdx,
      feedbackKey, feedbackIdx, flowGroups, compItems]);

  // ── Phase 2: Comprehension click ──────────────────────────────────────────
  const handleCompClick = useCallback((item, isCorrect) => {
    if (compLocked) return;
    setCompLocked(item.id);

    if (isCorrect) {
      // ← FIX 3: SQL flow_type is "correct_comp" for comprehension correct branch
      const target = flowGroups["correct_comp"] ? "correct_comp" : null;
      if (!target) { setPhase(Phase.DRAG_DROP); return; }
      setBranchKey("correct_comp");
      setBranchIdx(0);
      setPhase(Phase.COMP_BRANCH);
    } else {
      // ← FIX 1: use belongs_to from DB first, keyword match as fallback
      const wrongKeys = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));
      const target = (item.belongsTo && flowGroups[item.belongsTo])
        ? item.belongsTo
        : (() => {
            const words = item.label.toLowerCase().split(/[\s/,_-]+/);
            const match = wrongKeys.find(k => words.some(w => w.length > 2 && k.includes(w)));
            return (match && flowGroups[match]) ? match : wrongKeys[0] || null;
          })();
      if (!target) { setCompLocked(null); return; }
      setBranchKey(target);
      setBranchIdx(0);
      setPhase(Phase.COMP_BRANCH);
    }
  }, [compLocked, flowGroups]);

  // ── Phase 3: DD handlers ───────────────────────────────────────────────────
  const handleWordDragStart = (card, e) => {
    if (ddPlaced[card.id] === "correct") return;
    e.dataTransfer.setData("cardId", card.id);
    setDraggingWord(card.id);
  };

  const handleDropZoneDragOver  = (e) => { e.preventDefault(); setDropHover(true); };
  const handleDropZoneDragLeave = () => setDropHover(false);

  const handleDropZoneDrop = useCallback((e) => {
    e.preventDefault();
    setDropHover(false);
    const cardId = e.dataTransfer.getData("cardId");
    setDraggingWord(null);
    const card = ddWordCards.find(c => c.id === cardId);
    if (!card) return;

    if (card.isCorrect) {
      const newPlaced = { ...ddPlaced, [cardId]: "correct" };
      setDdPlaced(newPlaced);
      const allPlaced = ddWordCards
        .filter(c => c.isCorrect)
        .every(c => newPlaced[c.id] === "correct");
      if (allPlaced) setDdCompleted(true);
    } else {
      setDdShake(cardId);
      setTimeout(() => setDdShake(null), 600);

      // ← FIX 1: belongs_to first, keyword fallback on label
      const wrongKeys = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));
      const target = (card.belongsTo && flowGroups[card.belongsTo])
        ? card.belongsTo
        : (() => {
            const words = (card.label || "").toLowerCase().split(/[\s/,_-]+/);
            const match = wrongKeys.find(k => words.some(w => w.length > 2 && k.includes(w)));
            return (match && flowGroups[match]) ? match : wrongKeys[0] || null;
          })();

      if (target) {
        setFeedbackKey(target);
        setFeedbackIdx(0);
        setPhase(Phase.FEEDBACK);
      }
    }
  }, [ddWordCards, ddPlaced, flowGroups]);

  const handleDDComplete = () => {
    if (!ddCompleted) return;
    const target = flowGroups["correct"] ? "correct" : null;
    if (!target) { submitProgress(); advanceSequence(); return; }
    setFeedbackKey("correct");
    setFeedbackIdx(0);
    setPhase(Phase.FEEDBACK);
  };

  // ── Submit + advance ───────────────────────────────────────────────────────
  const submitProgress = () => {
    saveNPCProgress("village", npcId, 1, true);
    if (playerId) {
      fetch(`${API}/api/challenge/quest/submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ playerId, questId, npcId, score: 1, maxScore: 1, passed: true }),
      }).catch(err => console.warn("[HousePage] submit failed:", err));
    }
  };

  const advanceSequence = useCallback(() => {
    const nextIndex = seqIndex + 1;
    const nextStep  = questSequence[nextIndex];
    if (!nextStep) {
      navigate(returnTo, { state: { completed: true } });
      return;
    }
    navigate("/student/house", {
      state: {
        questId:       nextStep.questId,
        npcId, npcName, returnTo,
        questSequence,
        sequenceIndex: nextIndex,
        sceneType:     nextStep.sceneType,
      },
    });
  }, [seqIndex, questSequence, navigate, returnTo, npcId, npcName]);

  const handleBack = () => navigate(returnTo);

  // ── Dialogue bar ───────────────────────────────────────────────────────────
  const currentSpeaker  = currentRow?.speaker || null;
  const dialogueSpeaker = currentRow
    ? resolveSpeaker(currentSpeaker, npcName)
    : npcName;

  const dialogueText = (() => {
    if (loading)    return "...";
    if (currentRow) return currentRow.dialogue_text || "";
    if (phase === Phase.COMPREHENSION) return "So, what do you think? Click the correct answer!";
    if (phase === Phase.DRAG_DROP)     return ddCompleted
      ? "Tama! Now click Complete to confirm!"
      : "Drag the correct word card to the picture!";
    return "";
  })();

  const showNextBtn = !!(currentRow) &&
    phase !== Phase.COMPREHENSION &&
    phase !== Phase.DRAG_DROP;

  const rightSlot = phase === Phase.DRAG_DROP ? (
    <div className="house-dd-bar-slot-wrap">
      {/* Equip slot — player drags word card here */}
      <div
        className={[
          "house-dd-equip-slot",
          dropHover          ? "house-dd-equip-slot--hover"    : "",
          ddCompleted        ? "house-dd-equip-slot--complete"  : "",
        ].filter(Boolean).join(" ")}
        onDragOver={handleDropZoneDragOver}
        onDragLeave={handleDropZoneDragLeave}
        onDrop={handleDropZoneDrop}
      >
        {ddWordCards.filter(c => ddPlaced[c.id] === "correct").length > 0 ? (
          <div className="house-dd-equip-chips">
            {ddWordCards.filter(c => ddPlaced[c.id] === "correct").map(c => (
              <span key={c.id} className="house-dd-chip house-dd-chip--correct">{c.word}</span>
            ))}
          </div>
        ) : (
          <span className="house-dd-equip-hint">Drop here</span>
        )}
      </div>

      {/* Complete button */}
      <button
        className={`house-complete-btn ${ddCompleted ? "house-complete-btn--active" : "house-complete-btn--disabled"}`}
        onClick={handleDDComplete}
        disabled={!ddCompleted}
      >
        Completo na!
      </button>
    </div>
  ) : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="house-container">
      <img src={houseBackground} alt="" className="house-background" draggable={false} />
      <div className="house-loading"><span>Gi-load ang dula...</span></div>
    </div>
  );

  if (fetchError) return (
    <div className="house-container">
      <img src={houseBackground} alt="" className="house-background" draggable={false} />
      <div className="house-loading">
        <p style={{ color: "#fff", fontFamily: "'Fredoka One', cursive", fontSize: 18 }}>{fetchError}</p>
        <Button variant="back" onClick={handleBack}>← Back</Button>
      </div>
    </div>
  );

  return (
    <div className="house-container">
      <img src={background} alt="Scene" className="house-background" draggable={false} />

      <Button variant="back" className="house-back" onClick={handleBack}>← Back</Button>

      <button
        className={`house-grid-btn ${gridMode ? "house-grid-btn--on" : ""}`}
        onClick={() => setGridMode(p => !p)}
      >
        {gridMode ? "📐 Grid ON" : "📐 Grid"}
      </button>

      <div className="house-scene-label">
        {phase === Phase.STORY         && "Story Introduction"}
        {phase === Phase.COMPREHENSION && "Comprehension Check"}
        {phase === Phase.COMP_BRANCH   && "Comprehension Check"}
        {phase === Phase.DRAG_DROP     && "Drag & Drop Activity"}
        {phase === Phase.FEEDBACK      && "Feedback"}
      </div>

      {/* ── Phase 2: Comprehension — dynamic x/y from DB ────────────────── */}
      {phase === Phase.COMPREHENSION && compItems.length > 0 && compItems.map(item => (
        <div
          key={item.id}
          className="house-comp-item"
          style={{
            left: `${Math.min(Math.max(item.x, 5), 90)}%`,
            top:  `${Math.min(Math.max(item.y, 5), 72)}%`,
          }}
        >
          <ClickableItem
            item={item}
            onClick={handleCompClick}
            locked={compLocked === item.id}
          />
        </div>
      ))}

      {/* ── Phase 3: Drag & Drop ────────────────────────────────────────── */}
      {phase === Phase.DRAG_DROP && (
        <div className="house-dd-scene" ref={containerRef}>

          {/* Word cards — dynamic x/y from DB, one per row, label only */}
          {ddWordCards.map(card => {
            const placed  = ddPlaced[card.id] === "correct";
            const shaking = ddShake === card.id;
            return (
              <div
                key={card.id}
                className={[
                  "house-dd-card",
                  placed              ? "house-dd-card--placed"   : "",
                  shaking             ? "house-dd-card--shake"    : "",
                  draggingWord === card.id ? "house-dd-card--dragging" : "",
                ].filter(Boolean).join(" ")}
                style={{
                  left:      `${Math.min(Math.max(card.x, 5), 88)}%`,
                  top:       `${Math.min(Math.max(card.y, 5), 72)}%`,
                  transform: "translate(-50%, -50%)",
                }}
                draggable={!placed}
                onDragStart={(e) => handleWordDragStart(card, e)}
                onDragEnd={() => setDraggingWord(null)}
              >
                {card.imageKey && ITEM_IMAGE_MAP[card.imageKey]
                  ? <img
                      src={ITEM_IMAGE_MAP[card.imageKey]}
                      alt={card.label}
                      className="house-dd-card-img"
                      draggable={false}
                    />
                  : <span className="house-dd-card-emoji">🖼️</span>
                }
                <span className="house-dd-card-label">{card.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dev grid overlay ───────────────────────────────────────────── */}
      {gridMode && (
        <div className="house-grid-overlay"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.round(((e.clientX - rect.left) / rect.width)  * 100);
            const y = Math.round(((e.clientY - rect.top)  / rect.height) * 100);
            setHoverCell({ x, y });
          }}
          onMouseLeave={() => setHoverCell(null)}
        >
          {Array.from({ length: 11 }, (_, i) => (
            <div key={`v${i}`} className="house-grid-line house-grid-line--v" style={{ left: `${i * 10}%` }} />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <div key={`h${i}`} className="house-grid-line house-grid-line--h" style={{ top: `${i * 10}%` }} />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <span key={`xl${i}`} className="house-grid-label house-grid-label--x"
              style={{ left: `${i * 10 + 5}%`, top: 2 }}>
              {i * 10 + 5}
            </span>
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <span key={`yl${i}`} className="house-grid-label house-grid-label--y"
              style={{ top: `${i * 10 + 5}%`, left: 4 }}>
              {i * 10 + 5}
            </span>
          ))}
          {hoverCell && (
            <>
              <div className="house-grid-crosshair house-grid-crosshair--v" style={{ left: `${hoverCell.x}%` }} />
              <div className="house-grid-crosshair house-grid-crosshair--h" style={{ top:  `${hoverCell.y}%` }} />
              <div className="house-grid-coord" style={{ left: `${Math.min(hoverCell.x + 1, 72)}%`, top: `${Math.max(hoverCell.y - 6, 2)}%` }}>
                x: {hoverCell.x}, y: {hoverCell.y}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── NPC — floats above dialogue bar ─────────────────────────────── */}
      <div className="house-npc-wrap">
        <img src={NpcImage} alt={npcName} className="house-npc-image" draggable={false} />
      </div>

      {/* ── Shared DialogueBox ───────────────────────────────────────────── */}
      <DialogueBox
        title={dialogueSpeaker}
        text={dialogueText}
        isNarration={isNarration(currentSpeaker)}
        isPlayer={isPlayer(currentSpeaker)}
        showNextButton={showNextBtn}
        onNext={handleNext}
        rightSlot={rightSlot}
        introItem={
          phase === Phase.STORY &&
          ddIntroItem &&
          Number(currentRow?.step_order) >= 3
            ? ddIntroItem
            : null
        }
      />

      {/* ── Done overlay ─────────────────────────────────────────────────── */}
      {phase === Phase.DONE && (
        <div className="house-overlay">
          <div className="house-card">
            <div className="house-card-stars">⭐⭐⭐</div>
            <h2>Scenario Complete!</h2>
            <p>Padayon sa sunod! 🎯</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousePage;