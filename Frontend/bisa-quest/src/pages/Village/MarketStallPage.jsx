// ─────────────────────────────────────────────────────────────────────────────
//  MarketStallPage.jsx  —  Scenario-driven Village quest page (Market Stall)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button      from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";

import VicenteCharacter from "../../assets/images/characters/vocabulary/Village_Quest_NPC_1.png";
import NandoCharacter   from "../../assets/images/characters/vocabulary/Village_Quest_NPC_3.png";
import LigayaCharacter  from "../../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import marketBackground from "../../assets/images/environments/scenario/market_stall.png";

import { ITEM_IMAGE_MAP } from "../../game/dragDropConstants";
import { getPlayerId, saveNPCProgress } from "../../utils/playerStorage";
import "./MarketStallPage.css";

const NPC_IMAGES = {
  village_npc_1: VicenteCharacter,
  village_npc_3: NandoCharacter,
  village_npc_2: LigayaCharacter,
};

const SCENE_DROP_ZONES = {
  market_stall: {
    stall_left:     { x: 18, y: 48 },
    stall_center:   { x: 50, y: 48 },
    stall_right:    { x: 78, y: 48 },
    basket_saging_1:  { x: 23, y: 80 },
    basket_saging_2:  { x: 37, y: 80 },
    basket_manga_1: { x: 65, y: 95 },
    basket_manga_2: { x: 79, y: 95 },
    tray:           { x: 62, y: 60 },
    counter:        { x: 50, y: 55 },
  },
};

// Resolve correct_zone to 1 or more drop zone positions.
// correct_zone in DB can be a single key ("basket_manga_1") or
// comma-separated ("basket_manga_1,basket_manga_2") for multi-zone quests.
const resolveDropZones = (zoneKey, sceneZones) => {
  if (!zoneKey || !sceneZones) return [];
  return zoneKey.split(",")
    .map(k => k.trim())
    .filter(k => k && sceneZones[k])
    .map(k => ({ key: k, ...sceneZones[k] }));
};

const isNarration    = (s) => typeof s === "string" && s.toLowerCase() === "narration";
const isPlayer       = (s) => typeof s === "string" && s.toLowerCase() === "player";
const resolveSpeaker = (speaker, fallback) => {
  if (!speaker)             return fallback;
  if (isNarration(speaker)) return "Narration";
  if (isPlayer(speaker))    return "Player";
  return speaker;
};

