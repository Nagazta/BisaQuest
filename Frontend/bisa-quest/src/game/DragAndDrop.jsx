// ─────────────────────────────────────────────────────────────────────────────
//  DragAndDrop.jsx  —  Step 1 of 2
//  On complete → navigates to ItemAssociation passing iaQuestId (the paired
//  item_association quest for the same theme).
//
//  The caller (VillagePage) must pass BOTH:
//    questId    — the drag_drop quest ID
//    iaQuestId  — the paired item_association quest ID
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button           from "../components/Button";
import DialogueBox      from "../components/instructions/DialogueBox";
import DraggableItem    from "./components/DraggableItem";
import DropZone         from "./components/DropZone";
import ZoneDebugOverlay from "./components/ZoneDebugOverlay";
import LigayaCharacter  from "../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";

import { getPlayerId, saveNPCProgress } from "../utils/playerStorage";
import {
  SCENE_BACKGROUNDS,
  SCENE_ZONES,
  ZONE_REGISTRY,
  DEFAULT_BACKGROUND,
  START_POSITIONS,
  FALLBACK_ITEMS,
} from "./dragDropConstants";
import { buildAllDropZones, getDialogueText, mapRawItems } from "./dragDropUtils";
import "./DragAndDrop.css";

// ─────────────────────────────────────────────────────────────────────────────

