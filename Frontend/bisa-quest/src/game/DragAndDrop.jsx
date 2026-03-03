// ─────────────────────────────────────────────────────────────────────────────
//  DragAndDrop.jsx  —  sequence-driven: DD → IA → DD → IA → DD → IA
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button           from "../components/Button";
import DialogueBox      from "../components/instructions/DialogueBox";
import DraggableItem    from "./components/DraggableItem";
import DropZone         from "./components/DropZone";
import ZoneDebugOverlay from "./components/ZoneDebugOverlay";
import LigayaCharacter  from "../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";

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
} from "./dragDropConstants";
import { buildAllDropZones, getDialogueText, mapRawItems } from "./dragDropUtils";
import "./DragAndDrop.css";

const SCENE_STEP_LABEL = {
  living_room: "Scene 1 of 3 — Living Room / Sala",
  kitchen:     "Scene 2 of 3 — Kitchen / Kusina",
  bedroom:     "Scene 3 of 3 — Bedroom / Kwarto",
};

const COMPLETION_TEXT = {
  living_room: { title: "Natapos na ang sala!",   sub: "Sunod: Item Challenge! Kaya nimo!"   },
  kitchen:     { title: "Natapos na ang kusina!",  sub: "Sunod: Item Challenge! Padayon!"      },
  bedroom:     { title: "Natapos na ang kwarto!",  sub: "Sunod: Final Item Challenge!"          },
};

