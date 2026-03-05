// ─────────────────────────────────────────────────────────────────────────────
//  HousePage.jsx
//  Village equivalent of ForestScenePage — handles the full sequence:
//    intro  →  drag_drop  →  item_association
//  Generic NPC support: works for Ligaya, Vicente, Nando, etc.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button        from "../../components/Button";
import DialogueBox   from "../../components/instructions/DialogueBox";
import DraggableItem from "../../game/components/DraggableItem";
import DropZone      from "../../game/components/DropZone";
import ClickableItem from "../../game/components/ClickableItem";
import ZoneDebugOverlay from "../../game/components/ZoneDebugOverlay";

// NPC images — add more here as Vicente / Nando are implemented
import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";

// Scene backgrounds
import houseBackground   from "../../assets/images/environments/scenario/house.jpg";
import kitchenBackground from "../../assets/images/environments/scenario/kitchen.jpg";
import bedroomBackground from "../../assets/images/environments/scenario/bedroom.jpg";

// Item Association scene props
import Trash1        from "../../assets/items/trash 1.png";
import FoodWrappers  from "../../assets/items/foodWrappers.png";
import FoodWrappers2 from "../../assets/items/foodWrappers2.png";
import BroomImage    from "../../assets/items/broom.png";
import SpilledWater  from "../../assets/items/spilledWater.png";
import Water         from "../../assets/items/water.png";

import {
  SCENE_BACKGROUNDS,
  SCENE_ZONES,
  ZONE_REGISTRY,
  SCENE_ZONE_OVERRIDES,
  DEFAULT_BACKGROUND,
  START_POSITIONS,
  FALLBACK_ITEMS,
  FALLBACK_ITEMS_KITCHEN,
  FALLBACK_ITEMS_BEDROOM,
} from "../../game/dragDropConstants";
import { buildAllDropZones, getDialogueText, mapRawItems } from "../../game/dragDropUtils";
import { getPlayerId, saveNPCProgress } from "../../utils/playerStorage";
import "./HousePage.css";

// ── Constants ─────────────────────────────────────────────────────────────────

const NPC_IMAGES = {
  village_npc_2: LigayaCharacter,
  // village_npc_3: VicenteCharacter,  ← add when ready
  // village_npc_4: NandoCharacter,    ← add when ready
};

const SCENE_BACKGROUNDS_LOCAL = {
  living_room: houseBackground,
  kitchen:     kitchenBackground,
  bedroom:     bedroomBackground,
};

const IA_SCENE_IMAGES = {
  living_room: {
    0: [Trash1, FoodWrappers, FoodWrappers2],
    1: [SpilledWater, Water],
    2: [],
  },
  kitchen: { 0: [], 1: [], 2: [] },
  bedroom: { 0: [], 1: [], 2: [] },
};

const SCENE_STEP_LABEL = {
  living_room: "Scene 1 of 3 — Living Room / Sala",
  kitchen:     "Scene 2 of 3 — Kitchen / Kusina",
  bedroom:     "Scene 3 of 3 — Bedroom / Kwarto",
};

const TOTAL_IA_ROUNDS = 3;

const FALLBACK_INTRO = [
  "Hi! I was supposed to clean the living room before my mom comes home. Can you help me?",
  "I'll show you the cleaning tools and you have to guess what each one is called in Cebuano!",
  "Did you understand the task? Are you ready to start?",
];

// ── Fallback IA rounds (per scene) ────────────────────────────────────────────

