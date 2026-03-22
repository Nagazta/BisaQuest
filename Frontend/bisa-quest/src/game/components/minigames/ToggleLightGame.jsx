import React, { useState } from "react";
import AssetManifest from "../../../services/AssetManifest";
import { buildQuestDialogue } from "../questHelpers";

const ToggleLightGame = ({ quest, npcName, npcImage, onComplete, onClose, item }) => {
    const dialogue = buildQuestDialogue(quest, item);
    const [introStep, setIntroStep] = useState(0);
    const [stage, setStage] = useState("intro"); // intro | playing | success
    const [isOn, setIsOn] = useState(false);
    const [toggleCount, setToggleCount] = useState(0);

    const handleIntroNext = () => {
        if (introStep < dialogue.length - 1) setIntroStep(prev => prev + 1);
        else setStage("playing");
    };

    const handleToggle = () => {
        if (stage !== "playing") return;
        setIsOn(!isOn);
        setToggleCount(prev => prev + 1);
        
        // Complete after a few toggles or just one
        if (toggleCount >= 1) {
            setTimeout(() => setStage("success"), 600);
        }
    };

    const getDialogueText = () => {
        if (stage === "intro") return dialogue[introStep];
        if (stage === "success") return { 
            bisayaText: "Maayo kaayo! Nasulayan na nimo ang suga! 💡", 
            englishText: "Great! You've tested the light! 💡" 
        };
        return { 
            bisayaText: "I-click ang suga aron mo-on o mo-off!", 
            englishText: "Click the light to turn it on or off!" 
        };
    };

    const dialogueText = getDialogueText();

    return (
        <div className="iqm-overlay">
            <div className="iqm-modal iqm-modal--scene">
                <button className="iqm-close" onClick={onClose}>✕</button>
                <div className="iqm-header">
                    <div className="iqm-header-bisaya">{item.labelBisaya}</div>
                    <div className="iqm-header-english">{item.labelEnglish}</div>
                </div>

                <div className="iqm-scene-canvas" 
                    style={{ 
                        background: isOn ? "#fef9e7" : "#1a1a2e",
                        transition: "background 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                    
                    {/* Ceiling Light Image */}
                    <div 
                        onClick={handleToggle}
                        style={{
                            cursor: stage === "playing" ? "pointer" : "default",
                            width: "100%",
                            height: "100%",
                            transition: "transform 0.2s",
                            transform: stage === "playing" ? "scale(1)" : "scale(0.98)",
                            zIndex: 10
                        }}>
                        <img 
                            src={isOn ? AssetManifest.village.scenarios.sugaOn : AssetManifest.village.scenarios.sugaOff} 
                            alt="Ceiling Light"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                filter: isOn ? "brightness(1.1) contrast(1.1)" : "brightness(0.7)",
                                transition: "filter 0.3s ease"
                            }}
                            draggable={false}
                        />
                    </div>

                    {/* Light Glow Effect */}
                    {isOn && (
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "radial-gradient(circle, rgba(252, 215, 101, 0.2) 0%, transparent 70%)",
                            pointerEvents: "none",
                            zIndex: 1
                        }} />
                    )}

                    {/* Success Overlay */}
                    {stage === "success" && (
                        <div className="iqm-scene-success-overlay">
                            <div className="iqm-scene-success-card">
                                <div className="iqm-scene-success-stars">💡💡💡</div>
                                <div className="iqm-scene-success-text">Nahuman na ang Page-test!</div>
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

export default ToggleLightGame;