const DragAndDrop = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const questId   = location.state?.questId   || null;
  const iaQuestId = location.state?.iaQuestId || null;  // paired IA quest
  const npcId     = location.state?.npcId     || "village_npc_2";
  const npcName   = location.state?.npcName   || "Ligaya";
  const returnTo  = location.state?.returnTo  || "/student/village";
  const API       = import.meta.env.VITE_API_URL || "";

  // ── UI state ──────────────────────────────────────────────────────────────
  const [debugMode, setDebugMode] = useState(false);

  // ── Quest / game data ─────────────────────────────────────────────────────
  const [items,        setItems]        = useState([]);
  const [dropZones,    setDropZones]    = useState([]);
  const [background,   setBackground]   = useState(DEFAULT_BACKGROUND);
  const [instructions, setInstructions] = useState(null);
  const [sceneType,    setSceneType]    = useState("living_room");
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState(null);

  // ── Drag & placement state ────────────────────────────────────────────────
  const [placements, setPlacements] = useState({});
  const [dragging,   setDragging]   = useState(null);
  const [dragPos,    setDragPos]    = useState({ x: 0, y: 0 });
  const [activeZone, setActiveZone] = useState(null);
  const [feedback,   setFeedback]   = useState(null);
  const [shakeItem,  setShakeItem]  = useState(null);
  const [completed,  setCompleted]  = useState(false);

  const feedbackTimer = useRef(null);
  const containerRef  = useRef(null);

  const allCorrect     = items.length > 0 &&
    items.every(item => placements[item.id]?.correct === true);
  const correctZoneIds = [...new Set(items.map(i => i.zone))];

  // ── Load quest data ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!questId) {
      console.warn("[DragAndDrop] No questId — using fallback data.");
      setItems(FALLBACK_ITEMS);
      setDropZones(buildAllDropZones("living_room", SCENE_ZONES, ZONE_REGISTRY));
      setBackground(SCENE_BACKGROUNDS.living_room);
      setSceneType("living_room");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [questRes, itemsRes] = await Promise.all([
          fetch(`${API}/api/challenge/quest/${questId}`),
          fetch(`${API}/api/challenge/quest/${questId}/items`),
        ]);
        if (!questRes.ok) throw new Error(`Quest fetch failed: ${questRes.status}`);
        if (!itemsRes.ok) throw new Error(`Items fetch failed: ${itemsRes.status}`);

        const { data: questMeta } = await questRes.json();
        const { data: rawItems }  = await itemsRes.json();

        const scene = questMeta?.scene_type || "living_room";
        setSceneType(scene);
        setBackground(SCENE_BACKGROUNDS[scene] || DEFAULT_BACKGROUND);
        setInstructions(questMeta?.instructions || null);

        // DragAndDrop only uses correct items (is_correct = true)
        const correctOnly = rawItems.filter(r => r.is_correct !== false);
        setItems(mapRawItems(correctOnly, START_POSITIONS));
        setDropZones(buildAllDropZones(scene, SCENE_ZONES, ZONE_REGISTRY));
        setLoading(false);
      } catch (err) {
        console.error("[DragAndDrop] Load error:", err);
        setFetchError(err.message);
        setLoading(false);
      }
    };

    load();
  }, [questId, API]);

  useEffect(() => {
    if (!items.length) return;
    setPlacements(
      Object.fromEntries(items.map(item => [item.id, { placedZone: null, correct: null }]))
    );
  }, [items]);

  // ── Pointer handlers ──────────────────────────────────────────────────────
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
        triggerFeedback("correct", item.label);
      } else {
        setShakeItem(dragging);
        setTimeout(() => setShakeItem(null), 600);
        setPlacements(prev => ({ ...prev, [dragging]: { placedZone: null, correct: false } }));
        triggerFeedback("wrong", item?.label);
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

  const triggerFeedback = (type, label) => {
    clearTimeout(feedbackTimer.current);
    setFeedback({ type, label });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2000);
  };

  // ── Complete — navigate to paired ItemAssociation quest ───────────────────
  const handleComplete = () => {
    if (!allCorrect) return;
    setCompleted(true);
    setTimeout(() => {
      navigate("/student/item-association", {
        state: {
          questId:   iaQuestId,   // ← the IA quest, NOT the drag_drop quest
          npcId,
          npcName,
          returnTo,
          sceneType,
        },
      });
    }, 1800);
  };

  const handleBack = () => navigate(returnTo);

  // ── Loading / error screens ───────────────────────────────────────────────
  if (loading) return (
    <div className="dad-wrapper"><div className="dad-container">
      <img src={DEFAULT_BACKGROUND} alt="Loading" className="dad-bg" draggable={false} />
      <div className="dad-loading"><span>Loading game... / Gi-load ang dula...</span></div>
    </div></div>
  );

  if (fetchError) return (
    <div className="dad-wrapper"><div className="dad-container">
      <img src={DEFAULT_BACKGROUND} alt="Error" className="dad-bg" draggable={false} />
      <div className="dad-error">
        <p>Could not load the game. / Dili ma-load ang dula.</p>
        <Button variant="back" onClick={handleBack}>← Back</Button>
      </div>
    </div></div>
  );

  if (!loading && items.length === 0) return (
    <div className="dad-wrapper"><div className="dad-container">
      <img src={DEFAULT_BACKGROUND} alt="Empty" className="dad-bg" draggable={false} />
      <div className="dad-error">
        <p>No items found. / Walay items nga nakuha.</p>
        <Button variant="back" onClick={handleBack}>← Back</Button>
      </div>
    </div></div>
  );

  // ── Game render ───────────────────────────────────────────────────────────
  return (
    <div className="dad-wrapper">
      <div className="dad-container" ref={containerRef} style={{ userSelect: "none" }}>

        <img src={background} alt="Scene" className="dad-bg" draggable={false} />

        <Button variant="back" className="dad-back-btn" onClick={handleBack}>← Back</Button>

        {/* Step badge */}
        <div style={{
          position:"absolute", top:10, left:"50%", transform:"translateX(-50%)",
          background:"rgba(0,0,0,0.6)", color:"#fff", fontSize:"12px", fontWeight:"bold",
          padding:"4px 14px", borderRadius:20, border:"1px solid rgba(255,255,255,0.2)",
          zIndex:30, whiteSpace:"nowrap",
        }}>
          Step 1 of 2 — Drag &amp; Drop
        </div>

        {/* Debug toggle */}
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
            text={getDialogueText(feedback, allCorrect, instructions)}
            showNextButton={false}
          />
        </div>

        {completed && (
          <div className="dad-completion-overlay">
            <div className="dad-completion-card">
              <div className="dad-completion-stars">⭐⭐⭐</div>
              <h2>Great job! / Maayo kaayo!</h2>
              <p>Moving to next challenge... / Padayon sa sunod nga hamon...</p>
            </div>
          </div>
        )}

        <button
          className={`dad-complete-btn ${allCorrect ? "dad-complete-btn--active" : "dad-complete-btn--disabled"}`}
          onClick={handleComplete}
          disabled={!allCorrect}
        >
          ✓ Done! / Completo na!
        </button>

      </div>
    </div>
  );
};

export default DragAndDrop;