const buildFallbackIARounds = (scene) => {
  const living_room = [
    [
      { id:"lr1c",  label:"Broom / Walis",     isCorrect:true,
        roundPrompt:"Dirty ang salog! Unsa ang gamiton para mag-silhig?",
        roundReprompt:"Sulayi pag-usab! Unsa ang para sa pag-silhig?",
        hint:"Tama! Broom / Walis ang gamiton sa pag-silhig!",
        sceneImages:[Trash1, FoodWrappers, FoodWrappers2] },
      { id:"lr1w1", label:"Bucket / Timba",    isCorrect:false, hint:"Bucket / Timba holds water!" },
      { id:"lr1w2", label:"Pillow / Almohada", isCorrect:false, hint:"Pillow / Almohada is for sleeping!" },
      { id:"lr1w3", label:"Book / Libro",      isCorrect:false, hint:"Book / Libro is for reading!" },
    ],
    [
      { id:"lr2c",  label:"Wet Rag / Trapo",   isCorrect:true,
        roundPrompt:"Basa ang lamesa! Unsa ang gamiton para mag-punas?",
        roundReprompt:"Sayop! Unsa ang para sa pag-punas?",
        hint:"Tama! Wet Rag / Trapo ang gamiton sa pag-punas!",
        sceneImages:[SpilledWater, Water] },
      { id:"lr2w1", label:"Broom / Walis",     isCorrect:false, hint:"Broom / Walis sweeps dry floors!" },
      { id:"lr2w2", label:"Fork / Tinidor",    isCorrect:false, hint:"Fork / Tinidor is for eating!" },
      { id:"lr2w3", label:"Blanket / Habol",   isCorrect:false, hint:"Blanket / Habol keeps you warm!" },
    ],
    [
      { id:"lr3c",  label:"Brush / Sipilyo",   isCorrect:true,
        roundPrompt:"May sapot sa kisame! Unsa ang gamiton para tangtangon?",
        roundReprompt:"Dili na! Unsa ang para sa sapot sa kisame?",
        hint:"Husto! Brush / Sipilyo ang gamiton para sa sapot!" },
      { id:"lr3w1", label:"Mop / Mop",         isCorrect:false, hint:"Mop / Mop cleans the floor!" },
      { id:"lr3w2", label:"Pencil / Lapis",    isCorrect:false, hint:"Pencil / Lapis is for writing!" },
      { id:"lr3w3", label:"Spoon / Kutsara",   isCorrect:false, hint:"Spoon / Kutsara is for eating!" },
    ],
  ];

  const kitchen = [
    [
      { id:"k1c",  label:"Spatula / Espátula", isCorrect:true,
        roundPrompt:"Nagluto ta! Unsa ang gamiton para mag-flip sa pagkaon?",
        roundReprompt:"Sulayi pag-usab! Unsa ang para sa pag-flip?",
        hint:"Tama! Spatula ang gamiton sa pagluto!" },
      { id:"k1w1", label:"Broom / Walis",      isCorrect:false, hint:"Broom / Walis is for sweeping!" },
      { id:"k1w2", label:"Pillow / Almohada",  isCorrect:false, hint:"Pillow is for sleeping!" },
      { id:"k1w3", label:"Book / Libro",       isCorrect:false, hint:"Book is for reading!" },
    ],
    [
      { id:"k2c",  label:"Pot / Kaldero",      isCorrect:true,
        roundPrompt:"Mag-boil ta ug tubig! Unsa ang gamiton?",
        roundReprompt:"Sayop! Unsa ang para sa pag-boil?",
        hint:"Tama! Pot / Kaldero ang gamiton!" },
      { id:"k2w1", label:"Plate / Plato",      isCorrect:false, hint:"Plate is for serving food!" },
      { id:"k2w2", label:"Fork / Tinidor",     isCorrect:false, hint:"Fork is for eating!" },
      { id:"k2w3", label:"Cup / Tasa",         isCorrect:false, hint:"Cup is for drinking!" },
    ],
    [
      { id:"k3c",  label:"Knife / Kutsilyo",   isCorrect:true,
        roundPrompt:"Mag-chop ta ug gulay! Unsa ang gamiton?",
        roundReprompt:"Dili na! Unsa ang para sa pag-chop?",
        hint:"Husto! Knife / Kutsilyo ang gamiton!" },
      { id:"k3w1", label:"Spoon / Kutsara",    isCorrect:false, hint:"Spoon is for stirring or eating!" },
      { id:"k3w2", label:"Towel / Tualya",     isCorrect:false, hint:"Towel is for drying!" },
      { id:"k3w3", label:"Soap / Sabon",       isCorrect:false, hint:"Soap is for washing!" },
    ],
  ];

  const bedroom = [
    [
      { id:"b1c",  label:"Pillow / Almohada",  isCorrect:true,
        roundPrompt:"Oras na sa pagtulog! Unsa ang gibutang sa ulo?",
        roundReprompt:"Sulayi pag-usab! Unsa ang para sa ulo sa pagtulog?",
        hint:"Tama! Pillow / Almohada ang gamiton!" },
      { id:"b1w1", label:"Broom / Walis",      isCorrect:false, hint:"Broom is for sweeping!" },
      { id:"b1w2", label:"Pot / Kaldero",      isCorrect:false, hint:"Pot is for cooking!" },
      { id:"b1w3", label:"Book / Libro",       isCorrect:false, hint:"Book is for reading!" },
    ],
    [
      { id:"b2c",  label:"Blanket / Habol",    isCorrect:true,
        roundPrompt:"Bugnaw kaayo! Unsa ang gamiton para mag-init?",
        roundReprompt:"Sayop! Unsa ang para sa pag-init sa gabii?",
        hint:"Tama! Blanket / Habol ang gamiton!" },
      { id:"b2w1", label:"Towel / Tualya",     isCorrect:false, hint:"Towel is for drying!" },
      { id:"b2w2", label:"Fork / Tinidor",     isCorrect:false, hint:"Fork is for eating!" },
      { id:"b2w3", label:"Soap / Sabon",       isCorrect:false, hint:"Soap is for washing!" },
    ],
    [
      { id:"b3c",  label:"Alarm Clock / Relo", isCorrect:true,
        roundPrompt:"Kinahanglan maka-mata ug sayo! Unsa ang gamiton?",
        roundReprompt:"Dili na! Unsa ang para sa pag-mata ug sayo?",
        hint:"Husto! Alarm Clock / Relo ang gamiton!" },
      { id:"b3w1", label:"Pillow / Almohada",  isCorrect:false, hint:"Pillow is for sleeping!" },
      { id:"b3w2", label:"Broom / Walis",      isCorrect:false, hint:"Broom is for sweeping!" },
      { id:"b3w3", label:"Cup / Tasa",         isCorrect:false, hint:"Cup is for drinking!" },
    ],
  ];

  const rounds = scene === "kitchen" ? kitchen
               : scene === "bedroom" ? bedroom
               : living_room;

  return rounds.map(group => [...group].sort(() => Math.random() - 0.5));
};

