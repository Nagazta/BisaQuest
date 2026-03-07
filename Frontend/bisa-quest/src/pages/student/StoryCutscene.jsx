// src/pages/student/StoryCutscene.jsx
// Generic cutscene player — reads type from URL param /cutscene/:type
// All slide data lives in src/data/cutsceneData.js

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { hasCutsceneSeen, markCutsceneSeen } from "../../utils/playerStorage";
import { CUTSCENES } from "./data/cutsceneData";
import "./StoryCutscene.css";

const StoryCutscene = ({ type: typeProp }) => {
    const navigate          = useNavigate();
    const { type: urlType } = useParams();   // from /cutscene/:type — undefined on /student/cutscene
    const type              = typeProp || urlType || "story";
    const cutscene          = CUTSCENES[type] ?? CUTSCENES.story;  // safe fallback

    const { slides, key: cutsceneKey, destination, finalLabel } = cutscene;

    const [current,   setCurrent]   = useState(0);
    const [animating, setAnimating] = useState(false);
    const [fadeClass, setFadeClass] = useState("fade-in");

    // ── Guard: skip if already seen ──────────────────────────────────────────
    useEffect(() => {
        if (hasCutsceneSeen(cutsceneKey)) {
            navigate(destination, { replace: true });
        }
    }, [navigate, cutsceneKey, destination]);

    // ── Slide transition ─────────────────────────────────────────────────────
    const goToSlide = useCallback((nextIndex) => {
        if (animating || nextIndex === current) return;
        setAnimating(true);
        setFadeClass("fade-out");
        setTimeout(() => {
            setCurrent(nextIndex);
            setFadeClass("fade-in");
            setTimeout(() => setAnimating(false), 600);
        }, 500);
    }, [animating, current]);

    // ── Finish — mark seen, navigate directly (fog already played before entry) ──
    const finish = useCallback(() => {
        markCutsceneSeen(cutsceneKey);
        navigate(destination, { replace: true });
    }, [navigate, cutsceneKey, destination]);

    // ── Keyboard navigation ──────────────────────────────────────────────────
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                if (current < slides.length - 1) goToSlide(current + 1);
                else finish();
            }
            if (e.key === "ArrowLeft" && current > 0) goToSlide(current - 1);
            if (e.key === "Escape") finish();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [current, goToSlide, finish, slides.length]);

    const slide  = slides[current];
    const isLast = current === slides.length - 1;

    return (
        <div className="cutscene-container">
            <span className="cutscene-slide-counter">{current + 1} / {slides.length}</span>
            <button className="cutscene-skip" onClick={finish}>Skip ▸▸</button>

            <div className="cutscene-slide-wrapper">
                <div
                    className={`cutscene-image-container ${fadeClass}`}
                    style={!slide.image ? { background: slide.bg || "#1a1a1a" } : undefined}
                >
                    {slide.image
                        ? <img className="cutscene-image" src={slide.image} alt={`Slide ${current + 1}`} draggable={false} />
                        : <div className="cutscene-placeholder-art">
                            <span style={{ fontSize: "80px" }}>{slide.emoji || "✨"}</span>
                          </div>
                    }
                </div>

                <div className="cutscene-vignette" />

                <div className="cutscene-caption-bar" key={current}>
                    {slide.speaker && (
                        <p className="cutscene-speaker">{slide.speaker}</p>
                    )}
                    <p className="cutscene-caption-text">{slide.text}</p>
                </div>
            </div>

            <div className="cutscene-controls">
                <button className="cutscene-btn" onClick={() => goToSlide(current - 1)} disabled={current === 0}>
                    ← Back
                </button>
                <div className="cutscene-progress">
                    {slides.map((_, i) => (
                        <span
                            key={i}
                            className={`cutscene-dot ${i === current ? "active" : i < current ? "visited" : ""}`}
                            onClick={() => goToSlide(i)}
                        />
                    ))}
                </div>
                <button className="cutscene-btn primary" onClick={isLast ? finish : () => goToSlide(current + 1)}>
                    {isLast ? finalLabel : "Next →"}
                </button>
            </div>
        </div>
    );
};

export default StoryCutscene;