import "./BackpackItems.css";

// Each item: { item_id, label, image_key, emoji }
// onDragStart(item) — called when player starts dragging
const BackpackItems = ({ items = [], onDragStart }) => {
    return (
        <div className="backpack-bar">
            <div className="backpack-label">🎒 Backpack</div>
            <div className="backpack-items">
                {items.map(item => (
                    <div
                        key={item.item_id}
                        className="backpack-item"
                        draggable
                        onDragStart={e => { e.dataTransfer.setData("item_id", String(item.item_id)); onDragStart?.(item); }}
                    >
                        <div className="backpack-item-icon">{item.emoji || "📦"}</div>
                        <span className="backpack-item-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BackpackItems;