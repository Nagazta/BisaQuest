import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import DialogueBox from "../components/instructions/DialogueBox";
import DraggableItem from "./components/DraggableItem";
import DropZone from "./components/DropZone";
import LigayaCharacter from "../assets/images/characters/vocabulary/Village_Quest_NPC_2.png";
import { getPlayerId, saveNPCProgress } from "../utils/playerStorage";
import "./DragAndDrop.css";

// ── Scene backgrounds ─────────────────────────────────────────────────────────
import houseBackground    from "../assets/images/environments/scenario/house.jpg";
// import kitchenBackground  from "../assets/images/environments/scenario/kitchen.jpg";
// import bedroomBackground  from "../assets/images/environments/scenario/bedroom.jpg";
// import bathroomBackground from "../assets/images/environments/scenario/bathroom.jpg";

const SCENE_BACKGROUNDS = {
  living_room: houseBackground,
  // kitchen:     kitchenBackground,
  // bedroom:     bedroomBackground,
  // bathroom:    bathroomBackground,
};

const DEFAULT_BACKGROUND = houseBackground;

// ── Zone registry ─────────────────────────────────────────────────────────────
// Labels are English / Bisaya to match the bilingual seed (bisaquest_seed_v3.sql).
// Zone IDs must match correct_zone values in challenge_items exactly.
const ZONE_REGISTRY = {

  // ── Living room (house.jpg) ───────────────────────────────────────────────
  bookshelf: { label: "Bookshelf / Estante",  x: 66, y: 1,  w: 33, h: 55 },
  sofa:      { label: "Sofa / Sopa",          x: 46, y: 38, w: 24, h: 26 },
  aparador:  { label: "Cabinet / Aparador",   x: 67, y: 56, w: 33, h: 40 },
  lamesa:    { label: "Table / Lamesa",       x: 38, y: 62, w: 22, h: 20 },
  sulok:     { label: "Corner / Sulok",       x: 20, y: 38, w: 14, h: 52 },
  planggana: { label: "Basin / Planggana",    x: 0,  y: 38, w: 14, h: 52 },

  // ── Kitchen (kitchen.jpg) — coordinates TBD ───────────────────────────────
  // kitchen_counter: { label: "Counter",    x: 20, y: 30, w: 45, h: 25 },
  // ref:             { label: "Ref",        x: 70, y: 10, w: 25, h: 60 },
  // sink:            { label: "Sink",       x: 10, y: 35, w: 20, h: 25 },
  // dining_table:    { label: "Dining",     x: 30, y: 60, w: 40, h: 30 },

  // ── Bedroom (bedroom.jpg) — coordinates TBD ───────────────────────────────
  // bed:             { label: "Bed",        x: 40, y: 30, w: 45, h: 40 },
  // wardrobe:        { label: "Wardrobe",   x: 0,  y: 5,  w: 20, h: 75 },
  // study_desk:      { label: "Study Desk", x: 70, y: 40, w: 28, h: 35 },

  // ── Bathroom (bathroom.jpg) — coordinates TBD ────────────────────────────
  // shower:          { label: "Shower",     x: 60, y: 5,  w: 35, h: 55 },
  // cabinet_bath:    { label: "Cabinet",    x: 0,  y: 5,  w: 30, h: 45 },
  // toilet:          { label: "Toilet",     x: 65, y: 55, w: 30, h: 40 },
};

// ── Item starting positions ───────────────────────────────────────────────────
const START_POSITIONS = [
  { x: 48, y: 42 },
  { x: 82, y: 76 },
  { x: 53, y: 68 },
  { x: 62, y: 68 },
  { x: 20, y: 60 },
  { x: 35, y: 75 },
];

const getDialogueText = (feedback, allCorrect, instructions) => {
  if (allCorrect)                   return "Great job! You got them all! / Maayo kaayo! Nahuman na nimo ang tanan! 🎉";
  if (feedback?.type === "correct") return `Correct! "${feedback.label}" — Right place! / Husto! Tama ang lugar! ✓`;
  if (feedback?.type === "wrong")   return "Wrong! Try again! / Sayop! Sulayi pag-usab! ✗";
  return instructions || "Drag each item to the correct place! / I-drag ang bawat bagay sa tamang lugar!";
};

// ── Zone Debug Overlay ────────────────────────────────────────────────────────
// Shows ALL zones in ZONE_REGISTRY — not just the active ones — so you can
// verify and tune coordinates without needing a live quest.
//
// Active zones  = zones used by the current quest's items  (green)
// Inactive zones = all other zones in the registry         (orange, dashed)
//
// Each overlay shows:
//   - zone id  (top-left)
//   - label    (center)
//   - x / y / w / h values (bottom)
//   - cursor % coordinates while hovering (live readout on the container)
const ZoneDebugOverlay = ({ activeZoneIds, containerRef }) => {
  const [cursorPct, setCursorPct] = useState(null);

  // Live cursor % readout so you can figure out coordinates quickly
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      setCursorPct({
        x: (((e.clientX - rect.left) / rect.width)  * 100).toFixed(1),
        y: (((e.clientY - rect.top)  / rect.height) * 100).toFixed(1),
      });
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [containerRef]);

  return (
    <>
      {/* ── All zones in the registry ─────────────────────────────────── */}
      {Object.entries(ZONE_REGISTRY).map(([id, zone]) => {
        const isActive = activeZoneIds.includes(id);
        return (
          <div
            key={id}
            style={{
              position:    "absolute",
              left:        `${zone.x}%`,
              top:         `${zone.y}%`,
              width:       `${zone.w}%`,
              height:      `${zone.h}%`,
              border:      isActive
                ? "2px solid #00ff88"
                : "2px dashed #ff9900",
              background:  isActive
                ? "rgba(0,255,136,0.12)"
                : "rgba(255,153,0,0.10)",
              boxSizing:   "border-box",
              pointerEvents: "none",
              zIndex:      50,
            }}
          >
            {/* Zone id — top-left */}
            <span style={{
              position:   "absolute",
              top:        2,
              left:       3,
              fontSize:   "10px",
              fontWeight: "bold",
              color:      isActive ? "#00ff88" : "#ff9900",
              background: "rgba(0,0,0,0.55)",
              padding:    "1px 3px",
              borderRadius: 3,
              lineHeight: 1.2,
            }}>
              {id}
            </span>

            {/* Label — centered */}
            <span style={{
              position:   "absolute",
              top:        "50%",
              left:       "50%",
              transform:  "translate(-50%,-50%)",
              fontSize:   "11px",
              fontWeight: "600",
              color:      "#fff",
              background: "rgba(0,0,0,0.55)",
              padding:    "2px 5px",
              borderRadius: 3,
              whiteSpace: "nowrap",
            }}>
              {zone.label}
            </span>

            {/* Coordinates — bottom-left */}
            <span style={{
              position:   "absolute",
              bottom:     2,
              left:       3,
              fontSize:   "9px",
              color:      "#ddd",
              background: "rgba(0,0,0,0.55)",
              padding:    "1px 3px",
              borderRadius: 3,
              lineHeight: 1.3,
              fontFamily: "monospace",
            }}>
              x{zone.x} y{zone.y} w{zone.w} h{zone.h}
            </span>

            {/* Active badge — top-right */}
            {isActive && (
              <span style={{
                position:   "absolute",
                top:        2,
                right:      3,
                fontSize:   "9px",
                color:      "#00ff88",
                background: "rgba(0,0,0,0.55)",
                padding:    "1px 3px",
                borderRadius: 3,
              }}>
                ● active
              </span>
            )}
          </div>
        );
      })}

      {/* ── Live cursor readout ───────────────────────────────────────── */}
      {cursorPct && (
        <div style={{
          position:   "absolute",
          top:        6,
          left:       "50%",
          transform:  "translateX(-50%)",
          background: "rgba(0,0,0,0.75)",
          color:      "#fff",
          fontSize:   "11px",
          fontFamily: "monospace",
          padding:    "3px 8px",
          borderRadius: 4,
          pointerEvents: "none",
          zIndex:     100,
          whiteSpace: "nowrap",
        }}>
          x: {cursorPct.x}% &nbsp; y: {cursorPct.y}%
        </div>
      )}

      {/* ── Legend ───────────────────────────────────────────────────── */}
      <div style={{
        position:   "absolute",
        bottom:     6,
        left:       6,
        background: "rgba(0,0,0,0.75)",
        color:      "#fff",
        fontSize:   "10px",
        padding:    "4px 8px",
        borderRadius: 4,
        pointerEvents: "none",
        zIndex:     100,
        lineHeight: 1.6,
      }}>
        <span style={{ color: "#00ff88" }}>█</span> active zone &nbsp;
        <span style={{ color: "#ff9900" }}>▨</span> inactive zone
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const DragAndDrop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const questId  = location.state?.questId  || null;
  const npcId    = location.state?.npcId    || "village_npc_2";
  const npcName  = location.state?.npcName  || "Ligaya";
  const returnTo = location.state?.returnTo || "/student/village";
  const playerId = getPlayerId();
  const API      = import.meta.env.VITE_API_URL || "";

  // ── Debug mode — toggle with the button or set to true during development ──
  const [debugMode, setDebugMode] = useState(false);

  // ── Fetched quest data ────────────────────────────────────────────────────
  const [items,        setItems]        = useState([]);
  const [dropZones,    setDropZones]    = useState([]);
  const [background,   setBackground]   = useState(DEFAULT_BACKGROUND);
  const [npcImage,     setNpcImage]     = useState(LigayaCharacter);
  const [instructions, setInstructions] = useState("I-drag ang bawat bagay sa tamang lugar!");
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState(null);

  useEffect(() => {
    if (!questId) {
      // Mirrors bisaquest_seed_v3.sql Quest 1 (Cleaning Tools) so dev fallback is realistic
      console.warn("[DragAndDrop] No questId — using fallback data (Quest 1: Cleaning Tools / Mga Kagamitan sa Paglimpyo).");
      setItems([
        { id: "fb_1", label: "Broom / Walis",     zone: "sulok",     startX: 48, startY: 42 },
        { id: "fb_2", label: "Dustpan / Panlabay", zone: "sulok",     startX: 35, startY: 75 },
        { id: "fb_3", label: "Brush / Sipilyo",    zone: "sulok",     startX: 20, startY: 60 },
        { id: "fb_4", label: "Mop / Mop",          zone: "planggana", startX: 82, startY: 76 },
        { id: "fb_5", label: "Wet Rag / Trapo",    zone: "planggana", startX: 53, startY: 68 },
        { id: "fb_6", label: "Bucket / Timba",     zone: "planggana", startX: 62, startY: 68 },
      ]);
      setDropZones([
        { id: "sulok",     ...ZONE_REGISTRY.sulok },
        { id: "planggana", ...ZONE_REGISTRY.planggana },
      ]);
      setBackground(SCENE_BACKGROUNDS.living_room);
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

        const sceneType  = questMeta?.scene_type || "living_room";
        const sceneBg    = SCENE_BACKGROUNDS[sceneType] || DEFAULT_BACKGROUND;
        setBackground(sceneBg);

        if (!SCENE_BACKGROUNDS[sceneType]) {
          console.warn(
            `[DragAndDrop] No background registered for scene_type="${sceneType}". ` +
            `Add it to SCENE_BACKGROUNDS when the asset is ready.`
          );
        }

        setInstructions(questMeta?.instructions || "I-drag ang bawat bagay sa tamang lugar!");

        const mappedItems = rawItems.map((row, i) => ({
          id:     String(row.item_id),
          label:  row.label,
          zone:   row.correct_zone,
          startX: START_POSITIONS[i]?.x ?? 50,
          startY: START_POSITIONS[i]?.y ?? 60,
        }));

        const usedZoneIds = [...new Set(rawItems.map(r => r.correct_zone))];
        const mappedZones = usedZoneIds.map(id => {
          const registered = ZONE_REGISTRY[id];
          if (!registered) {
            console.warn(
              `[DragAndDrop] Zone "${id}" is referenced by challenge_items ` +
              `but not defined in ZONE_REGISTRY. Add it to make the zone active.`
            );
            return { id, label: id, x: 0, y: 0, w: 0, h: 0 };
          }
          return { id, ...registered };
        });

        setItems(mappedItems);
        setDropZones(mappedZones);
        setLoading(false);
      } catch (err) {
        console.error("[DragAndDrop] Load error:", err);
        setFetchError(err.message);
        setLoading(false);
      }
    };

    load();
  }, [questId, API]);

  // ── Placement state ───────────────────────────────────────────────────────
  const [placements, setPlacements] = useState({});
  useEffect(() => {
    if (!items.length) return;
    setPlacements(
      Object.fromEntries(items.map(item => [item.id, { placedZone: null, correct: null }]))
    );
  }, [items]);

  // ── Drag state ────────────────────────────────────────────────────────────
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
      px >= z.x && px <= z.x + z.w &&
      py >= z.y && py <= z.y + z.h
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
      px >= z.x && px <= z.x + z.w &&
      py >= z.y && py <= z.y + z.h
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
      fetch(`${API}/api/challenge/quest/submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          playerId,
          questId,
          npcId,
          score:    items.length,
          maxScore: items.length,
          passed:   true,
        }),
      }).catch(err => console.warn("[BisaQuest] Sync failed:", err));
    }

    setCompleted(true);
    setTimeout(() => navigate(returnTo, { state: { completedQuestId: questId } }), 1800);
  };

  const handleBack = () => navigate(returnTo);

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) return (
    <div className="dad-wrapper">
      <div className="dad-container">
        <img src={DEFAULT_BACKGROUND} alt="Loading" className="dad-bg" draggable={false} />
        <div className="dad-loading"><span>Loading game... / Gi-load ang dula...</span></div>
      </div>
    </div>
  );

  if (fetchError) return (
    <div className="dad-wrapper">
      <div className="dad-container">
        <img src={DEFAULT_BACKGROUND} alt="Error" className="dad-bg" draggable={false} />
        <div className="dad-error">
          <p>Could not load the game. Please try again! / Dili ma-load ang dula. Sulayi pag-usab!</p>
          <Button variant="back" onClick={handleBack}>← Balik</Button>
        </div>
      </div>
    </div>
  );

  if (!loading && items.length === 0) return (
    <div className="dad-wrapper">
      <div className="dad-container">
        <img src={DEFAULT_BACKGROUND} alt="Empty" className="dad-bg" draggable={false} />
        <div className="dad-error">
          <p>No items found. Make sure the questId is correct. / Walay items nga nakuha. Siguroa nga ang questId sakto.</p>
          <Button variant="back" onClick={handleBack}>← Balik</Button>
        </div>
      </div>
    </div>
  );

  // ── Ids of zones used by THIS quest (for debug overlay colouring) ─────────
  const activeZoneIds = dropZones.map(z => z.id);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dad-wrapper">
      <div className="dad-container" ref={containerRef} style={{ userSelect: "none" }}>

        <img src={background} alt="Scene" className="dad-bg" draggable={false} />

        <Button variant="back" className="dad-back-btn" onClick={handleBack}>
          ← Back
        </Button>

        {/* ── Debug toggle button ─────────────────────────────────────────── */}
        <button
          onClick={() => setDebugMode(prev => !prev)}
          style={{
            position:   "absolute",
            top:        8,
            right:      8,
            zIndex:     200,
            background: debugMode ? "#ff9900" : "rgba(0,0,0,0.55)",
            color:      "#fff",
            border:     "1px solid rgba(255,255,255,0.3)",
            borderRadius: 5,
            padding:    "4px 10px",
            fontSize:   "11px",
            fontWeight: "bold",
            cursor:     "pointer",
          }}
        >
          {debugMode ? "🐛 DEBUG ON" : "🐛 Debug"}
        </button>

        {/* ── Zone debug overlay (all zones in registry) ──────────────────── */}
        {debugMode && (
          <ZoneDebugOverlay
            activeZoneIds={activeZoneIds}
            containerRef={containerRef}
          />
        )}

        {/* Normal game zones (invisible in non-debug mode) */}
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
          <img src={npcImage} alt={npcName} className="dad-npc-img" draggable={false} />
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
              <p>You placed everything correctly! / Nahuman nimo ang tanan nga mga butang!</p>
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