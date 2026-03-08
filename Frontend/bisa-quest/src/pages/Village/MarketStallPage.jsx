// ─────────────────────────────────────────────────────────────────────────────
//  MarketStallPage.jsx  —  supports BOTH drag_drop AND item_association quests
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import BookCollectModal from "../../game/components/BookCollectModal";

import VicenteCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_1.png";
import NandoCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_3.png";
import LigayaCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import marketBackground from "../../assets/images/environments/scenario/market_stall.png";

import { ITEM_IMAGE_MAP } from "../../game/dragDropConstants";
import { getCustomerForRound } from "../../game/customerConstrants";
import {
  getPlayerId,
  saveNPCProgress,
  awardLibroPage,
  getLibroPageCount,
  getLibroPageCountForEnv,
} from "../../utils/playerStorage";
import "./MarketStallPage.css";

// ── NPC map ───────────────────────────────────────────────────────────────────
const NPC_IMAGES = {
  village_npc_1: VicenteCharacter,
  village_npc_3: NandoCharacter,
  village_npc_2: LigayaCharacter,
};



// ── Scene drop zone registry ──────────────────────────────────────────────────
const SCENE_DROP_ZONES = {
  market_stall: {
    stall_left: { x: 18, y: 48 },
    stall_center: { x: 50, y: 48 },
    stall_right: { x: 78, y: 48 },
    basket_saging_1: { x: 37, y: 74 },
    basket_saging_2: { x: 23, y: 74 },
    basket_manga_1: { x: 42, y: 50 },
    basket_manga_2: { x: 55, y: 50 },
    tray: { x: 62, y: 60 },
    counter: { x: 50, y: 55 },
  },
};