const FALLBACK_IA_INTRO = {
  living_room: [
    "Karon, among hukman ang mga kagamitan sa paglimpyo! / Now let's identify the cleaning tools!",
    "Paminaw ug maayo ug i-click ang husto nga sagot! / Listen carefully and click the correct answer!",
  ],
  kitchen: [
    "Karon, among hukman ang mga kagamitan sa kusina! / Now let's identify the kitchen tools!",
    "Paminaw ug maayo ug i-click ang husto nga sagot! / Listen carefully and click the correct answer!",
  ],
  bedroom: [
    "Karon, among hukman ang mga kagamitan sa kwarto! / Now let's identify the bedroom items!",
    "Paminaw ug maayo ug i-click ang husto nga sagot! / Listen carefully and click the correct answer!",
  ],
};

// ── Phase enum ────────────────────────────────────────────────────────────────

const Phase = {
  INTRO:      "intro",
  DRAG_DROP:  "drag_drop",
  IA_INTRO:   "ia_intro",
  IA_SCENE:   "ia_scene",
  IA_CORRECT: "ia_correct",
  IA_WRONG:   "ia_wrong",
  DONE:       "done",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getIANPCText = (phase, introText, { roundPrompt, roundReprompt, itemHint }) => {
  switch (phase) {
    case Phase.IA_INTRO:   return introText || "...";
    case Phase.IA_SCENE:   return roundPrompt   || "Click the correct item!";
    case Phase.IA_CORRECT: return itemHint      || "Correct! / Husto! ✓";
    case Phase.IA_WRONG: {
      const base = roundReprompt || "Sayop! Try again!";
      return itemHint ? `${base}\n\n${itemHint}` : base;
    }
    default: return "...";
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

const HousePage = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const playerId   = getPlayerId();
  const API        = import.meta.env.VITE_API_URL || "";

  // ── Route state ────────────────────────────────────────────────────────────
  const questId        = location.state?.questId        || null;
  const kitchenQuestId = location.state?.kitchenQuestId || null;
  const bedroomQuestId = location.state?.bedroomQuestId || null;
  const iaQuestId      = location.state?.iaQuestId      || null;
  const iaKitchenQuestId = location.state?.iaKitchenQuestId || null;
  const iaBedroomQuestId = location.state?.iaBedroomQuestId || null;
  const npcId          = location.state?.npcId          || "village_npc_2";
  const npcName        = location.state?.npcName        || "Ligaya";
  const returnTo       = location.state?.returnTo       || "/student/village";
  const initialScene   = location.state?.sceneType      || "living_room";
  const questSequence  = location.state?.questSequence  || [];
  const initialSequenceIndex = location.state?.sequenceIndex ?? 0;
  const [sequenceIndex, setSequenceIndex] = useState(initialSequenceIndex);

  // ── Shared state ───────────────────────────────────────────────────────────
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [sceneType,  setSceneType]  = useState(initialScene);
  const [background, setBackground] = useState(
    SCENE_BACKGROUNDS_LOCAL[initialScene] || houseBackground
  );
  const [debugMode,  setDebugMode]  = useState(false);
  const [phase,      setPhase]      = useState(Phase.INTRO);

  // ── Intro state ────────────────────────────────────────────────────────────
  const [introSteps,    setIntroSteps]    = useState([]);
  const [introStep,     setIntroStep]     = useState(0);

  // ── Drag & Drop state ──────────────────────────────────────────────────────
  const [ddItems,      setDdItems]      = useState([]);
  const [dropZones,    setDropZones]    = useState([]);
  const [instructions, setInstructions] = useState(null);
  const [placements,   setPlacements]   = useState({});
  const [dragging,     setDragging]     = useState(null);
  const [dragPos,      setDragPos]      = useState({ x: 0, y: 0 });
  const [activeZone,   setActiveZone]   = useState(null);
  const [feedback,     setFeedback]     = useState(null);
  const [shakeItem,    setShakeItem]    = useState(null);
  const [ddCompleted,  setDdCompleted]  = useState(false);

  // ── Item Association state ─────────────────────────────────────────────────
  const [iaIntroSteps,   setIaIntroSteps]   = useState([]);
  const [iaIntroStep,    setIaIntroStep]     = useState(0);
  const [iaRounds,       setIaRounds]        = useState([[], [], []]);
  const [iaCurrentRound, setIaCurrentRound]  = useState(0);
  const [iaRoundKey,     setIaRoundKey]      = useState(0);
  const [iaItemHint,     setIaItemHint]      = useState(null);
  const [iaLockedId,     setIaLockedId]      = useState(null);
  const [iaSweeping,     setIaSweeping]      = useState(false);
  const [iaCompleted,    setIaCompleted]     = useState(false);

  const feedbackTimer = useRef(null);
  const iaPhaseTimer  = useRef(null);
  const containerRef  = useRef(null);

  const NpcImage      = NPC_IMAGES[npcId] || LigayaCharacter;
  const allDDCorrect  = ddItems.length > 0 && ddItems.every(i => placements[i.id]?.correct === true);
  const correctZoneIds = [...new Set(ddItems.map(i => i.zone))];

  const iaCurrentItems  = iaRounds[iaCurrentRound] || [];
  const iaCorrectItem   = iaCurrentItems.find(i => i?.isCorrect);
  const iaRoundPrompt   = iaCorrectItem?.roundPrompt   || null;
  const iaRoundReprompt = iaCorrectItem?.roundReprompt || null;
  const iaIntroText     = iaIntroSteps[iaIntroStep]    || "";
  const isLastIAIntro   = iaIntroSteps.length > 0 && iaIntroStep === iaIntroSteps.length - 1;
  const isLastIntro     = introSteps.length > 0 && introStep === introSteps.length - 1;

  // ── Resolve active quest ID per scene ─────────────────────────────────────
  const resolveActiveQuestId = useCallback((scene, type = "drag_drop") => {
    if (type === "item_association") {
      if (scene === "kitchen") return iaKitchenQuestId;
      if (scene === "bedroom") return iaBedroomQuestId;
      return iaQuestId;
    }
    if (scene === "kitchen") return kitchenQuestId;
    if (scene === "bedroom") return bedroomQuestId;
    return questId;
  }, [questId, kitchenQuestId, bedroomQuestId, iaQuestId, iaKitchenQuestId, iaBedroomQuestId]);

  // ── Load intro dialogues ───────────────────────────────────────────────────
  useEffect(() => {
    const activeQuestId = resolveActiveQuestId(initialScene, "drag_drop");

    if (!activeQuestId) {
      setIntroSteps(FALLBACK_INTRO);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`${API}/api/challenge/quest/${activeQuestId}/dialogues`);
        if (!res.ok) throw new Error(`Dialogue fetch failed: ${res.status}`);
        const { data } = await res.json();
        setIntroSteps(
          Array.isArray(data) && data.length
            ? data.map(r => r.dialogue_text)
            : FALLBACK_INTRO
        );
      } catch (err) {
        console.error("[HousePage] intro load error:", err);
        setIntroSteps(FALLBACK_INTRO);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [initialScene, API]);

  // ── Load Drag & Drop data ──────────────────────────────────────────────────
  const loadDragDrop = useCallback(async (scene) => {
    const activeQuestId = resolveActiveQuestId(scene, "drag_drop");
    setBackground(SCENE_BACKGROUNDS_LOCAL[scene] || houseBackground);
    setSceneType(scene);
    setDdItems([]);
    setPlacements({});
    setFeedback(null);
    setDragging(null);
    setActiveZone(null);
    setDdCompleted(false);

    if (!activeQuestId) {
      console.warn(`[HousePage] No DD questId for scene "${scene}" — using fallback items.`);
      const fallback = scene === "kitchen" ? FALLBACK_ITEMS_KITCHEN
                     : scene === "bedroom" ? FALLBACK_ITEMS_BEDROOM
                     : FALLBACK_ITEMS;
      setDdItems(fallback);
      setDropZones(buildAllDropZones(scene, SCENE_ZONES, { ...ZONE_REGISTRY, ...(SCENE_ZONE_OVERRIDES[scene] || {}) }));
      setInstructions(null);
      return;
    }

    try {
      const [questRes, itemsRes] = await Promise.all([
        fetch(`${API}/api/challenge/quest/${activeQuestId}`),
        fetch(`${API}/api/challenge/quest/${activeQuestId}/items`),
      ]);
      if (!questRes.ok) throw new Error(`Quest fetch failed: ${questRes.status}`);
      if (!itemsRes.ok) throw new Error(`Items fetch failed: ${itemsRes.status}`);

      const { data: questMeta } = await questRes.json();
      const { data: rawItems }  = await itemsRes.json();

      const sc = questMeta?.scene_type || scene;
      setSceneType(sc);
      setBackground(SCENE_BACKGROUNDS_LOCAL[sc] || houseBackground);
      setInstructions(questMeta?.instructions || null);

      const correctOnly = rawItems.filter(r => r.is_correct !== false);
      setDdItems(mapRawItems(correctOnly, START_POSITIONS));
      setDropZones(buildAllDropZones(sc, SCENE_ZONES, { ...ZONE_REGISTRY, ...(SCENE_ZONE_OVERRIDES[sc] || {}) }));
    } catch (err) {
      console.error("[HousePage] DD load error:", err);
      setFetchError(err.message);
    }
  }, [resolveActiveQuestId, API]);

  // ── Load Item Association data ─────────────────────────────────────────────
  const loadItemAssociation = useCallback(async (scene) => {
    setIaIntroStep(0);
    setIaCurrentRound(0);
    setIaRoundKey(k => k + 1);   // bump key so ClickableItem states reset
    setIaLockedId(null);
    setIaItemHint(null);
    setIaCompleted(false);
    setIaSweeping(false);

    // Always use fallback — randomized each call = fresh experience every time
    console.log(`[HousePage] IA scene "${scene}" — using randomized fallback.`);
    setIaIntroSteps(FALLBACK_IA_INTRO[scene] || FALLBACK_IA_INTRO.living_room);
    setIaRounds(buildFallbackIARounds(scene));
  }, []);

  // ── Drag & Drop pointer events ─────────────────────────────────────────────
  const handleDragStart = useCallback((itemId, e) => {
    if (placements[itemId]?.correct === true) return;
    e.preventDefault();
    setDragging(itemId);
    setDragPos({ x: e.clientX, y: e.clientY });
  }, [placements]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width)  * 100;
    const py = ((e.clientY - rect.top)  / rect.height) * 100;
    const hovered = dropZones.find(z =>
      px >= z.x && px <= z.x + z.w && py >= z.y && py <= z.y + z.h
    );
    setActiveZone(hovered?.id || null);
  }, [dragging, dropZones]);

  const handlePointerUp = useCallback((e) => {
    if (!dragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) { setDragging(null); return; }
    const px = ((e.clientX - rect.left) / rect.width)  * 100;
    const py = ((e.clientY - rect.top)  / rect.height) * 100;
    const targetZone = dropZones.find(z =>
      px >= z.x && px <= z.x + z.w && py >= z.y && py <= z.y + z.h
    );
    if (targetZone) {
      const item    = ddItems.find(i => i.id === dragging);
      const correct = item?.zone === targetZone.id;
      if (correct) {
        setPlacements(prev => ({ ...prev, [dragging]: { placedZone: targetZone.id, correct: true } }));
        triggerFeedback("correct", item.label, null);
      } else {
        setShakeItem(dragging);
        setTimeout(() => setShakeItem(null), 600);
        setPlacements(prev => ({ ...prev, [dragging]: { placedZone: null, correct: false } }));
        triggerFeedback("wrong", item?.label, item?.zone);
      }
    }
    setDragging(null);
    setActiveZone(null);
  }, [dragging, dropZones, ddItems]);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup",   handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup",   handlePointerUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  useEffect(() => {
    if (!ddItems.length) return;
    setPlacements(Object.fromEntries(ddItems.map(i => [i.id, { placedZone: null, correct: null }])));
  }, [ddItems]);

  const triggerFeedback = (type, label, correctZone = null) => {
    clearTimeout(feedbackTimer.current);
    setFeedback({ type, label, correctZone });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2000);
  };

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const advanceSequence = useCallback(() => {
    const nextIndex = sequenceIndex + 1;
    const nextStep  = questSequence[nextIndex];

    // Sequence done — go back to village
    if (!nextStep) {
      navigate(returnTo, { state: { completed: true } });
      return;
    }

    setSequenceIndex(nextIndex);
    const nextScene = nextStep.sceneType || initialScene;

    // Next step is item_association — load IA inline, no navigation
    if (nextStep.type === "item_association") {
      loadItemAssociation(nextScene).then(() => setPhase(Phase.IA_INTRO));
      return;
    }

    // Next step is drag_drop — load DD inline for the new scene
    if (nextStep.type === "drag_drop") {
      loadDragDrop(nextScene).then(() => setPhase(Phase.DRAG_DROP));
      return;
    }

    // Fallback
    navigate(returnTo, { state: { completed: true } });
  }, [sequenceIndex, questSequence, navigate, returnTo,
      loadItemAssociation, loadDragDrop, initialScene]);

  // ── Phase transition handlers ──────────────────────────────────────────────

  const handleIntroNext = () => {
    if (!isLastIntro) {
      setIntroStep(s => s + 1);
    } else {
      loadDragDrop(initialScene).then(() => setPhase(Phase.DRAG_DROP));
    }
  };

  const handleIntroNo = () => setIntroStep(0);

  const handleDDComplete = () => {
    if (!allDDCorrect) return;
    setDdCompleted(true);
    setTimeout(() => {
      setDdCompleted(false);
      advanceSequence();
    }, 1800);
  };

  const handleIAIntroNext = () => {
    if (!isLastIAIntro) setIaIntroStep(s => s + 1);
    else setPhase(Phase.IA_SCENE);
  };

  const handleIAItemClick = (item, isCorrect) => {
    if (phase === Phase.IA_CORRECT || phase === Phase.IA_SCENE && iaCompleted) return;
    clearTimeout(iaPhaseTimer.current);
    setIaItemHint(item.hint || null);

    if (isCorrect) {
      setIaLockedId(item.id);
      if (iaCurrentRound === 0) setIaSweeping(true);
      setPhase(Phase.IA_CORRECT);

      iaPhaseTimer.current = setTimeout(() => {
        setIaSweeping(false);
        const next = iaCurrentRound + 1;
        if (next >= TOTAL_IA_ROUNDS) {
          setIaCompleted(true);
          submitProgress();
          setTimeout(() => advanceSequence(), 2000);
        } else {
          setIaCurrentRound(next);
          setIaLockedId(null);
          setIaItemHint(null);
          setPhase(Phase.IA_SCENE);
          setIaRoundKey(k => k + 1);
        }
      }, 900);
    } else {
      setPhase(Phase.IA_WRONG);
      iaPhaseTimer.current = setTimeout(() => {
        setPhase(Phase.IA_SCENE);
        setIaItemHint(null);
      }, 3000);
    }
  };

  const submitProgress = () => {
    saveNPCProgress("village", npcId, TOTAL_IA_ROUNDS, true);
    if (playerId) {
      fetch(`${API}/api/challenge/quest/submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          playerId,
          questId: resolveActiveQuestId(sceneType, "item_association"),
          npcId,
          score: TOTAL_IA_ROUNDS,
          maxScore: TOTAL_IA_ROUNDS,
          passed: true,
        }),
      }).catch(err => console.warn("[HousePage] submit failed:", err));
    }
  };

  const handleBack = () => navigate(returnTo);

  // ── Dialogue text per phase ────────────────────────────────────────────────
  const dialogueText = (() => {
    if (phase === Phase.INTRO)
      return loading ? "..." : introSteps[introStep] || "(No dialogue available)";
    if (phase === Phase.DRAG_DROP)
      return getDialogueText(feedback, allDDCorrect, instructions, {
        ...ZONE_REGISTRY, ...(SCENE_ZONE_OVERRIDES[sceneType] || {}),
      });
    if (phase === Phase.IA_INTRO)
      return iaIntroText || "...";
    return getIANPCText(phase, iaIntroText, {
      roundPrompt: iaRoundPrompt,
      roundReprompt: iaRoundReprompt,
      itemHint: iaItemHint,
    });
  })();

  // ── rightSlot per phase ────────────────────────────────────────────────────
  const rightSlot = (() => {
    if (phase === Phase.INTRO && isLastIntro && !loading) return (
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="primary" onClick={handleIntroNext}>✓ Yes, I'm ready!</Button>
        <Button variant="danger"  onClick={handleIntroNo}>✗ Not yet</Button>
      </div>
    );
    if (phase === Phase.IA_INTRO && isLastIAIntro) return (
      <Button variant="primary" onClick={handleIAIntroNext}>✓ Let's start! / Sugod na!</Button>
    );
    if (phase === Phase.IA_INTRO && !isLastIAIntro) return (
      <button className="house-next-btn" onClick={handleIAIntroNext}>▶</button>
    );
    return null;
  })();

  const showNextBtn = (phase === Phase.INTRO && !isLastIntro && !loading);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (fetchError) return (
    <div className="house-container">
      <img src={background} alt="" className="house-background" draggable={false} />
      <div className="house-loading">
        <p>{fetchError}</p>
        <Button variant="back" onClick={handleBack}>← Back</Button>
      </div>
    </div>
  );

  return (
    <div className="house-container">
      <img src={background} alt="Scene" className="house-background" draggable={false} />

      <Button variant="back" className="house-back" onClick={handleBack}>← Back</Button>

      {(phase === Phase.DRAG_DROP || phase === Phase.IA_INTRO || phase === Phase.IA_SCENE ||
        phase === Phase.IA_CORRECT || phase === Phase.IA_WRONG) && (
        <div className="house-scene-label">
          {SCENE_STEP_LABEL[sceneType] || sceneType}
          {phase !== Phase.DRAG_DROP && " — Item Challenge"}
        </div>
      )}

      {phase === Phase.DRAG_DROP && (
        <button className="house-debug-btn" onClick={() => setDebugMode(p => !p)}>
          {debugMode ? "🐛 DEBUG ON" : "🐛 Debug"}
        </button>
      )}

      {/* ── Drag & Drop layer ───────────────────────────────────────────────── */}
      {phase === Phase.DRAG_DROP && (
        <div className="house-dd-layer" ref={containerRef}>
          {debugMode && <ZoneDebugOverlay activeZoneIds={correctZoneIds} containerRef={containerRef} />}

          {dropZones.map(zone => (
            <DropZone
              key={zone.id} zone={zone}
              isActive={activeZone === zone.id}
              hasCorrectItem={
                ddItems.filter(i => i.zone === zone.id).every(i => placements[i.id]?.correct === true) &&
                ddItems.some(i => i.zone === zone.id)
              }
            />
          ))}

          {ddItems.map(item => (
            <DraggableItem
              key={item.id} item={item}
              placement={placements[item.id] || { placedZone: null, correct: null }}
              isDragging={dragging === item.id}
              dragPos={dragPos}
              isShaking={shakeItem === item.id}
              onDragStart={handleDragStart}
            />
          ))}

          <button
            className={`house-complete-btn ${allDDCorrect ? "house-complete-btn--active" : "house-complete-btn--disabled"}`}
            onClick={handleDDComplete}
            disabled={!allDDCorrect}
          >
            Completo na!
          </button>

          {ddCompleted && (
            <div className="house-overlay">
              <div className="house-card">
                <div className="house-card-stars">⭐⭐⭐</div>
                <h2>Natapos na!</h2>
                <p>Sunod: Item Challenge!</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Item Association layer ──────────────────────────────────────────── */}
      {(phase === Phase.IA_SCENE || phase === Phase.IA_CORRECT || phase === Phase.IA_WRONG) && (
        <>
          <div className="house-ia-grid">
            {iaCurrentItems.filter(Boolean).map(item => (
              <ClickableItem
                key={`rk${iaRoundKey}-${item.id}`}
                item={item}
                onClick={handleIAItemClick}
                locked={iaLockedId === item.id}
                mode="grid"
              />
            ))}
          </div>

          {iaCorrectItem?.sceneImages?.filter(Boolean)?.map((img, index) => (
            <img
              key={index} src={img} alt="Scene element" draggable={false}
              className={`house-ia-scene house-ia-scene-${iaCurrentRound}-${index}`}
            />
          ))}

          {iaSweeping && iaCurrentRound === 0 && (
            <img src={BroomImage} alt="Broom" className="house-ia-broom" draggable={false} />
          )}

          {iaCompleted && (
            <div className="house-overlay">
              <div className="house-card">
                <div className="house-card-stars">⭐⭐⭐</div>
                <h2>Ayos kaayo! Challenge Complete!</h2>
                <p>Padayon sa sunod na round! 🎯</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── NPC — always floats above dialogue bar ──────────────────────────── */}
      <div className="house-npc-wrap">
        <img src={NpcImage} alt={npcName} className="house-npc-image" draggable={false} />
      </div>

      {/* ── Shared DialogueBox — bottom bar ─────────────────────────────────── */}
      <DialogueBox
        title={npcName}
        text={dialogueText}
        showNextButton={showNextBtn}
        onNext={handleIntroNext}
        rightSlot={rightSlot}
      />
    </div>
  );
};

export default HousePage;