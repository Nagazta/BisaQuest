import { useState, useRef } from "react";
import Button from "../../../components/Button";
import "../../../game/components/ItemQuestModal.css";
import "./CastleApplyModal.css";

const CastleApplyModal = ({ item, npcName, npcImage, onClose, onComplete }) => {
  const { compoundWord, applyGame, labelBisaya, labelEnglish } = item;
  const { sceneBefore, sceneAfter, draggable, dropZone, hintBisaya, hintEnglish } = applyGame;

  const [pos, setPos] = useState({ x: draggable.startX, y: draggable.startY });
  const [isDragging, setIsDragging] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [solved, setSolved] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);

  const containerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // ── Pointer drag ────────────────────────────────────────────────────────────
  const handlePointerDown = (e) => {
    if (placed || solved) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - (rect.left + (pos.x / 100) * rect.width),
      y: e.clientY - (rect.top + (pos.y / 100) * rect.height),
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
    const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
    setPos({ x: Math.min(Math.max(x, 2), 96), y: Math.min(Math.max(y, 2), 94) });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;

    const inZone =
      pos.x >= dropZone.x && pos.x <= dropZone.x + dropZone.w &&
      pos.y >= dropZone.y && pos.y <= dropZone.y + dropZone.h;

    if (inZone) {
      setPos({ x: dropZone.x + dropZone.w / 2, y: dropZone.y + dropZone.h / 2 });
      setPlaced(true);
      setTimeout(() => setSolved(true), 500);
    } else {
      setWrongFlash(true);
      setPos({ x: draggable.startX, y: draggable.startY });
      setTimeout(() => setWrongFlash(false), 500);
    }

    if (e.currentTarget?.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="iqm-modal iqm-modal--scene iqm-modal--castle">

        {/* Close */}
        <button className="iqm-close" onClick={onClose} aria-label="Close">✕</button>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="iqm-header">
          <span className="iqm-header-bisaya">{labelBisaya}</span>
          <span className="iqm-header-english">{labelEnglish}</span>
          <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">Drag &amp; Place</span>
        </div>

        {/* ── Scene canvas ─────────────────────────────────────────────────── */}
        <div className="iqm-scene-canvas" ref={containerRef}>

          {/* Background — crossfades to sceneAfter on solve */}
          <img
            src={sceneBefore}
            alt="scene"
            className="iqm-scene-bg"
            draggable={false}
          />
          {solved && (
            <img
              src={sceneAfter}
              alt="scene solved"
              className="iqm-scene-bg iqm-scene-bg--reveal"
              draggable={false}
            />
          )}

          {/* Drop zone — pulsing glow target */}
          {!placed && (
            <div
              className={`cam-dropzone ${wrongFlash ? "cam-dropzone--wrong" : ""}`}
              style={{
                left: `${dropZone.x}%`,
                top: `${dropZone.y}%`,
                width: `${dropZone.w}%`,
                height: `${dropZone.h}%`,
              }}
            />
          )}

          {/* Result banner — appears after solve */}
          {solved && (
            <div className="cam-result-banner">
              <span className="cam-result-part">
                <span className="cam-result-emoji">{draggable.emoji}</span>
                <span className="cam-result-label">{compoundWord.word1}</span>
              </span>
              <span className="cam-result-op">+</span>
              <span className="cam-result-part">
                <span className="cam-result-label">{compoundWord.word2}</span>
              </span>
              <span className="cam-result-op">=</span>
              <span className="cam-result-word">{compoundWord.result}</span>
            </div>
          )}

          {/* Draggable card */}
          {!placed && (
            <div
              className={[
                "cam-card",
                isDragging ? "cam-card--dragging" : "",
                wrongFlash ? "cam-card--wrong" : "",
              ].filter(Boolean).join(" ")}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isDragging ? 30 : 10,
                cursor: isDragging ? "grabbing" : "grab",
                transition: isDragging ? "none" : "box-shadow 0.15s, transform 0.15s",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {draggable.image
                ? <img src={draggable.image} alt={draggable.label} className="cam-card-img" draggable={false} />
                : <span className="cam-card-emoji">{draggable.emoji}</span>
              }
              <span className="cam-card-word">{draggable.label}</span>
            </div>
          )}

        </div>
        {/* ── End scene canvas ─────────────────────────────────────────────── */}

        {/* ── Dialogue bar ─────────────────────────────────────────────────── */}
        <div className="iqm-dialogue-row">
          <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
          <div className="iqm-dialogue-bubble">
            <div className="iqm-dialogue-speaker">{npcName}</div>
            {solved ? (
              <>
                <div className="iqm-dialogue-text">
                  <span className="iqm-dialogue-bisaya">
                    Sakto! <strong>{compoundWord.result}</strong> — na diskobre nimo! 🎉
                  </span>
                  <span className="iqm-dialogue-english">
                    Correct! You discovered <strong>{compoundWord.result}</strong>! 🎉
                  </span>
                </div>
                <Button variant="primary" onClick={() => onComplete(item)}>
                  Padayon! · Continue!
                </Button>
              </>
            ) : (
              <div className="iqm-dialogue-text">
                <span className="iqm-dialogue-bisaya">{hintBisaya}</span>
                <span className="iqm-dialogue-english">{hintEnglish}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CastleApplyModal;
