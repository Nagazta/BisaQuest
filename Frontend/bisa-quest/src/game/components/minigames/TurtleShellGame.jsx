import React, { useState, useRef, useCallback } from "react";
import turtleGameBg from "../../../assets/images/environments/scenario/turtle-game.png";

//  Shell piece SVG renderer 
const ShellPiece = ({ variant, size = 54, dragging, shake, bounce }) => {
  const s = size;
  const cx = s / 2, cy = s / 2;

  const content = () => {
    switch (variant) {
      case "smooth": return (<><ellipse cx={cx} cy={cy} rx={cx - 3} ry={cy - 5} fill="#388e3c" /><ellipse cx={cx} cy={cy} rx={cx - 10} ry={cy - 12} fill="#2e7d32" opacity="0.6" /></>);
      case "lined": return (<><ellipse cx={cx} cy={cy} rx={cx - 3} ry={cy - 5} fill="#43a047" />{[0, 1, 2].map(i => <line key={i} x1={8 + i * 14} y1={cy - 10} x2={8 + i * 14} y2={cy + 10} stroke="#2e7d32" strokeWidth="1.5" opacity="0.7" />)}</>);
      case "cracked": return (<><ellipse cx={cx} cy={cy} rx={cx - 3} ry={cy - 5} fill="#388e3c" /><path d={`M ${cx - 6} ${cy - 8} L ${cx - 2} ${cy} L ${cx - 7} ${cy + 8}`} stroke="#1b5e20" strokeWidth="2" fill="none" opacity="0.85" /></>);
      case "patched": return (<><ellipse cx={cx} cy={cy} rx={cx - 3} ry={cy - 5} fill="#66bb6a" /><ellipse cx={cx - 6} cy={cy - 4} rx={7} ry={6} fill="#43a047" opacity="0.8" /><ellipse cx={cx + 5} cy={cy + 5} rx={6} ry={5} fill="#43a047" opacity="0.7" /></>);
      case "uneven": return (<><path d={`M ${cx - 14} ${cy} Q ${cx - 16} ${cy - 14} ${cx} ${cy - 14} Q ${cx + 18} ${cy - 12} ${cx + 14} ${cy} Q ${cx + 12} ${cy + 14} ${cx} ${cy + 16} Q ${cx - 15} ${cy + 12} ${cx - 14} ${cy}`} fill="#4caf50" /></>);
      case "snail": return (<><circle cx={cx} cy={cy} r={cx - 4} fill="#bcaaa4" /><path d={`M ${cx} ${cy} Q ${cx + 8} ${cy - 8} ${cx + 4} ${cy - 14} Q ${cx - 6} ${cy - 18} ${cx - 10} ${cy - 8} Q ${cx - 12} ${cy} ${cx - 4} ${cy + 4} Q ${cx + 4} ${cy + 8} ${cx + 6} ${cy}`} stroke="#795548" strokeWidth="2" fill="none" /></>);
      case "crab": return (<><path d={`M ${cx - 16} ${cy + 8} Q ${cx} ${cy - 16} ${cx + 16} ${cy + 8} Z`} fill="#ef6c00" /><line x1={cx - 10} y1={cy + 6} x2={cx + 10} y2={cy + 6} stroke="#e65100" strokeWidth="2" /></>);
      case "clam": return (<><ellipse cx={cx} cy={cy - 2} rx={cx - 4} ry={cy - 10} fill="#e0e0e0" /><ellipse cx={cx} cy={cy + 8} rx={cx - 4} ry={cy - 12} fill="#bdbdbd" /><line x1={cx - (cx - 4)} y1={cy + 2} x2={cx + (cx - 4)} y2={cy + 2} stroke="#9e9e9e" strokeWidth="1.5" /></>);
      case "spiky": return (<><polygon points={`${cx},${cy - 20} ${cx + 8},${cy - 6} ${cx + 22},${cy - 4} ${cx + 12},${cy + 6} ${cx + 14},${cy + 20} ${cx},${cy + 12} ${cx - 14},${cy + 20} ${cx - 12},${cy + 6} ${cx - 22},${cy - 4} ${cx - 8},${cy - 6}`} fill="#37474f" /><circle cx={cx} cy={cy} r={6} fill="#263238" /></>);
      case "jagged": return (<><path d={`M ${cx - 18} ${cy + 12} L ${cx - 12} ${cy - 6} L ${cx - 4} ${cy + 2} L ${cx + 2} ${cy - 14} L ${cx + 8} ${cy - 2} L ${cx + 18} ${cy - 10} L ${cx + 14} ${cy + 14} Z`} fill="#4a4a4a" stroke="#212121" strokeWidth="1.5" /><path d={`M ${cx - 6} ${cy - 4} L ${cx + 4} ${cy + 8}`} stroke="#b71c1c" strokeWidth="2.5" opacity="0.85" /></>);
      default: return <ellipse cx={cx} cy={cy} rx={cx - 3} ry={cy - 5} fill="#388e3c" />;
    }
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{
      cursor: dragging ? "grabbing" : "grab",
      filter: dragging ? "drop-shadow(0 4px 10px rgba(255,255,255,0.5))" : "drop-shadow(0 2px 5px rgba(0,0,0,0.5))",
      animation: shake ? "shell-shake 0.4s ease" : bounce ? "shell-bounce 0.4s ease" : undefined,
      userSelect: "none", display: "block",
    }}>
      {content()}
    </svg>
  );
};

