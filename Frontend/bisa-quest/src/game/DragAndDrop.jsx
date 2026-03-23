import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Button from "../components/Button";
import DialogueBox from "../components/instructions/DialogueBox";
import DraggableItem from "./components/DraggableItem";
import DropZone from "./components/DropZone";
import ZoneDebugOverlay from "./components/ZoneDebugOverlay";

import {
  SCENE_BACKGROUNDS,
  SCENE_ZONES,
  ZONE_REGISTRY,
  SCENE_ZONE_OVERRIDES,
  DEFAULT_BACKGROUND,
  START_POSITIONS,
  FALLBACK_ITEMS,
} from "./dragDropConstants";
import { buildAllDropZones, getDialogueText, mapRawItems } from "./dragDropUtils";
import "./DragAndDrop.css";

const DragAndDrop = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const questId = location.state?.questId || null;
  const npcId = location.state?.npcId || "forest_npc_4";
  const npcName = location.state?.npcName || "Deer";
  const returnTo = location.state?.returnTo || "/student/forest";
  const sceneParam = location.state?.sceneType || "forest-scene";

  const API = import.meta.env.VITE_API_URL || "";

  const [debugMode, setDebugMode] = useState(false);
  const [items, setItems] = useState([]);
  const [dropZones, setDropZones] = useState([]);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [instructions, setInstructions] = useState(null);
  const [sceneType, setSceneType] = useState(sceneParam);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [placements, setPlacements] = useState({});
  const [dragging, setDragging] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [activeZone, setActiveZone] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [shakeItem, setShakeItem] = useState(null);
  const [completed, setCompleted] = useState(false);

  const feedbackTimer = useRef(null);
  const containerRef = useRef(null);

  const allCorrect = items.length > 0 && items.every(i => placements[i.id]?.correct === true);
  const correctZoneIds = [...new Set(items.map(i => i.zone))];

  // ── Load quest data ────────────────────────────────────────────────────────
  useEffect(() => {
    setItems([]);
    setPlacements({});
    setFeedback(null);
    setDragging(null);
    setActiveZone(null);
    setCompleted(false);
    setFetchError(null);
    setLoading(true);

    if (!questId) {
      setItems(FALLBACK_ITEMS);
      setDropZones(buildAllDropZones(sceneParam, SCENE_ZONES, { ...ZONE_REGISTRY, ...(SCENE_ZONE_OVERRIDES[sceneParam] || {}) }));
      setBackground(SCENE_BACKGROUNDS[sceneParam] || DEFAULT_BACKGROUND);
      setInstructions(null);
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
        const { data: rawItems } = await itemsRes.json();

        const scene = questMeta?.scene_type || sceneParam;
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
  }, [questId, sceneParam, API]);

  useEffect(() => {
    if (!items.length) return;
    setPlacements(Object.fromEntries(items.map(i => [i.id, { placedZone: null, correct: null }])));
  }, [items]);

  // ── Pointer events ─────────────────────────────────────────────────────────
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
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const hovered = dropZones.find(z =>
      px >= z.x && px <= z.x + z.w && py >= z.y && py <= z.y + z.h
    );
    setActiveZone(hovered?.id || null);
  }, [dragging, dropZones]);

  const handlePointerUp = useCallback((e) => {
    if (!dragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) { setDragging(null); return; }
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const targetZone = dropZones.find(z =>
      px >= z.x && px <= z.x + z.w && py >= z.y && py <= z.y + z.h
    );
    if (targetZone) {
      const item = items.find(i => i.id === dragging);
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
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  const triggerFeedback = (type, label, correctZone = null) => {
    clearTimeout(feedbackTimer.current);
    setFeedback({ type, label, correctZone });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2000);
  };

  // ── Complete — just navigate back; parent scene handles sequencing ─────────
  const handleComplete = () => {
    if (!allCorrect) return;
    setCompleted(true);
    setTimeout(() => navigate(returnTo, { state: { completed: true } }), 1800);
  };

  const handleBack = () => navigate(returnTo);

  // ── Loading / error states ─────────────────────────────────────────────────
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

  if (!items.length) return (
    <div className="dad-wrapper"><div className="dad-container">
      <img src={DEFAULT_BACKGROUND} alt="Empty" className="dad-bg" draggable={false} />
      <div className="dad-error">
        <p>Walay items nga nakuha.</p>
        <Button variant="back" onClick={handleBack}>← Back</Button>
      </div>
    </div></div>
  );

  return (
    <div className="dad-wrapper">
      <div className="dad-container" ref={containerRef} style={{ userSelect: "none" }}>

        <img src={background} alt="Scene" className="dad-bg" draggable={false} />

        <Button variant="back" className="dad-back-btn" onClick={handleBack}>← Back</Button>

        <button className="dad-debug-btn" onClick={() => setDebugMode(p => !p)}>
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

        {/* NPC */}
        <div className="dad-npc-wrap">
          <img src={null} alt={npcName} className="dad-npc-img" draggable={false} />
        </div>

        {/* Complete button */}
        <button
          className={`dad-complete-btn ${allCorrect ? "dad-complete-btn--active" : "dad-complete-btn--disabled"}`}
          onClick={handleComplete}
          disabled={!allCorrect}
        >
          Completo na!
        </button>

        {/* DialogueBox */}
        <DialogueBox
          title={npcName}
          text={getDialogueText(feedback, allCorrect, instructions, {
            ...ZONE_REGISTRY, ...(SCENE_ZONE_OVERRIDES[sceneType] || {}),
          })}
          showNextButton={false}
        />

        {/* Completion overlay */}
        {completed && (
          <div className="dad-completion-overlay">
            <div className="dad-completion-card">
              <div className="dad-completion-stars">⭐⭐⭐</div>
              <h2>Natapos na!</h2>
              <p>Padayon! 🎯</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DragAndDrop;