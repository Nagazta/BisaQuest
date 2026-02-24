import "./DropZone.css";

// The drop zone is INVISIBLE by default.
// It only shows a very subtle glow when an item is being dragged over it
// so the player gets natural spatial feedback without spoiling the answer.
// When all correct items for this zone are placed, a faint success shimmer plays.

const DropZone = ({ zone, isActive, hasCorrectItem }) => {
  return (
    <div
      className={[
        "drop-zone",
        isActive       ? "drop-zone--active"  : "",
        hasCorrectItem ? "drop-zone--success" : "",
      ].filter(Boolean).join(" ")}
      style={{
        position: "absolute",
        left:   `${zone.x}%`,
        top:    `${zone.y}%`,
        width:  `${zone.w}%`,
        height: `${zone.h}%`,
        pointerEvents: "none", // pointer events handled by DragAndDrop parent
      }}
      aria-label={`Drop zone: ${zone.label}`}
    />
  );
};

export default DropZone;