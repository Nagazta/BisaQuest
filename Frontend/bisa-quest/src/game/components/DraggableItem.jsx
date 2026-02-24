import "./DraggableItem.css";

const DraggableItem = ({
  item,
  placement,
  isDragging,
  dragPos,
  isShaking,
  onDragStart,
}) => {
  const isCorrect = placement.correct === true;
  const isWrong   = placement.correct === false;

  const style = isDragging
    ? {
        position:      "fixed",
        left:          dragPos.x,
        top:           dragPos.y,
        transform:     "translate(-50%, -50%) scale(1.12) rotate(-3deg)",
        zIndex:        999,
        pointerEvents: "none",
      }
    : {
        position:      "absolute",
        left:          `${item.startX}%`,
        top:           `${item.startY}%`,
        transform:     "translate(-50%, -50%)",
        zIndex:        isCorrect ? 10 : 20,
        pointerEvents: isCorrect ? "none" : "auto",
      };

  return (
    <div
      className={[
        "d-item",
        isDragging ? "d-item--dragging" : "",
        isCorrect  ? "d-item--correct"  : "",
        isWrong    ? "d-item--wrong"    : "",
        isShaking  ? "d-item--shake"    : "",
      ].filter(Boolean).join(" ")}
      style={style}
      onPointerDown={isCorrect ? undefined : (e) => onDragStart(item.id, e)}
    >
      <div className="d-item__card">
        <div className="d-item__image-placeholder">
          <span className="d-item__emoji">{item.emoji || "📦"}</span>
        </div>
        <span className="d-item__label">{item.label}</span>
      </div>

      {isCorrect && (
        <div className="d-item__badge">✓</div>
      )}
    </div>
  );
};

export default DraggableItem;