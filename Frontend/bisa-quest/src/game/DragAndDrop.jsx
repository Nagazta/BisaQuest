import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import DialogueBox from "../components/instructions/DialogueBox";
import DraggableItem from "./components/DraggableItem";
import DropZone from "./components/DropZone";
import houseBackground from "../assets/images/environments/scenario/house.jpg";
import LigayaCharacter from "../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import { getPlayerId, saveNPCProgress } from "../utils/playerStorage";
import "./DragAndDrop.css";

// ── Zone registry — add new zones here as you create new backgrounds ──────────
// x/y/w/h = percentages of the game container
const ZONE_REGISTRY = {
  sofa:            { label: "Sofa",            x: 46, y: 38, w: 24, h: 26 },
  bookshelf:       { label: "Bookshelf",       x: 67, y: 1,  w: 33, h: 55 },
  kitchen_counter: { label: "Kitchen Counter", x: 55, y: 30, w: 30, h: 30 },
  cabinet:         { label: "Cabinet",         x: 67, y: 1,  w: 33, h: 29 },
  desk:            { label: "Desk",            x: 50, y: 35, w: 30, h: 25 },
  bag:             { label: "Bag",             x: 20, y: 55, w: 20, h: 30 },
};

// Auto starting positions by display_order index (0-based)
const START_POSITIONS = [
  { x: 48, y: 42 },
  { x: 82, y: 76 },
  { x: 53, y: 68 },
  { x: 62, y: 68 },
  { x: 20, y: 60 },
  { x: 35, y: 75 },
];

const getDialogueText = (feedback, allCorrect, instructions) => {
  if (allCorrect)                   return "Maayo kaayo! Nahuman na nimo ang tanan! 🎉";
  if (feedback?.type === "correct") return `Husto! "${feedback.label}" — Tama ang lugar! ✓`;
  if (feedback?.type === "wrong")   return "Sayop! Sulayi pag-usab! ✗";
  return instructions || "I-drag ang bawat bagay sa tamang lugar!";
};

// ─────────────────────────────────────────────────────────────────────────────