const DragAndDrop = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const questId        = location.state?.questId        || null;
  const kitchenQuestId = location.state?.kitchenQuestId || null;
  const bedroomQuestId = location.state?.bedroomQuestId || null;
  const iaQuestId      = location.state?.iaQuestId      || null;
  const npcId          = location.state?.npcId          || "village_npc_2";
  const npcName        = location.state?.npcName        || "Ligaya";
  const returnTo       = location.state?.returnTo       || "/student/village";
  const currentScene   = location.state?.sceneType      || "living_room";
  const questSequence  = location.state?.questSequence  || [];
  const sequenceIndex  = location.state?.sequenceIndex  ?? 0;

  const API = import.meta.env.VITE_API_URL || "";

  const [debugMode,    setDebugMode]    = useState(false);
  const [items,        setItems]        = useState([]);
  const [dropZones,    setDropZones]    = useState([]);
  const [background,   setBackground]   = useState(DEFAULT_BACKGROUND);
  const [instructions, setInstructions] = useState(null);
  const [sceneType,    setSceneType]    = useState(currentScene);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState(null);
  const [placements,   setPlacements]   = useState({});
  const [dragging,     setDragging]     = useState(null);
  const [dragPos,      setDragPos]      = useState({ x: 0, y: 0 });
  const [activeZone,   setActiveZone]   = useState(null);
  const [feedback,     setFeedback]     = useState(null);
  const [shakeItem,    setShakeItem]    = useState(null);
  const [completed,    setCompleted]    = useState(false);

  const feedbackTimer = useRef(null);
  const containerRef  = useRef(null);

  const allCorrect     = items.length > 0 && items.every(i => placements[i.id]?.correct === true);
  const correctZoneIds = [...new Set(items.map(i => i.zone))];

  useEffect(() => {
    setItems([]);
    setPlacements({});
    setFeedback(null);
    setDragging(null);
    setActiveZone(null);
    setCompleted(false);
    setFetchError(null);
    setLoading(true);
    setSceneType(currentScene);

    const activeQuestId =
      currentScene === "kitchen" ? kitchenQuestId :
      currentScene === "bedroom" ? bedroomQuestId :
      questId;

    if (!activeQuestId) {
      console.warn(`[DragAndDrop] No questId for scene "${currentScene}" — using fallback.`);
      const fallbackItems = currentScene === "kitchen" ? FALLBACK_ITEMS_KITCHEN
                          : currentScene === "bedroom" ? FALLBACK_ITEMS_BEDROOM
                          : FALLBACK_ITEMS;
      setItems(fallbackItems);
      setDropZones(buildAllDropZones(currentScene, SCENE_ZONES, { ...ZONE_REGISTRY, ...(SCENE_ZONE_OVERRIDES[currentScene] || {}) }));
      setBackground(SCENE_BACKGROUNDS[currentScene] || DEFAULT_BACKGROUND);
      setInstructions(null);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [questRes, itemsRes] = await Promise.all([
          fetch(`${API}/api/challenge/quest/${activeQuestId}`),
          fetch(`${API}/api/challenge/quest/${activeQuestId}/items`),
        ]);
        if (!questRes.ok) throw new Error(`Quest fetch failed: ${questRes.status}`);
        if (!itemsRes.ok) throw new Error(`Items fetch failed: ${itemsRes.status}`);

        const { data: questMeta } = await questRes.json();
        const { data: rawItems }  = await itemsRes.json();

        const scene = questMeta?.scene_type || currentScene;
        setSceneType(scene);
        setBackground(SCENE_BACKGROUNDS[scene] || DEFAULT_BACKGROUND);
        setInstructions(questMeta?.instructions || null);

        const correctOnly = rawItems.filter(r => r.is_correct !== false);
        setItems(mapRawItems(correctOnly, START_POSITIONS));
        setDropZones(buildAllDropZones(scene, SCENE_ZONES, { ...ZONE_REGISTRY, ...(SCENE_ZONE_OVERRIDES[scene] || {}) }));
        setLoading(false);
      } catch (err) {
        console.error("[DragAndDrop] Load error:", err);
        setFetchError(err.message);
        setLoading(false);
      }
    };

    load();
  }, [currentScene, questId, kitchenQuestId, bedroomQuestId, API]);

  useEffect(() => {
    if (!items.length) return;
    setPlacements(
      Object.fromEntries(items.map(item => [item.id, { placedZone: null, correct: null }]))
    );
  }, [items]);

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
      const item    = items.find(i => i.id === dragging);
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
  }, [dragging, dropZones, items]);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup",   handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup",   handlePointerUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  const triggerFeedback = (type, label, correctZone = null) => {
    clearTimeout(feedbackTimer.current);
    setFeedback({ type, label, correctZone });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2000);
  };

  const handleComplete = () => {
    if (!allCorrect) return;
    setCompleted(true);

    const sharedState = {
      questId,
      kitchenQuestId,
      bedroomQuestId,
      iaQuestId,
      npcId,
      npcName,
      returnTo,
      questSequence,
    };

    setTimeout(() => {
      const nextIndex = sequenceIndex + 1;
      const nextStep  = questSequence[nextIndex];

      if (!nextStep) {
        navigate(returnTo, { state: { completed: true } });
        return;
      }

      if (nextStep.type === "item_association") {
        navigate("/student/item-association", {
          state: {
            ...sharedState,
            questId:       nextStep.questId,
            sceneType,
            sequenceIndex: nextIndex,
          },
        });
        return;
      }

      if (nextStep.type === "drag_drop") {
        navigate("/student/house", {
          state: {
            ...sharedState,
            questId:       nextStep.questId,
            sceneType:     nextStep.sceneType,
            sequenceIndex: nextIndex,
          },
        });
      }
    }, 1800);
  };

  const handleBack = () => navigate(returnTo);

  if (loading) return (
    <div className="dad-wrapper"><div className="dad-container">
      <img src={DEFAULT_BACKGROUND} alt="Loading" className="dad-bg" draggable={false} />
      <div className="dad-loading"><span>Gi-load ang dula...</span></div>
    </div></div>
  );

  if (fetchError) return (
    <div className="dad-wrapper"><div className="dad-container">
      <img src={DEFAULT_BACKGROUND} alt="Error" className="dad-bg" draggable={false} />
      <div className="dad-error">
        <p>Dili ma-load ang dula.</p>
        <Button variant="back" onClick={handleBack}>← Back</Button>
      </div>
    </div></div>
  );

  if (!loading && items.length === 0) return (
    <div className="dad-wrapper"><div className="dad-container">
      <img src={DEFAULT_BACKGROUND} alt="Empty" className="dad-bg" draggable={false} />
      <div className="dad-error">
        <p>Walay items nga nakuha.</p>
        <Button variant="back" onClick={handleBack}>← Back</Button>
      </div>
    </div></div>
  );

  const completionText = COMPLETION_TEXT[sceneType] || { title: "Natapos na!", sub: "Padayon! 🎯" };

  return (
    <div className="dad-wrapper">
      <div className="dad-container" ref={containerRef} style={{ userSelect: "none" }}>

        <img src={background} alt="Scene" className="dad-bg" draggable={false} />

        <Button variant="back" className="dad-back-btn" onClick={handleBack}>← Back</Button>

        <div style={{
          position:"absolute", top:10, left:"50%", transform:"translateX(-50%)",
          background:"rgba(0,0,0,0.6)", color:"#fff", fontSize:"12px", fontWeight:"bold",
          padding:"4px 14px", borderRadius:20, border:"1px solid rgba(255,255,255,0.2)",
          zIndex:30, whiteSpace:"nowrap",
        }}>
          {SCENE_STEP_LABEL[sceneType] || "Drag & Drop"}
        </div>

        <button onClick={() => setDebugMode(p => !p)} style={{
          position:"absolute", top:8, right:8, zIndex:200,
          background: debugMode ? "#ff9900" : "rgba(0,0,0,0.55)",
          color:"#fff", border:"1px solid rgba(255,255,255,0.3)",
          borderRadius:5, padding:"4px 10px", fontSize:"11px", fontWeight:"bold", cursor:"pointer",
        }}>
          {debugMode ? "🐛 DEBUG ON" : "🐛 Debug"}
        </button>

        {debugMode && <ZoneDebugOverlay activeZoneIds={correctZoneIds} containerRef={containerRef} />}

        {dropZones.map(zone => (
          <DropZone
            key={zone.id} zone={zone}
            isActive={activeZone === zone.id}
            hasCorrectItem={
              items.filter(i => i.zone === zone.id).every(i => placements[i.id]?.correct === true) &&
              items.some(i => i.zone === zone.id)
            }
          />
        ))}

        {items.map(item => (
          <DraggableItem
            key={item.id} item={item}
            placement={placements[item.id] || { placedZone: null, correct: null }}
            isDragging={dragging === item.id}
            dragPos={dragPos}
            isShaking={shakeItem === item.id}
            onDragStart={handleDragStart}
          />
        ))}

        <div className="dad-npc-section">
          <img src={LigayaCharacter} alt={npcName} className="dad-npc-img" draggable={false} />
          <DialogueBox
            title={npcName}
            text={getDialogueText(feedback, allCorrect, instructions, { ...ZONE_REGISTRY, ...(SCENE_ZONE_OVERRIDES[sceneType] || {}) })}
            showNextButton={false}
          />
        </div>

        {completed && (
          <div className="dad-completion-overlay">
            <div className="dad-completion-card">
              <div className="dad-completion-stars">⭐⭐⭐</div>
              <h2>{completionText.title}</h2>
              <p>{completionText.sub}</p>
            </div>
          </div>
        )}

        <button
          className={`dad-complete-btn ${allCorrect ? "dad-complete-btn--active" : "dad-complete-btn--disabled"}`}
          onClick={handleComplete}
          disabled={!allCorrect}
        >
          Completo na!
        </button>

      </div>
    </div>
  );
};

export default DragAndDrop;