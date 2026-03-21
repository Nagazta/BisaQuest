// ─────────────────────────────────────────────────────────────────────────────
//  CastleCompoundWordModal.jsx
//  Compound-word drag-and-drop mini-game for the Castle Room.
//  Given an item with a compoundWord config, shows 4 shuffled word tiles and
//  asks the player to drag the 2 correct parts into the slots to combine them.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import Button from "../../../components/Button";
import "./CastleCompoundWordModal.css";

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const CastleCompoundWordModal = ({ item, npcName, npcImage, onClose, onComplete }) => {
  const { compoundWord } = item;

  // Shuffle tiles once on mount
  const [tiles] = useState(() =>
    shuffleArray([
      { id: "w1", label: compoundWord.word1, isCorrect: true },
      { id: "w2", label: compoundWord.word2, isCorrect: true },
      { id: "d1", label: compoundWord.distractors[0], isCorrect: false },
      { id: "d2", label: compoundWord.distractors[1], isCorrect: false },
    ])
  );

  const [slots, setSlots] = useState([null, null]);
  const [dragId, setDragId] = useState(null);
  const [result, setResult] = useState(null); // null | "correct" | "wrong"

  const handleDragStart = (id) => setDragId(id);

  const handleDropOnSlot = (slotIdx) => {
    if (!dragId) return;
    setSlots((prev) => {
      const next = [...prev];
      // Remove the tile from the other slot if already placed
      const existing = next.indexOf(dragId);
      if (existing !== -1) next[existing] = null;
      next[slotIdx] = dragId;
      return next;
    });
    setDragId(null);
  };

  const handleRemoveSlot = (slotIdx) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  };

  const handleCombine = () => {
    const selected = slots
      .filter(Boolean)
      .map((id) => tiles.find((t) => t.id === id));
    const allCorrect =
      selected.length === 2 && selected.every((t) => t?.isCorrect);
    setResult(allCorrect ? "correct" : "wrong");
  };

  const handleTryAgain = () => {
    setSlots([null, null]);
    setResult(null);
  };

  // Derive preview word from current slots
  const previewWord =
    slots[0] && slots[1]
      ? (tiles.find((t) => t.id === slots[0])?.label ?? "") +
        (tiles.find((t) => t.id === slots[1])?.label ?? "")
      : null;

  return (
    <div className="ccwm-overlay" onClick={onClose}>
      <div className="ccwm-card" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="ccwm-header">
          <img src={npcImage} alt={npcName} className="ccwm-npc-img" draggable={false} />
          <div className="ccwm-header-text">
            <span className="ccwm-header-title">Compound Words!</span>
            <span className="ccwm-header-sub">
              I-drag ang duha ka pulong para makahimo og compound word!
            </span>
            <span className="ccwm-header-sub ccwm-header-sub--en">
              Drag two word parts to build a compound word!
            </span>
          </div>
          <button className="ccwm-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="ccwm-divider" />

        {/* ── Success view ────────────────────────────────────────────────── */}
        {result === "correct" && (
          <div className="ccwm-result ccwm-result--correct">
            <div className="ccwm-result-emoji">✨</div>
            <div className="ccwm-success-equation">
              <span className="ccwm-eq-part">{compoundWord.word1}</span>
              <span className="ccwm-eq-op">+</span>
              <span className="ccwm-eq-part">{compoundWord.word2}</span>
              <span className="ccwm-eq-op">=</span>
              <span className="ccwm-eq-result">{compoundWord.result}</span>
            </div>
            <p className="ccwm-result-label">{compoundWord.bisayaResult}</p>
            <Button variant="primary" onClick={() => onComplete(item)}>
              Padayon! · Continue!
            </Button>
          </div>
        )}

        {/* ── Wrong view ──────────────────────────────────────────────────── */}
        {result === "wrong" && (
          <div className="ccwm-result ccwm-result--wrong">
            <div className="ccwm-result-emoji">❌</div>
            <p className="ccwm-result-msg">
              Sayop! Pagsulayi pag-usab.
              <br />
              <span className="ccwm-result-msg--en">Wrong! Try again.</span>
            </p>
            <Button variant="primary" onClick={handleTryAgain}>
              Try Again →
            </Button>
          </div>
        )}

        {/* ── Game view ───────────────────────────────────────────────────── */}
        {result === null && (
          <div className="ccwm-game">
            {/* Hint */}
            <p className="ccwm-hint">
              💡 <span className="ccwm-hint-bisaya">Ang compound word may kalabotan sa</span>{" "}
              <strong>{item.labelBisaya}</strong>
              <span className="ccwm-hint-en"> · related to </span>
              <strong>{item.labelEnglish}</strong>
            </p>

            {/* Drop slots */}
            <div className="ccwm-slots-row">
              {[0, 1].map((idx) => {
                const tileInSlot = slots[idx]
                  ? tiles.find((t) => t.id === slots[idx])
                  : null;
                return (
                  <div
                    key={idx}
                    className={[
                      "ccwm-slot",
                      tileInSlot ? "ccwm-slot--filled" : "ccwm-slot--empty",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropOnSlot(idx);
                    }}
                    onClick={() => tileInSlot && handleRemoveSlot(idx)}
                    title={tileInSlot ? "Click to remove" : "Drop here"}
                  >
                    {tileInSlot ? (
                      <span className="ccwm-slot-word">{tileInSlot.label}</span>
                    ) : (
                      <span className="ccwm-slot-placeholder">
                        {idx === 0 ? "1st Word" : "2nd Word"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live preview */}
            <div className="ccwm-preview">
              {previewWord ? (
                <span className="ccwm-preview-word">{previewWord}</span>
              ) : (
                <span className="ccwm-preview-empty">? + ? = ???</span>
              )}
            </div>

            {/* Word tiles */}
            <div className="ccwm-tiles">
              {tiles.map((tile) => {
                const inSlot = slots.includes(tile.id);
                return (
                  <div
                    key={tile.id}
                    className={[
                      "ccwm-tile",
                      inSlot ? "ccwm-tile--used" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    draggable={!inSlot}
                    onDragStart={() => handleDragStart(tile.id)}
                    aria-label={tile.label}
                  >
                    {tile.label}
                  </div>
                );
              })}
            </div>

            {/* Combine button */}
            <button
              className={[
                "ccwm-combine-btn",
                slots[0] && slots[1]
                  ? "ccwm-combine-btn--ready"
                  : "ccwm-combine-btn--disabled",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={handleCombine}
              disabled={!slots[0] || !slots[1]}
            >
              ✨ Combine!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CastleCompoundWordModal;