const DragAndDrop = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const questId   = location.state?.questId  || null;
  const npcId     = location.state?.npcId    || "village_npc_2";
  const npcName   = location.state?.npcName  || "Ligaya";
  const returnTo  = location.state?.returnTo || "/student/village";
  const playerId  = getPlayerId();
  const API       = import.meta.env.VITE_API_URL || "";

  // ── Fetched data ──────────────────────────────────────────────────────────
  const [items,        setItems]        = useState([]);
  const [dropZones,    setDropZones]    = useState([]);
  const [instructions, setInstructions] = useState("I-drag ang bawat bagay sa tamang lugar!");
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState(null);

  useEffect(() => {
    if (!questId) {
      // Dev fallback — no questId passed from HousePage
      console.warn("[DragAndDrop] No questId in location.state — using fallback data.");
      setItems([
        { id: "item_cushion", label: "Unan",     zone: "sofa",      startX: 48, startY: 42 },
        { id: "item_pillow",  label: "Almohada", zone: "sofa",      startX: 82, startY: 76 },
        { id: "item_book1",   label: "Libro",    zone: "bookshelf", startX: 53, startY: 68 },
        { id: "item_book2",   label: "Basahon",  zone: "bookshelf", startX: 62, startY: 68 },
      ]);
      setDropZones([
        { id: "sofa",      ...ZONE_REGISTRY.sofa },
        { id: "bookshelf", ...ZONE_REGISTRY.bookshelf },
      ]);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [itemsRes, questRes] = await Promise.all([
          fetch(`${API}/api/challenge/quest/${questId}/items`),
          fetch(`${API}/api/challenge/quest/${questId}`),
        ]);

        if (!itemsRes.ok) throw new Error(`Items fetch failed: ${itemsRes.status}`);
        if (!questRes.ok) throw new Error(`Quest fetch failed: ${questRes.status}`);

        const { data: rawItems }  = await itemsRes.json();
        const { data: questMeta } = await questRes.json();

        // Map DB rows → items the game understands
        const mappedItems = rawItems.map((row, i) => ({
          id:     String(row.item_id),
          label:  row.label,
          zone:   row.correct_zone,
          startX: START_POSITIONS[i]?.x ?? 50,
          startY: START_POSITIONS[i]?.y ?? 60,
        }));

        // Build dropZones from unique zones referenced by the items
        const usedZoneIds = [...new Set(rawItems.map(r => r.correct_zone))];
        const mappedZones = usedZoneIds.map(id => ({
          id,
          ...(ZONE_REGISTRY[id] ?? { label: id, x: 40, y: 40, w: 20, h: 20 }),
        }));

        setItems(mappedItems);
        setDropZones(mappedZones);
        setInstructions(questMeta?.instructions ?? "I-drag ang bawat bagay sa tamang lugar!");
        setLoading(false);
      } catch (err) {
        console.error("[DragAndDrop] Load error:", err);
        setFetchError(err.message);
        setLoading(false);
      }
    };

    load();
  }, [questId, API]);

  // ── Placement state — reset whenever items change ─────────────────────────
  const [placements, setPlacements] = useState({});
  useEffect(() => {
    if (!items.length) return;
    setPlacements(
      Object.fromEntries(items.map(item => [item.id, { placedZone: null, correct: null }]))
    );
  }, [items]);

  // ── Drag + game state ─────────────────────────────────────────────────────
  const [dragging,   setDragging]   = useState(null);
  const [dragPos,    setDragPos]    = useState({ x: 0, y: 0 });
  const [activeZone, setActiveZone] = useState(null);
  const [feedback,   setFeedback]   = useState(null);
  const [shakeItem,  setShakeItem]  = useState(null);
  const [completed,  setCompleted]  = useState(false);
  const feedbackTimer = useRef(null);
  const containerRef  = useRef(null);

  const allCorrect = items.length > 0 &&
    items.every(item => placements[item.id]?.correct === true);

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
        setPlacements(prev => ({
          ...prev,
          [dragging]: { placedZone: targetZone.id, correct: true },
        }));
        triggerFeedback("correct", item.label);
      } else {
        setShakeItem(dragging);
        setTimeout(() => setShakeItem(null), 600);
        setPlacements(prev => ({
          ...prev,
          [dragging]: { placedZone: null, correct: false },
        }));
        triggerFeedback("wrong", item?.label);
      }
    }

    setDragging(null);
    setActiveZone(null);
  }, [dragging, dropZones, items]);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup",   handlePointerUp);
    }
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

  // ── Complete ──────────────────────────────────────────────────────────────
  const handleComplete = () => {
    if (!allCorrect) return;
    saveNPCProgress("village", npcId, items.length, true);

    if (playerId) {
      fetch(`${API}/api/challenge/submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ playerId, questId, npcId, score: items.length, maxScore: items.length, passed: true }),
      }).catch(err => console.warn("[BisaQuest] Sync failed:", err));
    }

    setCompleted(true);
    setTimeout(() => navigate(returnTo, { state: { completedQuestId: questId } }), 1800);
  };

  const handleBack = () => navigate(returnTo);

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="dad-wrapper">
      <div className="dad-container">
        <img src={houseBackground} alt="House" className="dad-bg" draggable={false} />
        <div className="dad-loading"><span>Gi-load ang dula...</span></div>
      </div>
    </div>
  );

  if (fetchError) return (
    <div className="dad-wrapper">
      <div className="dad-container">
        <img src={houseBackground} alt="House" className="dad-bg" draggable={false} />
        <div className="dad-error">
          <p>Dili ma-load ang dula. Sulayi pag-usab!</p>
          <Button variant="back" onClick={handleBack}>← Balik</Button>
        </div>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dad-wrapper">
      <div className="dad-container" ref={containerRef} style={{ userSelect: "none" }}>

        <img src={houseBackground} alt="House" className="dad-bg" draggable={false} />

        <Button variant="back" className="dad-back-btn" onClick={handleBack}>
          ← Back
        </Button>

        {dropZones.map(zone => (
          <DropZone
            key={zone.id}
            zone={zone}
            isActive={activeZone === zone.id}
            hasCorrectItem={items
              .filter(i => i.zone === zone.id)
              .every(i => placements[i.id]?.correct === true)}
          />
        ))}

        {items.map(item => (
          <DraggableItem
            key={item.id}
            item={item}
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
              <h2>Maayo kaayo!</h2>
              <p>Nahuman nimo ang tanan nga mga butang!</p>
            </div>
          </div>
        )}

        <button
          className={`dad-complete-btn ${allCorrect ? "dad-complete-btn--active" : "dad-complete-btn--disabled"}`}
          onClick={handleComplete}
          disabled={!allCorrect}
        >
          ✓ Completo na!
        </button>

      </div>
    </div>
  );
};

export default DragAndDrop;