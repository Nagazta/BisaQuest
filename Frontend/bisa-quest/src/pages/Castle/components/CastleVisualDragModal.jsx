// ─────────────────────────────────────────────────────────────────────────────
//  CastleVisualDragModal.jsx
//  Visual drag-and-drop game: drag the source image onto the target zone.
//  On success, the combined result image pops up.
//  Used for items like "Bookshelf" — drag a Book onto a Shelf.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import Button from "../../../components/Button";
import "./CastleVisualDragModal.css";

const CastleVisualDragModal = ({ item, npcName, npcImage, onClose, onComplete }) => {
  const { visualDrag, compoundWord } = item;

  const [isDragging, setIsDragging]   = useState(false);
  const [isDragOver, setIsDragOver]   = useState(false);
  const [isDropped, setIsDropped]     = useState(false);
  const [showResult, setShowResult]   = useState(false);

  // ── Drag handlers (source card) ───────────────────────────────────────────
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };
  const handleDragEnd = () => setIsDragging(false);

  // ── Drop handlers (target zone) ───────────────────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsDragging(false);
    setIsDropped(true);
    // Brief settling delay, then reveal the result card
    setTimeout(() => setShowResult(true), 700);
  };

  return (
    <div className="cvdm-overlay" onClick={onClose}>
      <div className="cvdm-card" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="cvdm-header">
          <img src={npcImage} alt={npcName} className="cvdm-npc-img" draggable={false} />
          <div className="cvdm-header-text">
            <span className="cvdm-header-title">{item.labelEnglish} Game!</span>
            <span className="cvdm-header-sub">{visualDrag.instructionBisaya}</span>
            <span className="cvdm-header-sub cvdm-header-sub--en">{visualDrag.instructionEnglish}</span>
          </div>
          <button className="cvdm-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="cvdm-divider" />

        {/* ── Success view ─────────────────────────────────────────────────── */}
        {showResult ? (
          <div className="cvdm-success">
            <div className="cvdm-success-emoji" aria-label={compoundWord.result}>
              {visualDrag.resultEmoji}
            </div>
            <div className="cvdm-equation">
              <span className="cvdm-eq-part">
                <span className="cvdm-eq-part-emoji">{visualDrag.dragEmoji}</span>
                {compoundWord.word1}
              </span>
              <span className="cvdm-eq-op">+</span>
              <span className="cvdm-eq-part">
                <span className="cvdm-eq-part-emoji">{visualDrag.targetEmoji}</span>
                {compoundWord.word2}
              </span>
              <span className="cvdm-eq-op">=</span>
              <span className="cvdm-eq-result">
                <span className="cvdm-eq-part-emoji">{visualDrag.resultEmoji}</span>
                {compoundWord.result}
              </span>
            </div>
            <p className="cvdm-success-label">{compoundWord.bisayaResult}</p>
            <Button variant="primary" onClick={() => onComplete(item)}>
              Padayon! · Continue!
            </Button>
          </div>
        ) : (

          /* ── Game view ──────────────────────────────────────────────────── */
          <div className="cvdm-game">

            {/* Draggable source */}
            <div
              className={[
                "cvdm-source",
                isDragging   ? "cvdm-source--dragging" : "",
                isDropped    ? "cvdm-source--dropped"  : "",
              ].filter(Boolean).join(" ")}
              draggable={!isDropped}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <span className="cvdm-card-emoji">{visualDrag.dragEmoji}</span>
              <span className="cvdm-card-label">{visualDrag.dragLabel}</span>
              {!isDropped && (
                <span className="cvdm-drag-hint">drag me!</span>
              )}
            </div>

            {/* Arrow indicator */}
            <div className="cvdm-arrow-wrap">
              <span className={`cvdm-arrow ${isDragging ? "cvdm-arrow--active" : ""}`}>
                →
              </span>
            </div>

            {/* Drop target */}
            <div
              className={[
                "cvdm-target",
                isDragOver ? "cvdm-target--over"   : "",
                isDropped  ? "cvdm-target--filled"  : "",
              ].filter(Boolean).join(" ")}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isDropped ? (
                /* Settling animation — book landed on shelf */
                <div className="cvdm-target-settled">
                  <span className="cvdm-card-emoji">{visualDrag.dragEmoji}</span>
                  <span className="cvdm-settled-label">✓</span>
                </div>
              ) : (
                <>
                  <span className="cvdm-card-emoji cvdm-target-emoji">{visualDrag.targetEmoji}</span>
                  <span className="cvdm-card-label">{visualDrag.targetLabel}</span>
                  <span className={`cvdm-drop-hint ${isDragOver ? "cvdm-drop-hint--over" : ""}`}>
                    {isDragOver ? "Drop it!" : "drop here"}
                  </span>
                </>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CastleVisualDragModal;
