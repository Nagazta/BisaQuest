// ─────────────────────────────────────────────────────────────────────────────
//  FanSpeedGame.jsx — Choose the correct fan speed based on instruction
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import AssetManifest from "../../../services/AssetManifest";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import { buildQuestDialogue } from "../questHelpers";
import Button from "../../../components/Button";

const SPEED_OPTIONS = [
    { value: 0, label: "Off", bisaya: "Patay" },
    { value: 1, label: "1 - Low", bisaya: "1 - Hinay" },
    { value: 2, label: "2 - Medium", bisaya: "2 - Tunga" },
    { value: 3, label: "3 - High", bisaya: "3 - Kusog" },
];

const CssFan = ({ speed }) => {
    const rotationSpeed = speed === 3 ? "0.2s" : speed === 2 ? "0.5s" : speed === 1 ? "1s" : "0s";

    return (
        <div className="css-fan">
            <div className="fan-head">
                <div className="fan-cage">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="cage-wire" style={{ transform: `rotate(${i * 30}deg)` }} />
                    ))}
                </div>
                <div className="fan-blades" style={{
                    animation: speed > 0 ? `fan-spin ${rotationSpeed} linear infinite` : 'none'
                }}>
                    <div className="blade blade-1" />
                    <div className="blade blade-2" />
                    <div className="blade blade-3" />
                </div>
                <div className="fan-center" />
            </div>
            <div className="fan-neck" />
            <div className="fan-base" />
        </div>
    );
};

const FanSpeedGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);

    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success | wrong
    const [currentRound, setCurrentRound] = useState(0);
    const [selectedSpeed, setSelectedSpeed] = useState(null);

    const rounds = quest.rounds || [
        { target: 3, bisaya: "Pindota ang numero 3 — Kusog!", english: "Press number 3 — High speed!" },
        { target: 1, bisaya: "Pindota ang numero 1 — Hinay!", english: "Press number 1 — Low speed!" },
        { target: 0, bisaya: "Patya ang bentilador!", english: "Turn off the fan!" },
    ];

    // Removed image-based fanImg

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(p => p + 1);
        else setStage("playing");
    };

    const handleSpeedClick = (speed) => {
        if (stage !== "playing") return;
        setSelectedSpeed(speed);
        if (speed === rounds[currentRound].target) {
            const nextRound = currentRound + 1;
            if (nextRound >= rounds.length) {
                setStage("success");
            } else {
                setCurrentRound(nextRound);
                setTimeout(() => setSelectedSpeed(null), 400);
            }
        } else {
            setStage("wrong");
        }
    };

    const getDialogueText = () => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { bisayaText: "Sakto! Maayo ka modumala sa bentilador! 🎉", englishText: "Correct! You're great at controlling the fan! 🎉" };
        if (stage === "wrong") return { bisayaText: "Sayop! Sulayi pag-usab!", englishText: "Wrong! Try again!" };
        const r = rounds[currentRound];
        return { bisayaText: r.bisaya, englishText: r.english };
    };

    const dialogueText = getDialogueText();
    const currentTarget = stage === "playing" ? rounds[currentRound].target : selectedSpeed;

    // Fan animation speed
    const fanSpeed = currentTarget === 3 ? "0.3s" : currentTarget === 2 ? "0.6s" : currentTarget === 1 ? "1.2s" : "0s";

    return (
        <div className="iqm-overlay">
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <div className="iqm-header-bisaya">{item.labelBisaya}</div>
                    <div className="iqm-header-english">{item.labelEnglish}</div>
                </div>

                <div className="iqm-scene-canvas"
                    style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>

                    {/* Fan display (CSS) */}
                    <CssFan speed={currentTarget} />

                    {/* Speed label */}
                    <div style={{
                        fontSize: "16px", fontWeight: "bold", color: "#333",
                        background: "rgba(255,255,255,0.8)", padding: "6px 16px", borderRadius: "8px",
                    }}>
                        {currentTarget != null ? SPEED_OPTIONS.find(s => s.value === currentTarget)?.label || "OFF" : "—"}
                    </div>

                    {/* Speed buttons */}
                    {stage === "playing" && (
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                            {SPEED_OPTIONS.map(opt => (
                                <Button key={opt.value}
                                    onClick={() => handleSpeedClick(opt.value)}
                                    variant={selectedSpeed === opt.value
                                        ? (stage === "wrong" ? "danger" : "primary")
                                        : "secondary"}
                                    style={{
                                        minWidth: "100px",
                                        padding: "8px 16px",
                                    }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                                        <div style={{ fontSize: "16px" }}>{opt.bisaya}</div>
                                        <div style={{ fontSize: "12px", opacity: 0.8, fontWeight: "normal" }}>{opt.label}</div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Progress */}
                    {stage === "playing" && (
                        <div className="iqm-sweep-progress">
                            {rounds.map((_, i) => (
                                <div key={i} className={`iqm-sweep-pip ${i < currentRound ? "iqm-sweep-pip--done" : ""}`} />
                            ))}
                        </div>
                    )}

                    {/* Success */}
                    {stage === "success" && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">🌀✅🌀</div>
                                <div className="iqm-scene-success-text">Maayo!</div>
                            </div>
                        </div>
                    )}

                    {/* Wrong */}
                    {stage === "wrong" && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card" style={{ borderColor: "#ef5350" }}>
                                <div className="iqm-scene-success-stars">❌🌀❌</div>
                                <div className="iqm-scene-success-text" style={{ color: "#ef5350" }}>Sayop!</div>
                                <div style={{ fontSize: "14px", color: "#666" }}>Sulayi pag-usab / Try again</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CSS Fan Styles */}
                <style>{`
                    @keyframes fan-spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    .css-fan {
                        position: relative;
                        width: 160px;
                        height: 220px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: flex-end;
                    }

                    .fan-head {
                        position: relative;
                        width: 150px;
                        height: 150px;
                        border-radius: 50%;
                        background: rgba(200, 200, 200, 0.1);
                        border: 4px solid #555;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2;
                        box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
                    }

                    .fan-cage {
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        border-radius: 50%;
                        pointer-events: none;
                    }

                    .cage-wire {
                        position: absolute;
                        top: 50%; left: 0;
                        width: 100%;
                        height: 1px;
                        background: rgba(85, 85, 85, 0.3);
                    }

                    .fan-blades {
                        position: relative;
                        width: 130px;
                        height: 130px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1;
                    }

                    .blade {
                        position: absolute;
                        width: 40px;
                        height: 60px;
                        background: linear-gradient(to bottom, #777, #444);
                        border-radius: 50% 50% 10% 10%;
                        transform-origin: center 100%;
                        top: 5px;
                    }

                    .blade-1 { transform: rotate(0deg); }
                    .blade-2 { transform: rotate(120deg); }
                    .blade-3 { transform: rotate(240deg); }

                    .fan-center {
                        position: absolute;
                        width: 25px;
                        height: 25px;
                        background: #333;
                        border-radius: 50%;
                        z-index: 3;
                        box-shadow: 0 0 5px rgba(0,0,0,0.5);
                    }

                    .fan-neck {
                        width: 15px;
                        height: 40px;
                        background: #444;
                        margin-top: -5px;
                        z-index: 1;
                    }

                    .fan-base {
                        width: 80px;
                        height: 15px;
                        background: #333;
                        border-radius: 10px 10px 2px 2px;
                        z-index: 1;
                    }
                `}</style>

                <div className="iqm-dialogue-row">
                    <img src={npcImage} alt={npcName} className="iqm-npc-img" draggable={false} />
                    <div className="iqm-dialogue-bubble">
                        <div className="iqm-dialogue-speaker">{npcName}</div>
                        <div className="iqm-dialogue-text">
                            <span className="iqm-dialogue-bisaya">{dialogueText.bisayaText}</span>
                            <span className="iqm-dialogue-english">{dialogueText.englishText}</span>
                        </div>
                        {stage === "intro" && <button className="iqm-next-btn" onClick={handleIntroNext}>▶</button>}
                        {stage === "wrong" && (
                            <button
                                className="iqm-next-btn"
                                style={{ background: "#ef5350", boxShadow: "0 3px 0 #991b1b", marginTop: "-60px" }}
                                onClick={() => { setStage("playing"); setSelectedSpeed(null); }}
                                title="Play Again"
                            >
                                ↺
                            </button>
                        )}
                        {stage === "success" && <button className="iqm-next-btn" onClick={() => onComplete(item)}>✓</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FanSpeedGame;