const resolveDropZones = (zoneKey, sceneZones) => {
  if (!zoneKey || !sceneZones) return [];
  return zoneKey.split(",")
    .map(k => k.trim())
    .filter(k => k && sceneZones[k])
    .map(k => ({ key: k, ...sceneZones[k] }));
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const isNarration = (s) => typeof s === "string" && s.toLowerCase() === "narration";
const isPlayer = (s) => typeof s === "string" && s.toLowerCase() === "player";
const resolveSpeaker = (speaker, fallback) => {
  if (!speaker) return fallback;
  if (isNarration(speaker)) return "Narration";
  if (isPlayer(speaker)) return "Player";
  return speaker;
};

// ── Phase enums ───────────────────────────────────────────────────────────────
const Phase = {
  STORY: "story",
  DONE: "done",
  COMPREHENSION: "comprehension",
  COMP_BRANCH: "comp_branch",
  DRAG_DROP: "drag_drop",
  FEEDBACK: "feedback",
  IA_ROUND_INTRO: "ia_round_intro",
  IA_ROUND_PICK: "ia_round_pick",
  IA_ROUND_BRANCH: "ia_round_branch",
  IA_FINAL: "ia_final",
};

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

// ── Comprehension image card (drag_drop only) ─────────────────────────────────
const CompCard = ({ item, onSelect, locked, result }) => {
  const img = item.imageKey && ITEM_IMAGE_MAP[item.imageKey]
    ? ITEM_IMAGE_MAP[item.imageKey] : null;
  const stateClass = result === "correct" ? "ms-comp-card--correct"
    : result === "wrong" ? "ms-comp-card--wrong" : "";
  return (
    <div
      className={`ms-comp-card ${img ? "ms-comp-card--has-img" : "ms-comp-card--text-only"} ${stateClass} ${locked ? "ms-comp-card--locked" : ""}`}
      onClick={() => !locked && onSelect(item)}
      role="button" tabIndex={locked ? -1 : 0}
      onKeyDown={e => e.key === "Enter" && !locked && onSelect(item)}
    >
      {img ? (
        <>
          <img src={img} alt={item.label} className="ms-comp-card-img" draggable={false} />
          <span className="ms-comp-card-label">{item.label}</span>
        </>
      ) : (
        <span className="ms-comp-card-text">{item.label}</span>
      )}
      {result === "correct" && <div className="ms-comp-card-badge ms-comp-card-badge--correct">✓</div>}
      {result === "wrong" && <div className="ms-comp-card-badge ms-comp-card-badge--wrong">✗</div>}
    </div>
  );
};

// ── IA fruit choice card (item_association only) ──────────────────────────────
const IACard = ({ item, onSelect, locked, result }) => {
  const img = item.imageKey && ITEM_IMAGE_MAP[item.imageKey]
    ? ITEM_IMAGE_MAP[item.imageKey] : null;
  const stateClass = result === "correct" ? "ms-comp-card--correct"
    : result === "wrong" ? "ms-comp-card--wrong" : "";
  return (
    <div
      className={`ms-comp-card ms-ia-card ${stateClass} ${locked ? "ms-comp-card--locked" : ""}`}
      onClick={() => !locked && onSelect(item)}
      role="button" tabIndex={locked ? -1 : 0}
      onKeyDown={e => e.key === "Enter" && !locked && onSelect(item)}
    >
      {img
        ? <img src={img} alt={item.label} className="ms-comp-card-img" draggable={false} />
        : <span style={{ fontSize: 48 }}>🍑</span>
      }
      <span className="ms-comp-card-label">{item.label}</span>
      {result === "correct" && <div className="ms-comp-card-badge ms-comp-card-badge--correct">✓</div>}
      {result === "wrong" && <div className="ms-comp-card-badge ms-comp-card-badge--wrong">✗</div>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────────
const MarketStallPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playerId = getPlayerId();
  const API = import.meta.env.VITE_API_URL || "";

  const questId = location.state?.questId || null;
  const npcId = location.state?.npcId || "village_npc_3";
  const npcName = location.state?.npcName || "Vicente";
  const returnTo = location.state?.returnTo || "/student/village";
  const questSequence = location.state?.questSequence || [];
  const seqIndex = location.state?.sequenceIndex ?? 0;

  const NpcImage = NPC_IMAGES[npcId] || VicenteCharacter;

  // ── Shared state ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [mechanic, setMechanic] = useState(null);
  const [flowGroups, setFlowGroups] = useState({});
  const [phase, setPhase] = useState(Phase.STORY);
  const [storyIdx, setStoryIdx] = useState(0);
  const [showPageModal, setShowPageModal] = useState(false);
  const [collectedPage, setCollectedPage] = useState(null);

  // ── drag_drop state ───────────────────────────────────────────────────────
  const [compItems, setCompItems] = useState([]);
  const [ddWordCards, setDdWordCards] = useState([]);
  const [ddInstruction, setDdInstruction] = useState("");
  const [branchKey, setBranchKey] = useState(null);
  const [branchIdx, setBranchIdx] = useState(0);
  const [feedbackKey, setFeedbackKey] = useState(null);
  const [feedbackIdx, setFeedbackIdx] = useState(0);
  const [compResult, setCompResult] = useState({});
  const [compLocked, setCompLocked] = useState(false);
  const [ddIntroItem, setDdIntroItem] = useState(null);
  const [ddPlaced, setDdPlaced] = useState({});
  const [ddShake, setDdShake] = useState(null);
  const [ddCompleted, setDdCompleted] = useState(false);
  const [draggingWord, setDraggingWord] = useState(null);
  const [dropHover, setDropHover] = useState(null);
  const [ddDropZones, setDdDropZones] = useState([]);
  const [ddDropMode, setDdDropMode] = useState("equip");
  const [ddDropZoneLabel, setDdDropZoneLabel] = useState("");
  const [gridMode, setGridMode] = useState(false);
  const [hoverCell, setHoverCell] = useState(null);

  // ── item_association state ────────────────────────────────────────────────
  const [iaRounds, setIaRounds] = useState([]);
  const [iaRound, setIaRound] = useState(0);
  const [iaResult, setIaResult] = useState({});
  const [iaLocked, setIaLocked] = useState(false);
  const [iaBranchKey, setIaBranchKey] = useState(null);
  const [iaBranchIdx, setIaBranchIdx] = useState(0);
  const [iaIntroIdx, setIaIntroIdx] = useState(0);

  const containerRef = useRef(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const currentRow = (() => {
    if (phase === Phase.STORY) return flowGroups.main?.[storyIdx] ?? null;
    if (phase === Phase.COMP_BRANCH) return flowGroups[branchKey]?.[branchIdx] ?? null;
    if (phase === Phase.FEEDBACK) return flowGroups[feedbackKey]?.[feedbackIdx] ?? null;
    if (phase === Phase.IA_ROUND_INTRO) return flowGroups[`r${iaRound + 1}_intro`]?.[iaIntroIdx] ?? null;
    if (phase === Phase.IA_ROUND_BRANCH) return flowGroups[iaBranchKey]?.[iaBranchIdx] ?? null;
    if (phase === Phase.IA_FINAL) return flowGroups["final"]?.[iaBranchIdx] ?? null;
    return null;
  })();

  const isLastStoryStep = flowGroups.main
    ? storyIdx === flowGroups.main.length - 1 : false;

  const showCustomer =
    mechanic === "item_association" &&
    phase !== Phase.STORY &&
    phase !== Phase.DONE;

  const dialogueSpeaker = currentRow ? resolveSpeaker(currentRow.speaker, npcName) : npcName;

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!questId) { setFetchError("No quest selected."); setLoading(false); return; }
    let cancelled = false;

    const load = async () => {
      try {
        // ── DEV MOCK: bypass API for mock quest IDs ──────────────────────────
        let meta, dialogues, rawItems;
        if (questId?.startsWith?.('mock_')) {
          const { getMockQuestData } = await import('../../game/mockData/villageQuestMocks.js');
          const mock = getMockQuestData(questId);
          if (!mock) throw new Error(`Mock quest "${questId}" not found.`);
          meta = mock.meta; dialogues = mock.dialogues; rawItems = mock.items;
        } else {
          const [metaRes, dialoguesRes, itemsRes] = await Promise.all([
            fetch(`${API}/api/challenge/quest/${questId}`),
            fetch(`${API}/api/challenge/quest/${questId}/dialogues`),
            fetch(`${API}/api/challenge/quest/${questId}/items?randomize=false`),
          ]);
          if (!metaRes.ok || !dialoguesRes.ok || !itemsRes.ok)
            throw new Error("Failed to load quest data.");
          ({ data: meta } = await metaRes.json());
          ({ data: dialogues } = await dialoguesRes.json());
          ({ data: rawItems } = await itemsRes.json());
        }
        if (cancelled) return;


        const qMechanic = meta?.game_mechanic || "drag_drop";
        setMechanic(qMechanic);
        setDdInstruction(meta?.instructions || "");
        if (!dialogues?.length) throw new Error("No dialogues found.");
        setFlowGroups(groupByFlow(dialogues));

        const sorted = [...(rawItems || [])].sort(
          (a, b) => Number(a.display_order ?? 99) - Number(b.display_order ?? 99)
        );

        if (qMechanic === "item_association") {
          const maxRound = Math.max(...sorted.map(r => Number(r.round_number) || 1));
          const rounds = Array.from({ length: maxRound }, (_, i) =>
            sorted
              .filter(r => Number(r.round_number) === i + 1)
              .map(r => ({
                id: String(r.item_id),
                label: r.label,
                imageKey: r.image_key || null,
                isCorrect: Boolean(r.is_correct),
                belongsTo: r.belongs_to || null,
                x: Number(r.position_x ?? 33),
                y: Number(r.position_y ?? 60),
              }))
          );
          setIaRounds(rounds);
          setIaRound(0);
        } else {
          setCompItems(sorted.filter(r => Number(r.round_number) === 0).map(r => ({
            id: String(r.item_id),
            label: r.label,
            imageKey: r.image_key || null,
            isCorrect: Boolean(r.is_correct),
            belongsTo: r.belongs_to || null,
            x: Number(r.position_x ?? 30),
            y: Number(r.position_y ?? 30),
          })));

          const ddRaw = sorted.filter(r => Number(r.round_number) === 1);
          const correctDDItem = ddRaw.find(r => Boolean(r.is_correct));
          setDdDropZoneLabel(correctDDItem?.label || "");
          setDdIntroItem(correctDDItem
            ? { id: String(correctDDItem.item_id), label: correctDDItem.label, imageKey: correctDDItem.image_key || null }
            : null
          );
          const scene = meta?.scene_type || "market_stall";
          const zoneKey = correctDDItem?.correct_zone || null;
          const sceneZones = SCENE_DROP_ZONES[scene] || SCENE_DROP_ZONES["market_stall"];
          const zones = resolveDropZones(zoneKey, sceneZones);
          setDdDropMode(zones.length > 0 ? "scene" : "equip");
          setDdDropZones(zones);
          setDdWordCards(ddRaw.map(r => ({
            id: String(r.item_id),
            label: r.label,
            imageKey: r.image_key || null,
            isCorrect: Boolean(r.is_correct),
            belongsTo: r.belongs_to || null,
            x: Number(r.position_x ?? 50),
            y: Number(r.position_y ?? 55),
          })));
          setDdPlaced({});
        }

        setLoading(false);
      } catch (err) {
        if (!cancelled) { setFetchError(err.message); setLoading(false); }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [questId, API]);

  // ── STORY navigation (shared) ─────────────────────────────────────────────
  const handleStoryNext = useCallback(() => {
    if (!isLastStoryStep) { setStoryIdx(i => i + 1); return; }
    if (mechanic === "item_association") {
      setPhase(Phase.IA_ROUND_INTRO);
      setIaIntroIdx(0);
    } else {
      compItems.length > 0 ? setPhase(Phase.COMPREHENSION) : setPhase(Phase.DRAG_DROP);
    }
  }, [isLastStoryStep, mechanic, compItems]);

  // ── drag_drop navigation ──────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (phase === Phase.STORY) { handleStoryNext(); return; }

    if (phase === Phase.COMP_BRANCH) {
      const rows = flowGroups[branchKey] || [];
      if (branchIdx < rows.length - 1) { setBranchIdx(i => i + 1); return; }
      if (branchKey === "correct_comp") {
        setCompLocked(false); setCompResult({}); setPhase(Phase.DRAG_DROP);
      } else {
        setCompLocked(false); setCompResult({});
        setBranchKey(null); setBranchIdx(0); setPhase(Phase.COMPREHENSION);
      }
      return;
    }

    if (phase === Phase.FEEDBACK) {
      const rows = flowGroups[feedbackKey] || [];
      if (feedbackIdx < rows.length - 1) { setFeedbackIdx(i => i + 1); return; }
      if (feedbackKey === "correct") {
        submitProgress();
      } else {
        setDdPlaced({}); setDdShake(null); setDdCompleted(false);
        setFeedbackKey(null); setFeedbackIdx(0); setPhase(Phase.DRAG_DROP);
      }
      return;
    }
  }, [phase, isLastStoryStep, branchKey, branchIdx, feedbackKey, feedbackIdx, flowGroups, compItems, mechanic]);

  // ── item_association navigation ───────────────────────────────────────────
  const handleIANext = useCallback(() => {
    if (phase === Phase.IA_ROUND_INTRO) {
      const introRows = flowGroups[`r${iaRound + 1}_intro`] || [];
      if (iaIntroIdx < introRows.length - 1) {
        setIaIntroIdx(i => i + 1);
      } else {
        setPhase(Phase.IA_ROUND_PICK);
        setIaResult({});
        setIaLocked(false);
      }
      return;
    }

    if (phase === Phase.IA_ROUND_BRANCH) {
      const rows = flowGroups[iaBranchKey] || [];
      if (iaBranchIdx < rows.length - 1) {
        setIaBranchIdx(i => i + 1);
        return;
      }
      if (iaBranchKey === `r${iaRound + 1}_correct`) {
        const nextRound = iaRound + 1;
        if (nextRound >= iaRounds.length) {
          setIaBranchIdx(0);
          setPhase(Phase.IA_FINAL);
        } else {
          setIaRound(nextRound);
          setIaIntroIdx(0);
          setIaBranchKey(null);
          setIaBranchIdx(0);
          setIaResult({});
          setIaLocked(false);
          setPhase(Phase.IA_ROUND_INTRO);
        }
      } else {
        setIaResult({});
        setIaLocked(false);
        setIaBranchKey(null);
        setIaBranchIdx(0);
        setPhase(Phase.IA_ROUND_PICK);
      }
      return;
    }

    if (phase === Phase.IA_FINAL) {
      const rows = flowGroups["final"] || [];
      if (iaBranchIdx < rows.length - 1) {
        setIaBranchIdx(i => i + 1);
      } else {
        submitProgress();
      }
      return;
    }
  }, [phase, iaRound, iaRounds, iaIntroIdx, iaBranchKey, iaBranchIdx, flowGroups]);

  // ── item_association: fruit pick ──────────────────────────────────────────
  const handleIAPick = useCallback((item) => {
    if (iaLocked) return;
    setIaLocked(true);

    if (item.isCorrect) {
      setIaResult({ [item.id]: "correct" });
      const key = `r${iaRound + 1}_correct`;
      if (flowGroups[key]) {
        setIaBranchKey(key);
        setIaBranchIdx(0);
        setPhase(Phase.IA_ROUND_BRANCH);
      } else {
        const nextRound = iaRound + 1;
        if (nextRound >= iaRounds.length) {
          setIaBranchIdx(0);
          setPhase(Phase.IA_FINAL);
        } else {
          setIaRound(nextRound);
          setIaIntroIdx(0);
          setIaResult({});
          setIaLocked(false);
          setPhase(Phase.IA_ROUND_INTRO);
        }
      }
    } else {
      setIaResult({ [item.id]: "wrong" });
      const wrongKey = (item.belongsTo && flowGroups[item.belongsTo])
        ? item.belongsTo
        : Object.keys(flowGroups).find(k =>
          k.startsWith(`r${iaRound + 1}_wrong`) && flowGroups[k]
        ) || null;

      if (wrongKey) {
        setIaBranchKey(wrongKey);
        setIaBranchIdx(0);
        setPhase(Phase.IA_ROUND_BRANCH);
      } else {
        setIaLocked(false);
        setIaResult({});
      }
    }
  }, [iaLocked, iaRound, iaRounds, flowGroups]);

  // ── drag_drop: Phase 2 ────────────────────────────────────────────────────
  const handleCompSelect = useCallback((item) => {
    if (compLocked) return;
    setCompLocked(true);
    if (item.isCorrect) {
      setCompResult({ [item.id]: "correct" });
      const target = flowGroups["correct_comp"] ? "correct_comp" : null;
      if (!target) { setPhase(Phase.DRAG_DROP); return; }
      setBranchKey("correct_comp"); setBranchIdx(0); setPhase(Phase.COMP_BRANCH);
    } else {
      setCompResult({ [item.id]: "wrong" });
      const wrongKeys = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));
      const target = (item.belongsTo && flowGroups[item.belongsTo])
        ? item.belongsTo
        : (() => {
          const words = item.label.toLowerCase().split(/[\s/,_-]+/);
          const match = wrongKeys.find(k => words.some(w => w.length > 2 && k.includes(w)));
          return (match && flowGroups[match]) ? match : wrongKeys[0] || null;
        })();
      if (!target) { setCompLocked(false); setCompResult({}); return; }
      setBranchKey(target); setBranchIdx(0); setPhase(Phase.COMP_BRANCH);
    }
  }, [compLocked, flowGroups]);

  // ── drag_drop: Phase 3 ────────────────────────────────────────────────────
  const handleWordDragStart = (card, e) => { if (ddPlaced[card.id] !== undefined) return; e.dataTransfer.setData("cardId", card.id); setDraggingWord(card.id); };
  const handleDropZoneDragOver = (e) => { e.preventDefault(); };
  const makeZoneDragEnter = (zk) => () => setDropHover(zk);
  const makeZoneDragLeave = (zk) => () => setDropHover(prev => prev === zk ? null : prev);

  const resolveWrongFeedbackKey = (card) => {
    const wrongKeys = Object.keys(flowGroups).filter(k => k.startsWith("wrong_"));
    return (card.belongsTo && flowGroups[card.belongsTo])
      ? card.belongsTo
      : (() => {
        const words = (card.label || "").toLowerCase().split(/[\s/,_-]+/);
        const match = wrongKeys.find(k => words.some(w => w.length > 2 && k.includes(w)));
        return (match && flowGroups[match]) ? match : wrongKeys[0] || null;
      })();
  };

  const makeZoneDrop = useCallback((zoneKey) => (e) => {
    e.preventDefault(); setDropHover(null);
    const cardId = e.dataTransfer.getData("cardId"); setDraggingWord(null);
    const card = ddWordCards.find(c => c.id === cardId); if (!card) return;
    if (card.isCorrect) {
      const np = { ...ddPlaced, [cardId]: zoneKey }; setDdPlaced(np);
      if (ddWordCards.filter(c => c.isCorrect).every(c => np[c.id] !== undefined)) setDdCompleted(true);
    } else {
      setDdShake(cardId); setTimeout(() => setDdShake(null), 600);
      const target = resolveWrongFeedbackKey(card);
      if (target) { setFeedbackKey(target); setFeedbackIdx(0); setPhase(Phase.FEEDBACK); }
    }
  }, [ddWordCards, ddPlaced, flowGroups]);

  const handleEquipDrop = useCallback((e) => {
    e.preventDefault(); setDropHover(null);
    const cardId = e.dataTransfer.getData("cardId"); setDraggingWord(null);
    const card = ddWordCards.find(c => c.id === cardId); if (!card) return;
    if (card.isCorrect) {
      const np = { ...ddPlaced, [cardId]: "correct" }; setDdPlaced(np);
      if (ddWordCards.filter(c => c.isCorrect).every(c => np[c.id] === "correct")) setDdCompleted(true);
    } else {
      setDdShake(cardId); setTimeout(() => setDdShake(null), 600);
      const target = resolveWrongFeedbackKey(card);
      if (target) { setFeedbackKey(target); setFeedbackIdx(0); setPhase(Phase.FEEDBACK); }
    }
  }, [ddWordCards, ddPlaced, flowGroups]);

  const handleDDComplete = () => {
    if (!ddCompleted) return;
    const target = flowGroups["correct"] ? "correct" : null;
    if (!target) { submitProgress(); return; }
    setFeedbackKey("correct"); setFeedbackIdx(0); setPhase(Phase.FEEDBACK);
  };

  // ── Submit + advance ──────────────────────────────────────────────────────
  const submitProgress = useCallback(() => {
    // Collect only the words from this specific quest's loaded items
    const words = mechanic === "item_association"
      ? [...new Set(iaRounds.flat().map(c => c.label))]
      : [...new Set(ddWordCards.map(c => c.label))];
    saveNPCProgress("village", npcId, 1, true, 3, words);

    const isNewPage = awardLibroPage("village", npcId);
    if (isNewPage) {
      setCollectedPage({
        pageNumber: getLibroPageCountForEnv("village"),
        totalCollected: getLibroPageCount(),
      });
      setShowPageModal(true);
      return;
    }
    if (playerId) {
      fetch(`${API}/api/challenge/quest/submit`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, questId, npcId, score: 1, maxScore: 1, passed: true }),
      }).catch(err => console.warn("[MarketStallPage] submit failed:", err));
    }
    advanceSequence();
  }, [npcId, playerId, questId, API, mechanic, ddWordCards, iaRounds]);

  const advanceSequence = useCallback(() => {
    const nextIndex = seqIndex + 1;
    const nextStep = questSequence[nextIndex];
    if (!nextStep) { navigate(returnTo, { state: { completed: true } }); return; }
    navigate("/student/market", {
      state: { questId: nextStep.questId, npcId, npcName, returnTo, questSequence, sequenceIndex: nextIndex, sceneType: nextStep.sceneType },
    });
  }, [seqIndex, questSequence, navigate, returnTo, npcId, npcName]);

  const handleBack = () => navigate(returnTo);

  // ── Dialogue text ─────────────────────────────────────────────────────────
  const dialogueText = (() => {
    if (loading) return "...";
    if (currentRow) return currentRow.dialogue_text || "";
    if (phase === Phase.COMPREHENSION)
      return flowGroups.main?.[flowGroups.main.length - 2]?.dialogue_text || "Pilia ang husto!";
    if (phase === Phase.IA_ROUND_PICK)
      return "Pilia ang sakto nga prutas para sa customer!";
    if (phase === Phase.DRAG_DROP)
      return ddCompleted ? "Tama! Now click Complete!" : (ddInstruction || "Drag the correct word card!");
    return "";
  })();

  const iaIntroItem = (() => {
    if (mechanic !== "item_association") return null;
    if (phase !== Phase.IA_ROUND_INTRO) return null;
    const correctItem = (iaRounds[iaRound] || []).find(i => i.isCorrect);
    if (!correctItem) return null;
    return { id: correctItem.id, label: correctItem.label, imageKey: correctItem.imageKey };
  })();

  const handleNextUnified = (() => {
    if (phase === Phase.IA_ROUND_INTRO ||
      phase === Phase.IA_ROUND_BRANCH ||
      phase === Phase.IA_FINAL) return handleIANext;
    return handleNext;
  })();

  const showNextBtn = !!(currentRow) &&
    phase !== Phase.COMPREHENSION &&
    phase !== Phase.DRAG_DROP &&
    phase !== Phase.IA_ROUND_PICK;

  const rightSlot = phase === Phase.DRAG_DROP ? (
    <div className="ms-dd-bar-slot-wrap">
      {ddDropMode === "equip" && (
        <div
          className={["ms-dd-equip-slot", dropHover === "equip" ? "ms-dd-equip-slot--hover" : "", ddCompleted ? "ms-dd-equip-slot--complete" : ""].filter(Boolean).join(" ")}
          onDragOver={(e) => { e.preventDefault(); setDropHover("equip"); }}
          onDragLeave={() => setDropHover(null)}
          onDrop={handleEquipDrop}
        >
          {ddWordCards.filter(c => ddPlaced[c.id] === "correct").length > 0
            ? <div className="ms-dd-equip-chips">{ddWordCards.filter(c => ddPlaced[c.id] === "correct").map(c => <span key={c.id} className="ms-dd-chip ms-dd-chip--correct">{c.label}</span>)}</div>
            : <span className="ms-dd-equip-hint">Drop here</span>
          }
        </div>
      )}
      <button className={`ms-complete-btn ${ddCompleted ? "ms-complete-btn--active" : "ms-complete-btn--disabled"}`} onClick={handleDDComplete} disabled={!ddCompleted}>Completo na!</button>
    </div>
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="ms-container">
      <img src={marketBackground} alt="" className="ms-background" draggable={false} />
      <div className="ms-loading"><span>Gi-load ang dula...</span></div>
    </div>
  );
  if (fetchError) return (
    <div className="ms-container">
      <img src={marketBackground} alt="" className="ms-background" draggable={false} />
      <div className="ms-loading">
        <p style={{ color: "#fff", fontFamily: "'Fredoka One', cursive", fontSize: 18 }}>{fetchError}</p>
        <Button variant="back" onClick={handleBack}>← Back</Button>
      </div>
    </div>
  );

  return (
    <div className="ms-container">
      <img src={marketBackground} alt="Market Stall" className="ms-background" draggable={false} />
      <Button variant="back" className="ms-back" onClick={handleBack}>← Back</Button>

      {mechanic === "drag_drop" && (
        <button className={`ms-grid-btn ${gridMode ? "ms-grid-btn--on" : ""}`} onClick={() => setGridMode(p => !p)}>
          {gridMode ? "📐 Grid ON" : "📐 Grid"}
        </button>
      )}

      <div className="ms-scene-label">
        {phase === Phase.STORY && "Story Introduction"}
        {phase === Phase.COMPREHENSION && "Comprehension Check"}
        {phase === Phase.COMP_BRANCH && "Comprehension Check"}
        {phase === Phase.DRAG_DROP && "Drag & Drop Activity"}
        {phase === Phase.FEEDBACK && "Feedback"}
        {phase === Phase.IA_ROUND_INTRO && `Customer ${iaRound + 1} of ${iaRounds.length}`}
        {phase === Phase.IA_ROUND_PICK && `Pick the Fruit — Round ${iaRound + 1}`}
        {phase === Phase.IA_ROUND_BRANCH && `Feedback — Round ${iaRound + 1}`}
        {phase === Phase.IA_FINAL && "All Done!"}
      </div>

      {/* drag_drop: Phase 2 Comprehension */}
      {phase === Phase.COMPREHENSION && (
        <div className="ms-comp-wrap">
          <div className="ms-comp-grid">
            {compItems.map(item => (
              <CompCard key={item.id} item={item} onSelect={handleCompSelect} locked={compLocked} result={compResult[item.id] || null} />
            ))}
          </div>
        </div>
      )}

      {/* drag_drop: Phase 3 Drag & Drop */}
      {phase === Phase.DRAG_DROP && (
        <div className="ms-dd-scene" ref={containerRef}>
          {ddDropMode === "scene" && ddDropZones.map(zone => (
            <div
              key={zone.key}
              className={["ms-dd-dropzone", dropHover === zone.key ? "ms-dd-dropzone--hover" : "", ddCompleted ? "ms-dd-dropzone--complete" : ""].filter(Boolean).join(" ")}
              style={{ left: `${Math.min(Math.max(zone.x, 5), 85)}%`, top: `${Math.min(Math.max(zone.y, 5), 72)}%` }}
              onDragOver={handleDropZoneDragOver}
              onDragEnter={makeZoneDragEnter(zone.key)}
              onDragLeave={makeZoneDragLeave(zone.key)}
              onDrop={makeZoneDrop(zone.key)}
            >
              <div className="ms-dd-placed-chips">
                {ddWordCards.filter(c => ddPlaced[c.id] === zone.key).map(c => <span key={c.id} className="ms-dd-chip ms-dd-chip--correct">{c.label}</span>)}
              </div>
            </div>
          ))}
          {ddWordCards.map(card => {
            const placed = ddPlaced[card.id] !== undefined;
            return (
              <div
                key={card.id}
                className={["ms-dd-card", placed ? "ms-dd-card--placed" : "", ddShake === card.id ? "ms-dd-card--shake" : "", draggingWord === card.id ? "ms-dd-card--dragging" : ""].filter(Boolean).join(" ")}
                style={{ left: `${Math.min(Math.max(card.x, 5), 88)}%`, top: `${Math.min(Math.max(card.y, 5), 72)}%`, transform: "translate(-50%, -50%)" }}
                draggable={!placed}
                onDragStart={(e) => handleWordDragStart(card, e)}
                onDragEnd={() => setDraggingWord(null)}
              >
                {card.imageKey && ITEM_IMAGE_MAP[card.imageKey]
                  ? <img src={ITEM_IMAGE_MAP[card.imageKey]} alt={card.label} className="ms-dd-card-img" draggable={false} />
                  : <span className="ms-dd-card-emoji">🖼️</span>
                }
                <span className="ms-dd-card-label">{card.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* item_association: fruit pick */}
      {phase === Phase.IA_ROUND_PICK && (
        <div className="ms-comp-wrap">
          <div className="ms-comp-grid">
            {(iaRounds[iaRound] || []).map(item => (
              <IACard key={item.id} item={item} onSelect={handleIAPick} locked={iaLocked} result={iaResult[item.id] || null} />
            ))}
          </div>
        </div>
      )}

      {/* Dev grid (drag_drop only) */}
      {gridMode && mechanic === "drag_drop" && (
        <div className="ms-grid-overlay" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHoverCell({ x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) }); }} onMouseLeave={() => setHoverCell(null)}>
          {Array.from({ length: 11 }, (_, i) => <div key={`v${i}`} className="ms-grid-line ms-grid-line--v" style={{ left: `${i * 10}%` }} />)}
          {Array.from({ length: 11 }, (_, i) => <div key={`h${i}`} className="ms-grid-line ms-grid-line--h" style={{ top: `${i * 10}%` }} />)}
          {Array.from({ length: 10 }, (_, i) => <span key={`xl${i}`} className="ms-grid-label ms-grid-label--x" style={{ left: `${i * 10 + 5}%`, top: 2 }}>{i * 10 + 5}</span>)}
          {Array.from({ length: 10 }, (_, i) => <span key={`yl${i}`} className="ms-grid-label ms-grid-label--y" style={{ top: `${i * 10 + 5}%`, left: 4 }}>{i * 10 + 5}</span>)}
          {hoverCell && (<><div className="ms-grid-crosshair ms-grid-crosshair--v" style={{ left: `${hoverCell.x}%` }} /><div className="ms-grid-crosshair ms-grid-crosshair--h" style={{ top: `${hoverCell.y}%` }} /><div className="ms-grid-coord" style={{ left: `${Math.min(hoverCell.x + 1, 72)}%`, top: `${Math.max(hoverCell.y - 6, 2)}%` }}>x: {hoverCell.x}, y: {hoverCell.y}</div></>)}
        </div>
      )}

      {/* NPC / Customer */}
      <div className="ms-npc-wrap">
        {showCustomer ? (
          <img key={`customer-${iaRound}`} src={getCustomerForRound(iaRound)} alt={`Customer ${iaRound + 1}`} className="ms-customer-image" draggable={false} />
        ) : (
          <img src={NpcImage} alt={npcName} className="ms-npc-image" draggable={false} />
        )}
      </div>

      <DialogueBox
        title={dialogueSpeaker}
        text={dialogueText}
        isNarration={isNarration(currentRow?.speaker)}
        isPlayer={isPlayer(currentRow?.speaker)}
        showNextButton={showNextBtn}
        onNext={handleNextUnified}
        rightSlot={rightSlot}
        introItem={
          (phase === Phase.STORY && ddIntroItem && Number(currentRow?.step_order) >= 3)
            ? ddIntroItem
            : iaIntroItem ?? null
        }
      />

      {phase === Phase.DONE && (
        <div className="ms-overlay"><div className="ms-card">
          <div className="ms-card-stars">⭐⭐⭐</div>
          <h2>Scenario Complete!</h2><p>Padayon sa sunod! 🎯</p>
        </div></div>
      )}

      <BookCollectModal
        isOpen={showPageModal} npcName={npcName}
        pageNumber={collectedPage?.pageNumber} totalPages={collectedPage?.totalCollected}
        environment="village"
        onClose={() => {
          setShowPageModal(false); setCollectedPage(null);
          if (playerId) {
            fetch(`${API}/api/challenge/quest/submit`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ playerId, questId, npcId, score: 1, maxScore: 1, passed: true }),
            }).catch(err => console.warn("[MarketStallPage] submit failed:", err));
          }
          advanceSequence();
        }}
      />
    </div>
  );
};

export default MarketStallPage;