const ShellSlot = ({ filled, glowing }) => (
  <div style={{
    width: 28, height: 22, borderRadius: "50%",
    background: filled ? "rgba(76,175,80,0.7)" : "rgba(0,0,0,0.35)",
    border: filled ? "2px solid #a5d6a7" : "2px dashed rgba(255,255,255,0.4)",
    filter: glowing ? "drop-shadow(0 0 8px #69f0ae)" : "none",
    transition: "background 0.3s, filter 0.3s",
  }} />
);

// Positions as % of canvas. All values keep the 50px piece (25px radius)
// at least 15px from each edge at a ~400×260px canvas ≈ 10% H / 15% V margin.
const PIECE_STARTS = [
  { x: 18, y: 14 }, { x: 36, y: 14 }, { x: 54, y: 14 }, { x: 72, y: 14 }, { x: 84, y: 22 },
  { x: 16, y: 76 }, { x: 30, y: 80 }, { x: 50, y: 80 }, { x: 68, y: 80 }, { x: 82, y: 76 },
];

const TurtleShellGame = ({ quest, item, npcName, npcImage, onClose, onComplete }) => {
  const { introDialogue, completionDialogue, pieces } = quest;

  const pieceList = useRef(
    [...pieces].sort(() => Math.random() - 0.5)
      .map((p, i) => ({ ...p, startX: PIECE_STARTS[i].x, startY: PIECE_STARTS[i].y }))
  ).current;

  const [stage, setStage] = useState("intro");   // intro | playing | done
  const [dialogueStep, setDialogueStep] = useState(0);

  const [positions, setPositions] = useState(
    Object.fromEntries(pieceList.map(p => [p.id, { x: p.startX, y: p.startY }]))
  );
  const [placed, setPlaced] = useState([]);
  const [shakePieceId, setShakePieceId] = useState(null);
  const [bouncePieceId, setBouncePieceId] = useState(null);
  const [draggedId, setDraggedId] = useState(null);

  const containerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const TURTLE_ZONE = { x: 34, y: 30, w: 28, h: 30 };
  const inTurtleZone = (pos) =>
    pos.x > TURTLE_ZONE.x && pos.x < TURTLE_ZONE.x + TURTLE_ZONE.w &&
    pos.y > TURTLE_ZONE.y && pos.y < TURTLE_ZONE.y + TURTLE_ZONE.h;

  const introLines = introDialogue || [];
  const doneLines = completionDialogue || [];

  const currentLines = stage === "intro" ? introLines : stage === "done" ? doneLines : null;
  const dialogueLine = currentLines?.[dialogueStep] ?? null;

  const handleDialogueNext = () => {
    if (!currentLines) return;
    if (dialogueStep < currentLines.length - 1) {
      setDialogueStep(s => s + 1);
    } else {
      if (stage === "intro") { setStage("playing"); setDialogueStep(0); }
      else if (stage === "done") { onComplete(item); }
    }
  };

  const handlePointerDown = (id, e) => {
    if (stage !== "playing") return;
    if (placed.includes(id)) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 };
    setDraggedId(id);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (id, e) => {
    if (draggedId !== id) return;
    e.preventDefault();
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    // Keep piece (50px wide, centre-anchored) at least 15px from every edge
    const MARGIN = 15;
    const HALF = 25;  // half of the 50px piece size
    const minX = ((MARGIN + HALF) / r.width) * 100;
    const maxX = ((r.width - MARGIN - HALF) / r.width) * 100;
    const minY = ((MARGIN + HALF) / r.height) * 100;
    const maxY = ((r.height - MARGIN - HALF) / r.height) * 100;
    const x = ((e.clientX - dragOffset.current.x - r.left) / r.width) * 100;
    const y = ((e.clientY - dragOffset.current.y - r.top) / r.height) * 100;
    setPositions(prev => ({ ...prev, [id]: { x: Math.min(Math.max(x, minX), maxX), y: Math.min(Math.max(y, minY), maxY) } }));
  };

  const handlePointerUp = useCallback((id, e) => {
    if (draggedId !== id) return;
    setDraggedId(null);
    try { e?.currentTarget?.releasePointerCapture(e.pointerId); } catch (_) { }

    const piece = pieceList.find(p => p.id === id);
    const pos = positions[id];
    if (!piece || !pos) return;

    if (inTurtleZone(pos)) {
      if (piece.type === "correct") {
        const newPlaced = [...placed, id];
        setPlaced(newPlaced);
        setPositions(prev => ({ ...prev, [id]: { x: 50, y: 42 } }));
        if (newPlaced.length >= 5) {
          setTimeout(() => { setStage("done"); setDialogueStep(0); }, 700);
        }
      } else if (piece.type === "neutral") {
        setShakePieceId(id);
        setTimeout(() => setShakePieceId(null), 500);
        setPositions(prev => ({ ...prev, [id]: { x: piece.startX, y: piece.startY } }));
      } else {
        setBouncePieceId(id);
        setTimeout(() => setBouncePieceId(null), 500);
        setPositions(prev => ({ ...prev, [id]: { x: piece.startX, y: piece.startY } }));
      }
    } else {
      setPositions(prev => ({ ...prev, [id]: { x: piece.startX, y: piece.startY } }));
    }
  }, [draggedId, positions, pieceList, placed]);


  const correctCount = placed.length;

  return (
    <div className="iqm-overlay">
      <div className="iqm-modal iqm-modal--scene">
        <button className="iqm-close" onClick={onClose}>✕</button>

        <div className="iqm-header">
          <span className="iqm-header-bisaya">{item.labelBisaya}</span>
          <span className="iqm-header-english">{item.labelEnglish}</span>
          <span className="iqm-mechanic-badge" style={{ background: "#558b2f" }}>Shell Repair</span>
        </div>

        <div className="iqm-scene-canvas" ref={containerRef}
          style={{ background: `url(${turtleGameBg}) center/cover no-repeat`, borderRadius: "12px", position: "relative", overflow: "hidden" }}>

          {stage === "playing" && (<>
            {/* Shell drop slots — positioned over the turtle in the background image */}
            <div style={{ position: "absolute", left: "46%", top: "64%", transform: "translate(-50%,-50%)", display: "flex", gap: 6, zIndex: 5, pointerEvents: "none" }}>
              {Array.from({ length: 5 }).map((_, i) => <ShellSlot key={i} filled={i < correctCount} glowing={i === correctCount - 1} />)}
            </div>

            {pieceList.map(piece => {
              const pos = positions[piece.id];
              if (placed.includes(piece.id)) return null;
              const isDragging = draggedId === piece.id;
              return (
                <div key={piece.id} style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", zIndex: isDragging ? 30 : 10, transition: isDragging ? "none" : "left 0.3s ease, top 0.3s ease", userSelect: "none" }}
                  onPointerDown={e => handlePointerDown(piece.id, e)}
                  onPointerMove={e => handlePointerMove(piece.id, e)}
                  onPointerUp={e => handlePointerUp(piece.id, e)}
                  onPointerCancel={e => handlePointerUp(piece.id, e)}>
                  <ShellPiece variant={piece.variant} size={isDragging ? 60 : 50} dragging={isDragging} shake={shakePieceId === piece.id} bounce={bouncePieceId === piece.id} />
                </div>
              );
            })}

            <div style={{ position: "absolute", left: "47%", top: "45%", transform: "translate(-50%,-50%)", width: 90, height: 90, borderRadius: "50%", border: "2px dashed rgba(255,255,255,0.2)", pointerEvents: "none" }} />
            <div className="iqm-sweep-progress" style={{ top: "6%", bottom: "auto" }}>
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className={`iqm-sweep-pip ${i < correctCount ? "iqm-sweep-pip--done" : ""}`} />)}
            </div>
          </>)}

          {stage === "done" && (
            <div className="iqm-scene-success-overlay">
              <div className="iqm-scene-success-card">
                <div className="iqm-scene-success-stars">🐢💚🐢</div>
                <div className="iqm-scene-success-text">Nataod na ang Kabhang! · Shell Repaired!</div>
              </div>
            </div>
          )}
        </div>

        <div className="iqm-dialogue-row">
          <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
          <div className="iqm-dialogue-bubble">
            <div className="iqm-dialogue-speaker">{npcName}</div>
            <div className="iqm-dialogue-text">
              {dialogueLine ? (
                <><span className="iqm-dialogue-bisaya">{dialogueLine.bisayaText}</span><span className="iqm-dialogue-english">{dialogueLine.englishText}</span></>
              ) : stage === "playing" ? (
                <><span className="iqm-dialogue-bisaya">I-drag ang sakto nga piraso sa pawikan! ({correctCount}/5)</span><span className="iqm-dialogue-english">Drag the right shell piece to the turtle! ({correctCount}/5)</span></>
              ) : null}
            </div>
            {(stage === "intro" || stage === "done") && (
              <button className="iqm-next-btn" onClick={handleDialogueNext}>{stage === "done" && dialogueStep === doneLines.length - 1 ? "✓" : "▶"}</button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shell-shake { 0%,100%{transform:translate(-50%,-50%) rotate(0)} 25%{transform:translate(-50%,-50%) rotate(-12deg)} 75%{transform:translate(-50%,-50%) rotate(12deg)} }
        @keyframes shell-bounce { 0%{transform:translate(-50%,-50%) scale(1)} 30%{transform:translate(-50%,-50%) scale(1.25) rotate(8deg)} 60%{transform:translate(-50%,-50%) scale(0.85) rotate(-6deg)} 100%{transform:translate(-50%,-50%) scale(1)} }
      `}</style>
    </div>
  );
};

export default TurtleShellGame;
