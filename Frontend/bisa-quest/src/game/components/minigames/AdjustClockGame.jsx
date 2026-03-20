import React, { useState, useRef, useCallback, useEffect } from "react";

const AdjustClockGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const [target] = useState(() => {
        const randomIndex = Math.floor(Math.random() * quest.targetTimes.length);
        return quest.targetTimes[randomIndex];
    });

    const targetHour12 = target.hour === 0 ? 12 : target.hour;
    const targetMinuteStr = target.minute === 0 ? "00" : (target.minute < 10 ? `0${target.minute}` : `${target.minute}`);
    const targetTimeDisplay = `${targetHour12}:${targetMinuteStr}`;
    const targetLabelWithTime = `${target.labelEnglish} (${targetTimeDisplay})`;
    const targetLabelBisayaWithTime = `${target.labelBisaya} (${targetTimeDisplay})`;

    const dialogue = [
        {
            bisayaText: `Tan-awa ang ${item.labelBisaya}! Sulayi kining mini-game!`,
            englishText: `Look at the ${item.labelEnglish}! Try this mini-game!`,
        },
        {
            bisayaText: `Ibutang ang orasan sa: ${targetLabelBisayaWithTime}`,
            englishText: `Set the clock to: ${targetLabelWithTime}`,
        },
    ];

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [dragging, setDragging] = useState(null); // 'hour' | 'minute' | null

    const svgRef = useRef(null);
    const draggingRef = useRef(null);

    const SVG_SIZE = 260;
    const CX = 130;
    const CY = 130;

    const getHandCoords = (h, m) => {
        const minAng = (m / 60) * 2 * Math.PI - Math.PI / 2;
        const hourAng = ((h % 12) / 12) * 2 * Math.PI + (m / 60) * (2 * Math.PI / 12) - Math.PI / 2;
        return {
            hour: { x2: CX + 55 * Math.cos(hourAng), y2: CY + 55 * Math.sin(hourAng) },
            minute: { x2: CX + 72 * Math.cos(minAng), y2: CY + 72 * Math.sin(minAng) },
        };
    };

    const getAngle = useCallback((e) => {
        if (!svgRef.current) return 0;
        const rect = svgRef.current.getBoundingClientRect();
        const scaleX = SVG_SIZE / rect.width;
        const scaleY = SVG_SIZE / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = (clientX - rect.left) * scaleX - CX;
        const y = (clientY - rect.top) * scaleY - CY;
        let ang = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (ang < 0) ang += 360;
        return ang;
    }, []);

    const handlePointerDown = (hand, e) => {
        if (stage !== "playing") return;
        e.preventDefault();
        draggingRef.current = hand;
        setDragging(hand);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = useCallback((e) => {
        if (!draggingRef.current || stage !== "playing") return;
        e.preventDefault();
        const ang = getAngle(e);
        if (draggingRef.current === "minute") {
            let m = Math.round((ang / 360) * 60 / 5) * 5;
            if (m >= 60) m = 0;
            setMinute(m);
        } else if (draggingRef.current === "hour") {
            let h = Math.round((ang / 360) * 12);
            if (h === 0) h = 12;
            setHour(h);
        }
    }, [stage, getAngle]);

    const handlePointerUp = useCallback(() => {
        draggingRef.current = null;
        setDragging(null);
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (stage === "playing" && hour === target.hour && minute === target.minute) {
            setStage("success");
        }
    }, [hour, minute, stage, target]);

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(s => s + 1);
        else setStage("playing");
    };

    const dialogueText = (() => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Sakto! Maayo kaayo! 🎉", englishText: "Correct! Well done! 🎉" };
        return {
            bisayaText: `Ibutang ang orasan sa: ${target.labelBisaya}`,
            englishText: `Set the clock to: ${targetLabelWithTime}`,
        };
    })();

    const hands = getHandCoords(hour, minute);

    const tickMarks = Array.from({ length: 60 }, (_, i) => {
        const ang = (i / 60) * 2 * Math.PI - Math.PI / 2;
        const isHour = i % 5 === 0;
        const r1 = isHour ? 94 : 100;
        return {
            x1: CX + r1 * Math.cos(ang), y1: CY + r1 * Math.sin(ang),
            x2: CX + 108 * Math.cos(ang), y2: CY + 108 * Math.sin(ang),
            isHour,
        };
    });

    const hourNumbers = Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const ang = (n / 12) * 2 * Math.PI - Math.PI / 2;
        return { n, x: CX + 80 * Math.cos(ang), y: CY + 80 * Math.sin(ang) };
    });

    const h12 = hour === 0 ? 12 : hour;
    const mStr = minute === 0 ? "00" : (minute < 10 ? `0${minute}` : `${minute}`);

    return (
        <div className="iqm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <span className="iqm-header-bisaya">{item.labelBisaya}</span>
                    <span className="iqm-header-english">{item.labelEnglish}</span>
                    <span className="iqm-mechanic-badge iqm-mechanic-badge--scene_drag">Adjust Clock</span>
                </div>

                <div
                    className="iqm-scene-canvas iqm-scene-canvas--clock"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#e2d5b8", flexDirection: "column" }}
                >
                    {/* Target time label */}
                    {stage !== "intro" && (
                        <div style={{
                            position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
                            background: "rgba(30,15,4,0.82)", border: "1.5px solid rgba(252,215,101,0.7)",
                            borderRadius: 12, padding: "7px 20px", display: "flex", flexDirection: "column",
                            alignItems: "center", gap: 2, whiteSpace: "nowrap", zIndex: 20,
                        }}>
                            <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 17, color: "#fcd765" }}>{targetLabelBisayaWithTime}</span>
                            <span style={{ fontSize: 12, color: "#c8b99a", fontStyle: "italic" }}>{targetLabelWithTime}</span>
                        </div>
                    )}

                    {/* Intro placeholder */}
                    {stage === "intro" && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                            <div className="iqm-intro-icon" style={{ color: "#fcd765", fontSize: 80 }}>🕐</div>
                        </div>
                    )}

                    {/* Clock SVG */}
                    {stage !== "intro" && (
                        <div style={{ position: "relative" }}>
                            <svg
                                ref={svgRef}
                                viewBox="0 0 260 260"
                                style={{ width: 260, height: 260, overflow: "visible", userSelect: "none", cursor: "crosshair" }}
                            >
                                <circle cx={CX} cy={CY} r={122} fill="#5a3c1e" />
                                <circle cx={CX} cy={CY} r={112} fill="#fdf6e3" />
                                <circle cx={CX} cy={CY} r={108} fill="#fffaea" />

                                {tickMarks.map((t, i) => (
                                    <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                                        stroke={t.isHour ? "#4a331a" : "#c9b99a"}
                                        strokeWidth={t.isHour ? 2.5 : 1} />
                                ))}

                                {hourNumbers.map(({ n, x, y }) => (
                                    <text key={n} x={x} y={y}
                                        textAnchor="middle" dominantBaseline="central"
                                        fontFamily="'Fredoka One', cursive"
                                        fontSize={n === 12 || n === 3 || n === 6 || n === 9 ? 17 : 15}
                                        fill="#4a331a"
                                    >{n}</text>
                                ))}

                                <g
                                    style={{ cursor: dragging === "hour" ? "grabbing" : "grab" }}
                                    onPointerDown={(e) => handlePointerDown("hour", e)}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerCancel={handlePointerUp}
                                >
                                    <line x1={CX} y1={CY} x2={hands.hour.x2} y2={hands.hour.y2} stroke="#3a2010" strokeWidth={8} strokeLinecap="round" />
                                    <line x1={CX} y1={CY} x2={hands.hour.x2} y2={hands.hour.y2} stroke="transparent" strokeWidth={28} />
                                </g>

                                <g
                                    style={{ cursor: dragging === "minute" ? "grabbing" : "grab" }}
                                    onPointerDown={(e) => handlePointerDown("minute", e)}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerCancel={handlePointerUp}
                                >
                                    <line x1={CX} y1={CY} x2={hands.minute.x2} y2={hands.minute.y2} stroke="#a93c3c" strokeWidth={5} strokeLinecap="round" />
                                    <line x1={CX} y1={CY} x2={hands.minute.x2} y2={hands.minute.y2} stroke="transparent" strokeWidth={22} />
                                </g>

                                <circle cx={CX} cy={CY} r={9} fill="#3a2010" />
                                <circle cx={CX} cy={CY} r={4} fill="#fcd765" />
                            </svg>
                        </div>
                    )}

                    {/* Live hint bar */}
                    {stage === "playing" && (
                        <div style={{
                            position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
                            background: "rgba(30,15,4,0.8)", color: "rgba(252,215,101,0.85)",
                            fontSize: 12, padding: "5px 14px", borderRadius: 20,
                            border: "1px solid rgba(252,215,101,0.3)", whiteSpace: "nowrap",
                            pointerEvents: "none", zIndex: 10,
                        }}>
                            Current: {h12}:{mStr} — Target: {targetLabelWithTime}
                        </div>
                    )}

                    {/* Success overlay */}
                    {stage === "success" && (
                        <div className="iqm-scene-success-overlay" style={{ background: "rgba(0,0,0,0.3)" }}>
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">✨🎊✨</div>
                                <div className="iqm-scene-success-text">Sakto!</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="iqm-dialogue-row">
                    <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
                    <div className="iqm-dialogue-bubble">
                        <div className="iqm-dialogue-speaker">{npcName}</div>
                        <div className="iqm-dialogue-text">
                            <span className="iqm-dialogue-bisaya">{dialogueText.bisayaText}</span>
                            <span className="iqm-dialogue-english">{dialogueText.englishText}</span>
                        </div>
                        {stage === "intro" && <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>}
                        {stage === "success" && <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdjustClockGame;
