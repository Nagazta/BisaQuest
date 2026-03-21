// ─────────────────────────────────────────────────────────────────────────────
//  CastleImageCombineModal.jsx
//  Image-based compound word game — drag emoji word cards onto two slots.
//  4 shuffled cards (word1, word2, distractor1, distractor2) are placed on
//  the scene background. Student drags the correct two into the slots.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useMemo } from "react";
import Button from "../../../components/Button";
import "./CastleImageCombineModal.css";

// Fisher-Yates shuffle (returns new array)
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Fixed starting positions for the 4 cards (% of canvas)
const START_POS = [
  { x: 12, y: 70 },
  { x: 36, y: 76 },
  { x: 62, y: 70 },
  { x: 84, y: 76 },
];

// Two drop slots on the canvas
const SLOTS = [
  { id: "slot1", label: "1st Word", x: 10, y: 8, w: 34, h: 38 },
  { id: "slot2", label: "2nd Word", x: 56, y: 8, w: 34, h: 38 },
];

const CastleImageCombineModal = ({
  item,
  npcName,
  npcImage,
  sceneBg,
  onClose,
  onComplete,
}) => {
  const { compoundWord, wordEmojis = {} } = item;

  // ── Build + shuffle 4 cards once ──────────────────────────────────────────
  const cards = useMemo(() => shuffle([
    { id: "w1", word: compoundWord.word1, emoji: wordEmojis[compoundWord.word1] ?? "❓", correctSlot: "slot1" },
    { id: "w2", word: compoundWord.word2, emoji: wordEmojis[compoundWord.word2] ?? "❓", correctSlot: "slot2" },
    { id: "d1", word: compoundWord.distractors[0], emoji: wordEmojis[compoundWord.distractors[0]] ?? "❓", correctSlot: null },
    { id: "d2", word: compoundWord.distractors[1], emoji: wordEmojis[compoundWord.distractors[1]] ?? "❓", correctSlot: null },
  ]), []);

  // ── State ──────────────────────────────────────────────────────────────────
  const [pos, setPos] = useState(() =>
    Object.fromEntries(cards.map((c, i) => [c.id, { ...START_POS[i] }]))
  );
  const [slotContent, setSlotContent] = useState({ slot1: null, slot2: null }); // slotId → cardId
  const [draggingId, setDraggingId]   = useState(null);
  const [wrongSlot, setWrongSlot]     = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const containerRef = useRef(null);
  const dragOffset   = useRef({ x: 0, y: 0 });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isPlaced   = (id) => Object.values(slotContent).includes(id);
  const slotCard   = (slotId) => cards.find((c) => c.id === slotContent[slotId]) ?? null;
  const slot1Card  = slotCard("slot1");
  const slot2Card  = slotCard("slot2");
  const bothFilled = !!slot1Card && !!slot2Card;

  // ── Pointer drag ───────────────────────────────────────────────────────────
  const handlePointerDown = (id, e) => {
    if (isPlaced(id) || showSuccess) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - (rect.left + (pos[id].x / 100) * rect.width),
      y: e.clientY - (rect.top  + (pos[id].y / 100) * rect.height),
    };
    setDraggingId(id);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!draggingId) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - dragOffset.current.y - rect.top)  / rect.height) * 100;
    setPos((prev) => ({
      ...prev,
      [draggingId]: {
        x: Math.min(Math.max(x, 2), 96),
        y: Math.min(Math.max(y, 2), 94),
      },
    }));
  };

  const handlePointerUp = (e) => {
    if (!draggingId) return;
    const card    = cards.find((c) => c.id === draggingId);
    const cardPos = pos[draggingId];

    const hitSlot = SLOTS.find(
      (s) =>
        cardPos.x >= s.x && cardPos.x <= s.x + s.w &&
        cardPos.y >= s.y && cardPos.y <= s.y + s.h
    );

    if (hitSlot) {
      const occupied  = !!slotContent[hitSlot.id];
      const isCorrect = card.correctSlot === hitSlot.id;

      if (!occupied && isCorrect) {
        // Snap to slot centre
        setPos((prev) => ({
          ...prev,
          [draggingId]: { x: hitSlot.x + hitSlot.w / 2, y: hitSlot.y + hitSlot.h / 2 },
        }));
        setSlotContent((prev) => {
          const next = { ...prev, [hitSlot.id]: draggingId };
          if (next.slot1 && next.slot2) setTimeout(() => setShowSuccess(true), 500);
          return next;
        });
      } else {
        // Wrong or occupied → flash + bounce back to start
        setWrongSlot(hitSlot.id);
        setTimeout(() => setWrongSlot(null), 700);
        const idx = cards.findIndex((c) => c.id === draggingId);
        setPos((prev) => ({ ...prev, [draggingId]: { ...START_POS[idx] } }));
      }
    }

    if (e.currentTarget?.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId);
    setDraggingId(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="cicm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cicm-modal">

        {/* Close */}
        <button className="cicm-close" onClick={onClose} aria-label="Close">✕</button>

        {/* ── Scene canvas ───────────────────────────────────────────────── */}
        <div className="cicm-canvas" ref={containerRef}>

          {/* Background */}
          <img src={sceneBg} alt="scene" className="cicm-scene-bg" draggable={false} />

          {/* Drop slots */}
          {SLOTS.map((slot) => {
            const filled  = slotCard(slot.id);
            const isWrong = wrongSlot === slot.id;
            return (
              <div
                key={slot.id}
                className={[
                  "cicm-slot",
                  filled  ? "cicm-slot--filled" : "",
                  isWrong ? "cicm-slot--wrong"  : "",
                ].filter(Boolean).join(" ")}
                style={{
                  left: `${slot.x}%`, top: `${slot.y}%`,
                  width: `${slot.w}%`, height: `${slot.h}%`,
                }}
              >
                {filled ? (
                  <div className="cicm-slot-content">
                    <span className="cicm-slot-emoji">{filled.emoji}</span>
                    <span className="cicm-slot-word">{filled.word}</span>
                  </div>
                ) : (
                  <span className="cicm-slot-placeholder">{slot.label}</span>
                )}
              </div>
            );
          })}

          {/* Equation bar */}
          <div className="cicm-equation">
            <span className={`cicm-eq-part ${slot1Card ? "cicm-eq-part--filled" : ""}`}>
              {slot1Card ? <><span>{slot1Card.emoji}</span>{slot1Card.word}</> : "?"}
            </span>
            <span className="cicm-eq-op">+</span>
            <span className={`cicm-eq-part ${slot2Card ? "cicm-eq-part--filled" : ""}`}>
              {slot2Card ? <><span>{slot2Card.emoji}</span>{slot2Card.word}</> : "?"}
            </span>
            <span className="cicm-eq-op">=</span>
            <span className={`cicm-eq-result ${bothFilled ? "cicm-eq-result--show" : ""}`}>
              {bothFilled ? compoundWord.result : "???"}
            </span>
          </div>

          {/* Draggable word cards */}
          {cards.map((card) => {
            if (isPlaced(card.id)) return null;
            const isDragging = draggingId === card.id;
            return (
              <div
                key={card.id}
                className={["cicm-card", isDragging ? "cicm-card--dragging" : ""].filter(Boolean).join(" ")}
                style={{
                  left: `${pos[card.id].x}%`,
                  top:  `${pos[card.id].y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: isDragging ? 30 : 10,
                  cursor: isDragging ? "grabbing" : "grab",
                  transition: isDragging ? "none" : "box-shadow 0.15s, transform 0.15s",
                }}
                onPointerDown={(e) => handlePointerDown(card.id, e)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <span className="cicm-card-emoji">{card.emoji}</span>
                <span className="cicm-card-word">{card.word}</span>
              </div>
            );
          })}

        </div>
        {/* ── End scene canvas ───────────────────────────────────────────── */}

        {/* ── Dialogue bar ───────────────────────────────────────────────── */}
        <div className="cicm-dialogue">
          <img src={npcImage} alt={npcName} className="cicm-npc-img" draggable={false} />
          <div className="cicm-dialogue-bubble">
            <div className="cicm-dialogue-name">{npcName}</div>
            {showSuccess ? (
              <>
                <div className="cicm-dialogue-text">
                  <span className="cicm-text-bisaya">
                    Sakto! <strong>{compoundWord.result}</strong> — na diskobre nimo! 🎉
                  </span>
                  <span className="cicm-text-english">
                    Correct! You discovered <strong>{compoundWord.result}</strong>! 🎉
                  </span>
                </div>
                <Button variant="primary" onClick={() => onComplete(item)}>
                  Padayon! · Continue!
                </Button>
              </>
            ) : (
              <div className="cicm-dialogue-text">
                <span className="cicm-text-bisaya">
                  I-drag ang duha ka pulong para makahimo og{" "}
                  <strong>"{compoundWord.result}"</strong>!
                </span>
                <span className="cicm-text-english">
                  Drag the two words that build{" "}
                  <strong>"{compoundWord.result}"</strong>!
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CastleImageCombineModal;
