// ─────────────────────────────────────────────────────────────────────────────
//  FanSpeedGame.jsx — Choose the correct fan speed based on instruction
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { ITEM_IMAGE_MAP } from "../../dragDropConstants";
import { buildQuestDialogue } from "../questHelpers";

const SPEED_OPTIONS = [
    { value: 0, label: "OFF", bisaya: "Patay" },
    { value: 1, label: "1 - Low", bisaya: "1 - Hinay" },
    { value: 2, label: "2 - Medium", bisaya: "2 - Tunga" },
    { value: 3, label: "3 - High", bisaya: "3 - Kusog" },
];

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

    const fanImg = ITEM_IMAGE_MAP["Bentilador"] || null;

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
            setTimeout(() => { setStage("playing"); setSelectedSpeed(null); }, 800);
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

                    {/* Fan display */}
                    <div style={{
                        width: "150px", height: "150px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative",
                    }}>
                        {fanImg
                            ? <img src={fanImg} alt="Fan" style={{
                                width: "100%", height: "100%", objectFit: "contain",
                                animation: currentTarget > 0 ? `spin ${fanSpeed} linear infinite` : "none",
                            }} draggable={false} />
                            : <span style={{
                                fontSize: "80px",
                                animation: currentTarget > 0 ? `spin ${fanSpeed} linear infinite` : "none",
                                display: "inline-block",
                            }}>🌀</span>
                        }
                    </div>

                    {/* Speed label */}
                    <div style={{
                        fontSize: "16px", fontWeight: "bold", color: "#333",
                        background: "rgba(255,255,255,0.8)", padding: "6px 16px", borderRadius: "8px",
                    }}>
                        {currentTarget != null ? SPEED_OPTIONS.find(s => s.value === currentTarget)?.label || "OFF" : "—"}
                    </div>

                    {/* Speed buttons */}
                    {stage === "playing" && (
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                            {SPEED_OPTIONS.map(opt => (
                                <button key={opt.value}
                                    onClick={() => handleSpeedClick(opt.value)}
                                    style={{
                                        padding: "12px 20px", fontSize: "16px", fontWeight: "bold",
                                        border: "2px solid #555", borderRadius: "10px", cursor: "pointer",
                                        background: selectedSpeed === opt.value
                                            ? (stage === "wrong" ? "#ef5350" : "#66bb6a") : "#fff",
                                        color: selectedSpeed === opt.value ? "#fff" : "#333",
                                        transition: "all 0.2s",
                                        minWidth: "80px",
                                    }}>
                                    {opt.bisaya}
                                </button>
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
                </div>

                {/* Add a spin keyframe inline */}
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

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

export default FanSpeedGame;
