import "./DropZone.css";

const DropZone = ({ zone, isActive, hasCorrectItem }) => {
  return (
    <div
      className={[
        "drop-zone",
        isActive ? "drop-zone--active" : "",
        hasCorrectItem ? "drop-zone--success" : "",
      ].filter(Boolean).join(" ")}
      style={{
        position: "absolute",
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.w}%`,
        height: `${zone.h}%`,
        pointerEvents: "none",
      }}
      aria-label={`Drop zone: ${zone.label}`}
    />
  );
};

export default DropZone;