const Phase = {
  STORY:         "story",
  COMPREHENSION: "comprehension",
  COMP_BRANCH:   "comp_branch",
  DRAG_DROP:     "drag_drop",
  FEEDBACK:      "feedback",
  DONE:          "done",
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

// ── Image Comprehension Card ──────────────────────────────────────────────────
const CompCard = ({ item, onSelect, locked, result }) => {
  const img = item.imageKey && ITEM_IMAGE_MAP[item.imageKey]
    ? ITEM_IMAGE_MAP[item.imageKey]
    : null;

  const stateClass = result === "correct" ? "ms-comp-card--correct"
                   : result === "wrong"   ? "ms-comp-card--wrong"
                   : "";

  return (
    <div
      className={`ms-comp-card ${stateClass} ${locked ? "ms-comp-card--locked" : ""}`}
      onClick={() => !locked && onSelect(item)}
      role="button"
      tabIndex={locked ? -1 : 0}
      onKeyDown={e => e.key === "Enter" && !locked && onSelect(item)}
    >
      {img
        ? <img src={img} alt={item.label} className="ms-comp-card-img" draggable={false} />
        : (
          <>
            <div className="ms-comp-card-placeholder">🖼️</div>
            <span className="ms-comp-card-label">{item.label}</span>
          </>
        )
      }
      {result === "correct" && <div className="ms-comp-card-badge ms-comp-card-badge--correct">✓</div>}
      {result === "wrong"   && <div className="ms-comp-card-badge ms-comp-card-badge--wrong">✗</div>}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const MarketStallPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playerId = getPlayerId();
  const API      = import.meta.env.VITE_API_URL || "";

  const questId       = location.state?.questId       || null;
  const npcId         = location.state?.npcId         || "village_npc_1";
  const npcName       = location.state?.npcName       || "Vicente";
  const returnTo      = location.state?.returnTo      || "/student/village";
  const questSequence = location.state?.questSequence || [];
  const seqIndex      = location.state?.sequenceIndex ?? 0;

  const NpcImage = NPC_IMAGES[npcId] || VicenteCharacter;

  const [loading,         setLoading]         = useState(true);
  const [fetchError,      setFetchError]       = useState(null);
  const [background,      setBackground]       = useState(marketBackground);
  const [flowGroups,      setFlowGroups]       = useState({});
  const [compItems,       setCompItems]        = useState([]);
  const [ddWordCards,     setDdWordCards]      = useState([]);
  const [ddDropZoneLabel, setDdDropZoneLabel]  = useState("");
  const [ddInstruction,   setDdInstruction]    = useState("");

  const [phase,       setPhase]       = useState(Phase.STORY);
  const [storyIdx,    setStoryIdx]    = useState(0);
  const [branchKey,   setBranchKey]   = useState(null);
  const [branchIdx,   setBranchIdx]   = useState(0);
  const [feedbackKey, setFeedbackKey] = useState(null);
  const [feedbackIdx, setFeedbackIdx] = useState(0);

  const [compResult,  setCompResult]  = useState({});
  const [compLocked,  setCompLocked]  = useState(false);

  const [ddIntroItem,   setDdIntroItem]   = useState(null);
  const [ddPlaced,      setDdPlaced]      = useState({});
  const [ddShake,       setDdShake]       = useState(null);
  const [ddCompleted,   setDdCompleted]   = useState(false);
  const [draggingWord,  setDraggingWord]  = useState(null);
  // dropHover is now a zone key (string) or null — tracks which zone is hovered
  const [dropHover,     setDropHover]     = useState(null);
  // ddDropZones: array of { key, x, y } — supports 1 or many zones
  const [ddDropZones,   setDdDropZones]   = useState([]);
  const [ddDropMode,    setDdDropMode]    = useState("equip");
  const [gridMode,      setGridMode]      = useState(false);
  const [hoverCell,     setHoverCell]     = useState(null);

  const containerRef = useRef(null);

  const currentRow = (() => {
    if (phase === Phase.STORY)       return flowGroups.main?.[storyIdx]            ?? null;
    if (phase === Phase.COMP_BRANCH) return flowGroups[branchKey]?.[branchIdx]     ?? null;
    if (phase === Phase.FEEDBACK)    return flowGroups[feedbackKey]?.[feedbackIdx]  ?? null;
    return null;
  })();

  const isLastStoryStep = flowGroups.main
    ? storyIdx === flowGroups.main.length - 1
    : false;

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!questId) { setFetchError("No quest selected."); setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      try {
        const [metaRes, dialoguesRes, itemsRes] = await Promise.all([
          fetch(`${API}/api/challenge/quest/${questId}`),
          fetch(`${API}/api/challenge/quest/${questId}/dialogues`),
          fetch(`${API}/api/challenge/quest/${questId}/items?randomize=false`),
        ]);
        if (!metaRes.ok || !dialoguesRes.ok || !itemsRes.ok)
          throw new Error("Failed to load quest data.");

        const { data: meta }      = await metaRes.json();
        const { data: dialogues } = await dialoguesRes.json();
        const { data: rawItems }  = await itemsRes.json();

        if (cancelled) return;

        setDdInstruction(meta?.instructions || "");
        if (!dialogues?.length) throw new Error("No dialogues found.");
        setFlowGroups(groupByFlow(dialogues));

        const sorted = [...(rawItems || [])].sort(
          (a, b) => Number(a.display_order ?? 99) - Number(b.display_order ?? 99)
        );

        // Phase 2 — comprehension (round_number = 0)
        setCompItems(sorted.filter(r => Number(r.round_number) === 0).map(r => ({
          id:        String(r.item_id),
          label:     r.label,
          imageKey:  r.image_key  || null,
          isCorrect: Boolean(r.is_correct),
          belongsTo: r.belongs_to || null,
          x:         Number(r.position_x ?? 30),
          y:         Number(r.position_y ?? 30),
        })));

        // Phase 3 — DD (round_number = 1)
        const ddRaw         = sorted.filter(r => Number(r.round_number) === 1);
        const correctDDItem = ddRaw.find(r => Boolean(r.is_correct));
        setDdDropZoneLabel(correctDDItem?.label || "");
        setDdIntroItem(correctDDItem
          ? { id: String(correctDDItem.item_id), label: correctDDItem.label, imageKey: correctDDItem.image_key || null }
          : null
        );

        // Resolve drop zones — supports comma-separated correct_zone values
        const scene      = meta?.scene_type || "market_stall";
        const zoneKey    = correctDDItem?.correct_zone || null;
        const sceneZones = SCENE_DROP_ZONES[scene] || SCENE_DROP_ZONES["market_stall"];
        const zones      = resolveDropZones(zoneKey, sceneZones);
        setDdDropMode(zones.length > 0 ? "scene" : "equip");
        setDdDropZones(zones);

        setDdWordCards(ddRaw.map(r => ({
          id:        String(r.item_id),
          label:     r.label,
          imageKey:  r.image_key  || null,
          isCorrect: Boolean(r.is_correct),
          belongsTo: r.belongs_to || null,
          x:         Number(r.position_x ?? 50),
          y:         Number(r.position_y ?? 55),
        })));

        setDdPlaced({});
        setLoading(false);
      } catch (err) {
        if (!cancelled) { setFetchError(err.message); setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [questId, API]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (phase === Phase.STORY) {
      if (!isLastStoryStep) { setStoryIdx(i => i + 1); }
      else { compItems.length > 0 ? setPhase(Phase.COMPREHENSION) : setPhase(Phase.DRAG_DROP); }
      return;
    }
    if (phase === Phase.COMP_BRANCH) {
      const rows = flowGroups[branchKey] || [];
      if (branchIdx < rows.length - 1) { setBranchIdx(i => i + 1); }
      else if (branchKey === "correct_comp") {
        setCompLocked(false);
        setCompResult({});
        setPhase(Phase.DRAG_DROP);
      } else {
        setCompLocked(false);
        setCompResult({});
        setBranchKey(null);
        setBranchIdx(0);
        setPhase(Phase.COMPREHENSION);
      }
      return;
    }
    if (phase === Phase.FEEDBACK) {
      const rows = flowGroups[feedbackKey] || [];
      if (feedbackIdx < rows.length - 1) { setFeedbackIdx(i => i + 1); }
      else if (feedbackKey === "correct") { submitProgress(); advanceSequence(); }
      else {
        setDdPlaced({});
        setDdShake(null);
        setDdCompleted(false);
        setFeedbackKey(null);
        setFeedbackIdx(0);
        setPhase(Phase.DRAG_DROP);
      }
      return;
    }
  }, [phase, isLastStoryStep, branchKey, branchIdx, feedbackKey, feedbackIdx, flowGroups, compItems]);

  // ── Phase 2: Comprehension image click ───────────────────────────────────
  const handleCompSelect = useCallback((item) => {
    if (compLocked) return;
    setCompLocked(true);

    if (item.isCorrect) {
      setCompResult({ [item.id]: "correct" });
      const target = flowGroups["correct_comp"] ? "correct_comp" : null;
      if (!target) { setPhase(Phase.DRAG_DROP); return; }
      setBranchKey("correct_comp");
      setBranchIdx(0);
      setPhase(Phase.COMP_BRANCH);
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
      setBranchKey(target);
      setBranchIdx(0);
      setPhase(Phase.COMP_BRANCH);
    }
  }, [compLocked, flowGroups]);

  // ── Phase 3: DD handlers ─────────────────────────────────────────────────
  const handleWordDragStart = (card, e) => {
    if (ddPlaced[card.id] === "correct") return;
    e.dataTransfer.setData("cardId", card.id);
    setDraggingWord(card.id);
  };

  // Each drop zone gets its own drag over/leave/drop — keyed by zone key
  const handleDropZoneDragOver  = (e) => { e.preventDefault(); };
  const makeZoneDragEnter = (zoneKey) => () => setDropHover(zoneKey);
  const makeZoneDragLeave = (zoneKey) => () => setDropHover(prev => prev === zoneKey ? null : prev);

  // makeZoneDrop — each zone passes its own key so ddPlaced records WHERE the card landed
  const makeZoneDrop = useCallback((zoneKey) => (e) => {
    e.preventDefault();
    setDropHover(null);
    const cardId = e.dataTransfer.getData("cardId");
    setDraggingWord(null);
    const card = ddWordCards.find(c => c.id === cardId);
    if (!card) return;

    if (card.isCorrect) {
      // Store the zone key so each zone only shows its own placed chips
      const newPlaced = { ...ddPlaced, [cardId]: zoneKey };
      setDdPlaced(newPlaced);
      const allPlaced = ddWordCards.filter(c => c.isCorrect).every(c => newPlaced[c.id] !== undefined);
      if (allPlaced) setDdCompleted(true);
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
      if (target) { setFeedbackKey(target); setFeedbackIdx(0); setPhase(Phase.FEEDBACK); }
    }
  }, [ddWordCards, ddPlaced, flowGroups]);

  // Equip-mode drop (in dialogue bar slot)
  const handleEquipDrop = useCallback((e) => {
    e.preventDefault();
    setDropHover(null);
    const cardId = e.dataTransfer.getData("cardId");
    setDraggingWord(null);
    const card = ddWordCards.find(c => c.id === cardId);
    if (!card) return;

    if (card.isCorrect) {
      const newPlaced = { ...ddPlaced, [cardId]: "correct" };
      setDdPlaced(newPlaced);
      const allPlaced = ddWordCards.filter(c => c.isCorrect).every(c => newPlaced[c.id] === "correct");
      if (allPlaced) setDdCompleted(true);
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
      if (target) { setFeedbackKey(target); setFeedbackIdx(0); setPhase(Phase.FEEDBACK); }
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

  const submitProgress = () => {
    saveNPCProgress("village", npcId, 1, true);
    if (playerId) {
      fetch(`${API}/api/challenge/quest/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, questId, npcId, score: 1, maxScore: 1, passed: true }),
      }).catch(err => console.warn("[MarketStallPage] submit failed:", err));
    }
  };

  const advanceSequence = useCallback(() => {
    const nextIndex = seqIndex + 1;
    const nextStep  = questSequence[nextIndex];
    if (!nextStep) { navigate(returnTo, { state: { completed: true } }); return; }
    navigate("/student/market", {
      state: { questId: nextStep.questId, npcId, npcName, returnTo, questSequence, sequenceIndex: nextIndex, sceneType: nextStep.sceneType },
    });
  }, [seqIndex, questSequence, navigate, returnTo, npcId, npcName]);

  const handleBack = () => navigate(returnTo);

  // ── Dialogue ──────────────────────────────────────────────────────────────
  const currentSpeaker  = currentRow?.speaker || null;
  const dialogueSpeaker = currentRow ? resolveSpeaker(currentSpeaker, npcName) : npcName;
  const dialogueText = (() => {
    if (loading)    return "...";
    if (currentRow) return currentRow.dialogue_text || "";
    if (phase === Phase.COMPREHENSION) {
      return flowGroups.main?.[flowGroups.main.length - 2]?.dialogue_text
          || "Pilia ang husto! Click the correct one!";
    }
    if (phase === Phase.DRAG_DROP) return ddCompleted
      ? "Tama! Now click Complete to confirm!"
      : (ddInstruction || "Drag the correct word card to the picture!");
    return "";
  })();

  const showNextBtn = !!(currentRow) && phase !== Phase.COMPREHENSION && phase !== Phase.DRAG_DROP;

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
      <button className={`ms-complete-btn ${ddCompleted ? "ms-complete-btn--active" : "ms-complete-btn--disabled"}`} onClick={handleDDComplete} disabled={!ddCompleted}>
        Completo na!
      </button>
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
        <p style={{ color: "#fff", fontFamily: "'Fredoka One\'", fontSize: 18 }}>{fetchError}</p>
        <Button variant="back" onClick={handleBack}>← Back</Button>
      </div>
    </div>
  );

  return (
    <div className="ms-container">
      <img src={background} alt="Market Stall" className="ms-background" draggable={false} />
      <Button variant="back" className="ms-back" onClick={handleBack}>← Back</Button>

      <button className={`ms-grid-btn ${gridMode ? "ms-grid-btn--on" : ""}`} onClick={() => setGridMode(p => !p)}>
        {gridMode ? "📐 Grid ON" : "📐 Grid"}
      </button>

      <div className="ms-scene-label">
        {phase === Phase.STORY         && "Story Introduction"}
        {phase === Phase.COMPREHENSION && "Comprehension Check"}
        {phase === Phase.COMP_BRANCH   && "Comprehension Check"}
        {phase === Phase.DRAG_DROP     && "Drag & Drop Activity"}
        {phase === Phase.FEEDBACK      && "Feedback"}
      </div>

      {/* ── Phase 2: Comprehension ────────────────────────────────── */}
      {phase === Phase.COMPREHENSION && (
        <div className="ms-comp-wrap">
          <div className="ms-comp-grid">
            {compItems.map(item => (
              <CompCard
                key={item.id}
                item={item}
                onSelect={handleCompSelect}
                locked={compLocked}
                result={compResult[item.id] || null}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Phase 3: Drag & Drop ────────────────────────────────────── */}
      {phase === Phase.DRAG_DROP && (
        <div className="ms-dd-scene" ref={containerRef}>

          {/* Drop zones — one or many, each from ddDropZones array */}
          {ddDropMode === "scene" && ddDropZones.map(zone => (
            <div
              key={zone.key}
              className={[
                "ms-dd-dropzone",
                dropHover === zone.key ? "ms-dd-dropzone--hover"    : "",
                ddCompleted            ? "ms-dd-dropzone--complete"  : "",
              ].filter(Boolean).join(" ")}
              style={{
                left: `${Math.min(Math.max(zone.x, 5), 85)}%`,
                top:  `${Math.min(Math.max(zone.y, 5), 72)}%`,
              }}
              onDragOver={handleDropZoneDragOver}
              onDragEnter={makeZoneDragEnter(zone.key)}
              onDragLeave={makeZoneDragLeave(zone.key)}
              onDrop={makeZoneDrop(zone.key)}
            >
              {/* Only show chips dropped INTO this specific zone */}
              <div className="ms-dd-placed-chips">
                {ddWordCards.filter(c => ddPlaced[c.id] === zone.key).map(c => (
                  <span key={c.id} className="ms-dd-chip ms-dd-chip--correct">{c.label}</span>
                ))}
              </div>
            </div>
          ))}

          {/* Word cards */}
          {ddWordCards.map(card => {
            const placed  = ddPlaced[card.id] === "correct";
            const shaking = ddShake === card.id;
            return (
              <div
                key={card.id}
                className={["ms-dd-card", placed ? "ms-dd-card--placed" : "", shaking ? "ms-dd-card--shake" : "", draggingWord === card.id ? "ms-dd-card--dragging" : ""].filter(Boolean).join(" ")}
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

      {/* ── Dev grid ─────────────────────────────────────────────────── */}
      {gridMode && (
        <div className="ms-grid-overlay"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverCell({ x: Math.round(((e.clientX - rect.left) / rect.width) * 100), y: Math.round(((e.clientY - rect.top) / rect.height) * 100) });
          }}
          onMouseLeave={() => setHoverCell(null)}
        >
          {Array.from({ length: 11 }, (_, i) => <div key={`v${i}`} className="ms-grid-line ms-grid-line--v" style={{ left: `${i * 10}%` }} />)}
          {Array.from({ length: 11 }, (_, i) => <div key={`h${i}`} className="ms-grid-line ms-grid-line--h" style={{ top:  `${i * 10}%` }} />)}
          {Array.from({ length: 10 }, (_, i) => <span key={`xl${i}`} className="ms-grid-label ms-grid-label--x" style={{ left: `${i * 10 + 5}%`, top: 2 }}>{i * 10 + 5}</span>)}
          {Array.from({ length: 10 }, (_, i) => <span key={`yl${i}`} className="ms-grid-label ms-grid-label--y" style={{ top: `${i * 10 + 5}%`, left: 4 }}>{i * 10 + 5}</span>)}
          {hoverCell && (
            <>
              <div className="ms-grid-crosshair ms-grid-crosshair--v" style={{ left: `${hoverCell.x}%` }} />
              <div className="ms-grid-crosshair ms-grid-crosshair--h" style={{ top:  `${hoverCell.y}%` }} />
              <div className="ms-grid-coord" style={{ left: `${Math.min(hoverCell.x + 1, 72)}%`, top: `${Math.max(hoverCell.y - 6, 2)}%` }}>
                x: {hoverCell.x}, y: {hoverCell.y}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── NPC ──────────────────────────────────────────────────────── */}
      <div className="ms-npc-wrap">
        <img src={NpcImage} alt={npcName} className="ms-npc-image" draggable={false} />
      </div>

      {/* ── DialogueBox ──────────────────────────────────────────────── */}
      <DialogueBox
        title={dialogueSpeaker}
        text={dialogueText}
        isNarration={isNarration(currentSpeaker)}
        isPlayer={isPlayer(currentSpeaker)}
        showNextButton={showNextBtn}
        onNext={handleNext}
        rightSlot={rightSlot}
        introItem={phase === Phase.STORY && ddIntroItem && Number(currentRow?.step_order) >= 3 ? ddIntroItem : null}
      />

      {phase === Phase.DONE && (
        <div className="ms-overlay">
          <div className="ms-card">
            <div className="ms-card-stars">⭐⭐⭐</div>
            <h2>Scenario Complete!</h2>
            <p>Padayon sa sunod! 🎯</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketStallPage;