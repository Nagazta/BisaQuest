// ─────────────────────────────────────────────────────────────────────────────
//  HousePage.jsx  —  Scenario-driven Village quest page
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button           from "../../components/Button";
import DialogueBox      from "../../components/instructions/DialogueBox";
import ClickableItem    from "../../game/components/ClickableItem";
import ZoneDebugOverlay from "../../game/components/ZoneDebugOverlay";
import BookCollectModal from "../../game/components/BookCollectModal";

import LigayaCharacter    from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import LigayaSweating     from "../../assets/images/characters/Ligaya_gealimut-an.png";
import houseBackground    from "../../assets/images/environments/scenario/house.jpg";
import dirtyLivingRoom    from "../../assets/images/environments/scenario/dirtyLivingRoom.PNG";

import {
  SCENE_BACKGROUNDS,
  ZONE_REGISTRY,
  SCENE_ZONE_OVERRIDES,
  DEFAULT_BACKGROUND,
  ITEM_IMAGE_MAP,
} from "../../game/dragDropConstants";
import {
  getPlayerId,
  saveNPCProgress,
  awardLibroPage,
  getLibroPageCount,
  getLibroPageCountForEnv,
} from "../../utils/playerStorage";
import "./HousePage.css";

// ── NPC image map ─────────────────────────────────────────────────────────────
const NPC_IMAGES = {
  village_npc_2: LigayaCharacter,
};

// ── Words awarded per NPC on completion ──────────────────────────────────────
const NPC_WORDS = {
  village_npc_2: ["WALIS", "BROOM", "TRAPO", "RAG", "MOP", "TIMBA", "BUCKET"],
  village_npc_3: ["PALA", "SHOVEL", "REGADERA", "WATERING CAN"],
  village_npc_1: ["SANTOL", "COTTON FRUIT", "LANSONES", "LANZONES", "PAKWAN", "WATERMELON", "MANGGA", "MANGO", "SAGING", "BANANA"],
};

// ── Background map ────────────────────────────────────────────────────────────
const SCENE_BG = {
  living_room:       houseBackground,
  living_room_dirty: dirtyLivingRoom,
};

const CLEAN_BG_FOR = {
  living_room_dirty: houseBackground,
};

// ── Speaker classifiers ───────────────────────────────────────────────────────
const isNarration = (speaker) =>
  typeof speaker === "string" && speaker.toLowerCase() === "narration";

const isPlayer = (speaker) =>
  typeof speaker === "string" && speaker.toLowerCase() === "player";

const resolveSpeaker = (speaker, fallback) => {
  if (!speaker)             return fallback;
  if (isNarration(speaker)) return "Narration";
  if (isPlayer(speaker))    return "Player";
  return speaker;
};

// ── Phase enum ────────────────────────────────────────────────────────────────
const Phase = {
  STORY:         "story",
  COMPREHENSION: "comprehension",
  COMP_BRANCH:   "comp_branch",
  DRAG_DROP:     "drag_drop",
  FEEDBACK:      "feedback",
  DONE:          "done",
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

  const questId       = location.state?.questId       || null;
  const npcId         = location.state?.npcId         || "village_npc_2";
  const npcName       = location.state?.npcName       || "Ligaya";
  const returnTo      = location.state?.returnTo      || "/student/village";
  const questSequence = location.state?.questSequence || [];
  const seqIndex      = location.state?.sequenceIndex ?? 0;

  const NpcImage = NPC_IMAGES[npcId] || LigayaCharacter;

  // ── Data state ─────────────────────────────────────────────────────────────
  const [loading,          setLoading]          = useState(true);
  const [fetchError,       setFetchError]        = useState(null);
  const [sceneType,        setSceneType]         = useState("living_room");
  const [background,       setBackground]        = useState(houseBackground);
  const [flowGroups,       setFlowGroups]        = useState({});
  const [compItems,        setCompItems]         = useState([]);
  const [ddWordCards,      setDdWordCards]       = useState([]);
  const [ddDropZoneLabel,  setDdDropZoneLabel]   = useState("");
  const [ddInstruction,    setDdInstruction]     = useState("");

  // ── Phase + dialogue cursor state ─────────────────────────────────────────
  const [phase,       setPhase]       = useState(Phase.STORY);
  const [storyIdx,    setStoryIdx]    = useState(0);
  const [branchKey,   setBranchKey]   = useState(null);
  const [branchIdx,   setBranchIdx]   = useState(0);
  const [feedbackKey, setFeedbackKey] = useState(null);
  const [feedbackIdx, setFeedbackIdx] = useState(0);
  const [compLocked,  setCompLocked]  = useState(null);

  // ── DD state ───────────────────────────────────────────────────────────────
  const [ddIntroItem,   setDdIntroItem]   = useState(null);
  const [ddPlaced,      setDdPlaced]      = useState({});
  const [ddShake,       setDdShake]       = useState(null);
  const [ddCompleted,   setDdCompleted]   = useState(false);
  const [draggingWord,  setDraggingWord]  = useState(null);
  const [dropHover,     setDropHover]     = useState(false);
  const [ddDropZonePos, setDdDropZonePos] = useState({ x: 50, y: 40 });
  const [ddDropMode,    setDdDropMode]    = useState("equip");
  const [gridMode,      setGridMode]      = useState(false);
  const [hoverCell,     setHoverCell]     = useState(null);

  // ── BG / sprite swap state ─────────────────────────────────────────────────
  const [bgRevealed,       setBgRevealed]       = useState(false);
  const [ligayaCool,       setLigayaCool]        = useState(false);
  const [isPaypayQuest,    setIsPaypayQuest]     = useState(false);
  const [isDirtyRoomQuest, setIsDirtyRoomQuest]  = useState(false);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showPageModal, setShowPageModal] = useState(false);
  const [collectedPage, setCollectedPage] = useState(null);

  const containerRef = useRef(null);

  // ── Derived current dialogue row ──────────────────────────────────────────
  const currentRow = (() => {
    if (phase === Phase.STORY)       return flowGroups.main?.[storyIdx]           ?? null;
    if (phase === Phase.COMP_BRANCH) return flowGroups[branchKey]?.[branchIdx]    ?? null;
    if (phase === Phase.FEEDBACK)    return flowGroups[feedbackKey]?.[feedbackIdx] ?? null;
    return null;
  })();

  const isLastStoryStep = flowGroups.main
    ? storyIdx === flowGroups.main.length - 1
    : false;

  // ── Derived: which NPC sprite to show ────────────────────────────────────
  const npcSprite = (() => {
    if (isPaypayQuest && npcId === "village_npc_2" && !ligayaCool) {
      return LigayaSweating;
    }
    return NpcImage;
  })();

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
          fetch(`${API}/api/challenge/quest/${questId}/items?randomize=false`),
        ]);
        if (!metaRes.ok)      throw new Error(`Quest meta: ${metaRes.status}`);
        if (!dialoguesRes.ok) throw new Error(`Dialogues: ${dialoguesRes.status}`);
        if (!itemsRes.ok)     throw new Error(`Items: ${itemsRes.status}`);

        const { data: meta }      = await metaRes.json();
        const { data: dialogues } = await dialoguesRes.json();
        const { data: rawItems }  = await itemsRes.json();

        if (cancelled) return;

        const scene = meta?.scene_type || "living_room";
        setSceneType(scene);
        setBackground(SCENE_BG[scene] || houseBackground);
        setDdInstruction(meta?.instructions || "");

        const dirty  = scene === "living_room_dirty";
        const paypay = (meta?.title || "").toLowerCase().includes("paypay") ||
                       (meta?.instructions || "").toLowerCase().includes("paypay") ||
                       (meta?.title || "").toLowerCase().includes("electric fan");
        setIsDirtyRoomQuest(dirty);
        setIsPaypayQuest(paypay);
        setBgRevealed(false);
        setLigayaCool(false);

        if (!dialogues?.length) throw new Error("No dialogues found for this quest.");
        setFlowGroups(groupByFlow(dialogues));

        const sortedItems = [...(rawItems || [])].sort(
          (a, b) => Number(a.display_order ?? 99) - Number(b.display_order ?? 99)
        );

        // Phase 2: Comprehension (round_number = 0)
        const compRaw = sortedItems.filter(r => Number(r.round_number) === 0);
        setCompItems(compRaw.map(r => ({
          id:        String(r.item_id),
          label:     r.label,
          imageKey:  r.image_key  || null,
          isCorrect: Boolean(r.is_correct),
          hint:      r.hint       || null,
          belongsTo: r.belongs_to || null,
          x:         Number(r.position_x ?? 60),
          y:         Number(r.position_y ?? 30),
        })));

        // Phase 3: DD (round_number = 1)
        const ddRaw         = sortedItems.filter(r => Number(r.round_number) === 1);
        const correctDDItem = ddRaw.find(r => Boolean(r.is_correct));
        setDdDropZoneLabel(correctDDItem?.label || "");
        setDdIntroItem(correctDDItem ? {
          id:       String(correctDDItem.item_id),
          label:    correctDDItem.label,
          imageKey: correctDDItem.image_key || null,
        } : null);

        const SCENE_DROP_ZONES = {
          living_room: {
            bookshelf: { x: 83, y: 40 },
            sofa:      { x: 50, y: 48 },
            aparador:  { x: 73, y: 48 },
            lamesa:    { x: 62, y: 64 },
            sulok:     { x: 42, y: 40 },
            planggana: { x: 35, y: 62 },
          },
          living_room_dirty: {
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

        const zoneKey     = correctDDItem?.correct_zone || null;
        const sceneZones  = SCENE_DROP_ZONES[scene] || {};
        const resolvedPos = zoneKey && sceneZones[zoneKey] ? sceneZones[zoneKey] : null;

        setDdDropMode(resolvedPos ? "scene" : "equip");
        setDdDropZonePos(resolvedPos || { x: 50, y: 40 });

        setDdWordCards(ddRaw.map(r => ({
          id:        String(r.item_id),
          label:     r.label,
          imageKey:  r.image_key  || null,
          isCorrect: Boolean(r.is_correct),
          belongsTo: r.belongs_to || null,
          x:         Number(r.position_x ?? 50),
          y:         Number(r.position_y ?? 60),
        })));

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
      } else if (branchKey === "correct_comp") {
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
      const target = flowGroups["correct_comp"] ? "correct_comp" : null;
      if (!target) { setPhase(Phase.DRAG_DROP); return; }
      setBranchKey("correct_comp");
      setBranchIdx(0);
      setPhase(Phase.COMP_BRANCH);
    } else {
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
      const allPlaced = ddWordCards.filter(c => c.isCorrect).every(c => newPlaced[c.id] === "correct");
      if (allPlaced) {
        setDdCompleted(true);
        if (isPaypayQuest) setLigayaCool(true);
      }
    } else {
      setDdShake(cardId);
      setTimeout(() => setDdShake(null), 600);

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
  }, [ddWordCards, ddPlaced, flowGroups, isPaypayQuest]);

  const handleDDComplete = () => {
    if (!ddCompleted) return;
    const target = flowGroups["correct"] ? "correct" : null;
    if (!target) { submitProgress(); return; }
    setFeedbackKey("correct");
    setFeedbackIdx(0);
    setPhase(Phase.FEEDBACK);
  };

  // ── Submit + advance ───────────────────────────────────────────────────────
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

  const submitProgress = useCallback(() => {
    // ── KEY FIX: pass NPC_WORDS so only this NPC's words get stored ──────────
    const words = NPC_WORDS[npcId] || [];
    saveNPCProgress("village", npcId, 1, true, 3, words);

    if (isDirtyRoomQuest && CLEAN_BG_FOR[sceneType]) {
      setBackground(CLEAN_BG_FOR[sceneType]);
      setBgRevealed(true);
    }

    const isNewPage = awardLibroPage("village", npcId);
    if (isNewPage) {
      const pageNumber     = getLibroPageCountForEnv("village");
      const totalCollected = getLibroPageCount();
      setCollectedPage({ pageNumber, totalCollected });
      setShowPageModal(true);
      return;
    }

    if (playerId) {
      fetch(`${API}/api/challenge/quest/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId, questId, npcId, score: 1, maxScore: 1, passed: true
        }),
      }).catch(err => console.warn("[HousePage] submit failed:", err));
    }

    advanceSequence();
  }, [npcId, playerId, questId, API, isDirtyRoomQuest, sceneType, advanceSequence]);

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
      : (ddInstruction || "Drag the correct word card to the picture!");
    return "";
  })();

  const showNextBtn = !!(currentRow) &&
    phase !== Phase.COMPREHENSION &&
    phase !== Phase.DRAG_DROP;

  const rightSlot = phase === Phase.DRAG_DROP ? (
    <div className="house-dd-bar-slot-wrap">
      {ddDropMode === "equip" && (
        <div
          className={[
            "house-dd-equip-slot",
            dropHover   ? "house-dd-equip-slot--hover"   : "",
            ddCompleted ? "house-dd-equip-slot--complete" : "",
          ].filter(Boolean).join(" ")}
          onDragOver={handleDropZoneDragOver}
          onDragLeave={handleDropZoneDragLeave}
          onDrop={handleDropZoneDrop}
        >
          {ddWordCards.filter(c => ddPlaced[c.id] === "correct").length > 0 ? (
            <div className="house-dd-equip-chips">
              {ddWordCards.filter(c => ddPlaced[c.id] === "correct").map(c => (
                <span key={c.id} className="house-dd-chip house-dd-chip--correct">{c.label}</span>
              ))}
            </div>
          ) : (
            <span className="house-dd-equip-hint">Drop here</span>
          )}
        </div>
      )}
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

      <img
        src={background}
        alt="Scene"
        className={[
          "house-background",
          bgRevealed ? "house-background--revealed" : "",
        ].filter(Boolean).join(" ")}
        draggable={false}
      />

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

      {/* Phase 2: Comprehension */}
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

      {/* Phase 3: Drag & Drop */}
      {phase === Phase.DRAG_DROP && (
        <div className="house-dd-scene" ref={containerRef}>

          {ddDropMode === "scene" && (
            <div
              className={[
                "house-dd-dropzone",
                dropHover   ? "house-dd-dropzone--hover"   : "",
                ddCompleted ? "house-dd-dropzone--complete" : "",
              ].filter(Boolean).join(" ")}
              style={{
                left: `${Math.min(Math.max(ddDropZonePos.x, 5), 85)}%`,
                top:  `${Math.min(Math.max(ddDropZonePos.y, 5), 72)}%`,
              }}
              onDragOver={handleDropZoneDragOver}
              onDragLeave={handleDropZoneDragLeave}
              onDrop={handleDropZoneDrop}
            >
              <span className="house-dd-dropzone-label">{ddDropZoneLabel}</span>
              <div className="house-dd-placed-chips">
                {ddWordCards.filter(c => ddPlaced[c.id] === "correct").map(c => (
                  <span key={c.id} className="house-dd-chip house-dd-chip--correct">{c.label}</span>
                ))}
              </div>
            </div>
          )}

          {ddWordCards.map(card => {
            const placed  = ddPlaced[card.id] === "correct";
            const shaking = ddShake === card.id;
            return (
              <div
                key={card.id}
                className={[
                  "house-dd-card",
                  placed                  ? "house-dd-card--placed"   : "",
                  shaking                 ? "house-dd-card--shake"    : "",
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
              </div>
            );
          })}
        </div>
      )}

      {/* Dev grid overlay */}
      {gridMode && (
        <div
          className="house-grid-overlay"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverCell({
              x: Math.round(((e.clientX - rect.left) / rect.width)  * 100),
              y: Math.round(((e.clientY - rect.top)  / rect.height) * 100),
            });
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

      {/* NPC */}
      <div className="house-npc-wrap">
        <img
          key={npcSprite}
          src={npcSprite}
          alt={npcName}
          className="house-npc-image"
          draggable={false}
        />
      </div>

      {/* DialogueBox */}
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

      {/* Done overlay */}
      {phase === Phase.DONE && (
        <div className="house-overlay">
          <div className="house-card">
            <div className="house-card-stars">⭐⭐⭐</div>
            <h2>Scenario Complete!</h2>
            <p>Padayon sa sunod! 🎯</p>
          </div>
        </div>
      )}

      {/* BookCollectModal */}
      <BookCollectModal
        isOpen={showPageModal}
        npcName={npcName}
        pageNumber={collectedPage?.pageNumber}
        totalPages={collectedPage?.totalCollected}
        environment="village"
        onClose={() => {
          setShowPageModal(false);
          setCollectedPage(null);
          if (playerId) {
            fetch(`${API}/api/challenge/quest/submit`, {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ playerId, questId, npcId, score: 1, maxScore: 1, passed: true }),
            }).catch(err => console.warn("[HousePage] submit failed:", err));
          }
          advanceSequence();
        }}
      />
    </div>
  );
};

export default HousePage;