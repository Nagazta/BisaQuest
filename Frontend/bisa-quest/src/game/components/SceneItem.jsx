import { useState, useCallback, useEffect, useRef } from "react";
import CleaningAnimation from "./CleaningAnimation";
import "./SceneItem.css";

const SceneItem = ({ item, onClick, locked, mode = "absolute", debugMode = false }) => {
    const [state, setState] = useState("idle");
    const [showAnim, setShowAnim] = useState(false);

    // Debug-only: local overrides for position and size
    // Initialise from item — these update when Supabase data arrives
    const [debugPos, setDebugPos] = useState({ x: item.x, y: item.y });
    const [debugSize, setDebugSize] = useState({
        w: item.widthPercent ?? null,
        h: item.heightPercent ?? null,
    });

    // Keep debugPos/debugSize in sync if item prop changes (e.g. after data loads)
    useEffect(() => {
        setDebugPos({ x: item.x, y: item.y });
        setDebugSize({ w: item.widthPercent ?? null, h: item.heightPercent ?? null });
    }, [item.x, item.y, item.widthPercent, item.heightPercent]);

    const cardRef = useRef(null);
    const dragOffset = useRef({ dx: 0, dy: 0 });

    // Store current debugSize in a ref so resize callbacks always read fresh values
    const debugSizeRef = useRef(debugSize);
    useEffect(() => { debugSizeRef.current = debugSize; }, [debugSize]);

    useEffect(() => {
        if (locked) {
            setState("correct");
            setShowAnim(true);
        }
    }, [locked]);

    const handleClick = useCallback(() => {
        if (debugMode) return;
        if (state === "correct" || locked) return;

        if (item.isCorrect) {
            setState("correct");
            setShowAnim(true);
            onClick(item, true);
        } else {
            setState("wrong");
            onClick(item, false);
            setTimeout(() => setState("idle"), 650);
        }
    }, [debugMode, state, locked, item, onClick]);

    // ── Debug drag-to-move ──────────────────────────────────────────────────
    const onDragStart = useCallback((e) => {
        if (!debugMode) return;
        const rect = cardRef.current.getBoundingClientRect();
        dragOffset.current = {
            dx: e.clientX - (rect.left + rect.width / 2),
            dy: e.clientY - (rect.top + rect.height / 2),
        };
        const ghost = document.createElement("div");
        ghost.style.cssText = "width:1px;height:1px;opacity:0;position:fixed;top:0;left:0;";
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => document.body.removeChild(ghost), 0);
    }, [debugMode]);

    const onDrag = useCallback((e) => {
        if (!debugMode || e.clientX === 0) return;
        const parent = cardRef.current.parentElement.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.dx - parent.left) / parent.width) * 100;
        const y = ((e.clientY - dragOffset.current.dy - parent.top) / parent.height) * 100;
        setDebugPos({ x: +x.toFixed(2), y: +y.toFixed(2) });
    }, [debugMode]);

    const onDragEnd = useCallback((e) => {
        if (!debugMode) return;
        const parent = cardRef.current.parentElement.getBoundingClientRect();
        const x = ((e.clientX - dragOffset.current.dx - parent.left) / parent.width) * 100;
        const y = ((e.clientY - dragOffset.current.dy - parent.top) / parent.height) * 100;
        const finalX = +x.toFixed(2);
        const finalY = +y.toFixed(2);
        setDebugPos({ x: finalX, y: finalY });
        console.log(`[DEBUG] "${item.label}" — position_x: ${finalX}, position_y: ${finalY}`);
    }, [debugMode, item.label]);

    // ── Debug resize handle ─────────────────────────────────────────────────
    // Uses refs throughout so the callbacks are never stale
    const resizeStart = useRef({ clientX: 0, clientY: 0, w: 0, h: 0, parentW: 0, parentH: 0 });

    const onResizeMouseDown = useCallback((e) => {
        if (!debugMode) return;
        e.stopPropagation();
        e.preventDefault();

        const parent = cardRef.current.parentElement.getBoundingClientRect();

        // Snapshot current size from ref — always fresh
        resizeStart.current = {
            clientX: e.clientX,
            clientY: e.clientY,
            w: debugSizeRef.current.w ?? 10,
            h: debugSizeRef.current.h ?? 10,
            parentW: parent.width,
            parentH: parent.height,
        };

        const onMove = (mv) => {
            const { clientX, clientY, w, h, parentW, parentH } = resizeStart.current;
            const newW = Math.max(1, w + ((mv.clientX - clientX) / parentW) * 100);
            const newH = Math.max(1, h + ((mv.clientY - clientY) / parentH) * 100);
            setDebugSize({ w: +newW.toFixed(2), h: +newH.toFixed(2) });
        };

        const onUp = (mv) => {
            const { clientX, clientY, w, h, parentW, parentH } = resizeStart.current;
            const newW = Math.max(1, w + ((mv.clientX - clientX) / parentW) * 100);
            const newH = Math.max(1, h + ((mv.clientY - clientY) / parentH) * 100);
            const finalW = +newW.toFixed(2);
            const finalH = +newH.toFixed(2);
            setDebugSize({ w: finalW, h: finalH });
            console.log(`[DEBUG] "${item.label}" — width_percent: ${finalW}, height_percent: ${finalH}`);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }, [debugMode, item.label]); // no debugSize dependency — uses ref instead

    // ── Derived style values ────────────────────────────────────────────────
    const x = debugMode ? debugPos.x : item.x;
    const y = debugMode ? debugPos.y : item.y;
    const w = debugMode ? (debugSize.w ?? item.widthPercent) : item.widthPercent;
    const h = debugMode ? (debugSize.h ?? item.heightPercent) : item.heightPercent;

    const style = mode === "absolute"
        ? {
            left: `${x}%`,
            top: `${y}%`,
            width: w != null ? `${w}%` : "auto",
            height: h != null ? `${h}%` : "auto",
            outline: debugMode ? "2px dashed rgba(255,100,0,0.8)" : undefined,
            cursor: debugMode ? "grab" : "pointer",
        }
        : {};

    return (
        <div
            ref={cardRef}
            className={`si-card si-card--${state}${mode === "grid" ? " si-card--grid" : ""}`}
            style={style}
            onClick={handleClick}
            draggable={debugMode}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
            role="button"
            tabIndex={state === "correct" ? -1 : 0}
            onKeyDown={e => e.key === "Enter" && handleClick()}
            aria-label={item.label}
            aria-pressed={state === "correct"}
        >
            {item.resolvedImage ? (
                <img
                    src={item.resolvedImage}
                    alt={item.label}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        pointerEvents: "none",
                    }}
                />
            ) : (
                <span style={{ fontSize: 28, pointerEvents: "none" }}>{item.emoji ?? "📦"}</span>
            )}

            <span className="si-label">{item.label}</span>

            {/* Debug overlay */}
            {debugMode && (
                <>
                    <div className="si-debug-badge">
                        x:{x} y:{y}<br />w:{w ?? "auto"} h:{h ?? "auto"}
                    </div>
                    <div
                        className="si-debug-resize"
                        onMouseDown={onResizeMouseDown}
                        title="Drag to resize"
                    >⤡</div>
                </>
            )}

            {state === "correct" && !debugMode && (
                <>
                    {showAnim && <CleaningAnimation onDone={() => setShowAnim(false)} />}
                    <div className="si-check">✓</div>
                </>
            )}
        </div>
    );
};

export default SceneItem;