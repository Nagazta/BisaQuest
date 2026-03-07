import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { hasCutsceneSeen, markCutsceneSeen } from "../../utils/playerStorage";
import "./StoryCutscene.css";

// ── Slide images ────────────────────────────────────────────────────────────
import slide1 from "../../assets/images/cutscene/slide_1.png";
import slide2 from "../../assets/images/cutscene/slide_2.png";
import slide3 from "../../assets/images/cutscene/slide_3.png";
import slide4 from "../../assets/images/cutscene/slide_4.png";

// ── Slide data ──────────────────────────────────────────────────────────────
const SLIDES = [
    {
        image: slide1,
        text: "Long ago, in the vibrant islands of the Visayas, the people spoke a language rich with wisdom and beauty — Bisaya.",
    },
    {
        image: slide2,
        text: "But as time passed, the younger generations began to forget the old words. An ancient book of knowledge was scattered across the land…",
    },
    {
        image: slide3,
        text: "Three mystical realms hold the lost knowledge — the Village, the enchanted Forest, and the mighty Castle. Each one guards a piece of the language.",
    },
    {
        image: slide4,
        text: "Now, a new hero rises. That hero is YOU. Embark on your quest, learn the words, and restore the language of your ancestors!",
    },
];

const StoryCutscene = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [fadeClass, setFadeClass] = useState("fade-in");

    // ── Guard: if cutscene already seen, skip straight to dashboard ──────────
    useEffect(() => {
        if (hasCutsceneSeen()) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    // ── Transition helper ────────────────────────────────────────────────────
    const goToSlide = useCallback(
        (nextIndex) => {
            if (animating || nextIndex === current) return;
            setAnimating(true);
            setFadeClass("fade-out");

            setTimeout(() => {
                setCurrent(nextIndex);
                setFadeClass("fade-in");
                setTimeout(() => setAnimating(false), 600);
            }, 500);
        },
        [animating, current]
    );

    // ── Finish cutscene ──────────────────────────────────────────────────────
    const finishCutscene = useCallback(() => {
        markCutsceneSeen();
        navigate("/dashboard", { replace: true });
    }, [navigate]);

    // ── Keyboard navigation ──────────────────────────────────────────────────
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                if (current < SLIDES.length - 1) goToSlide(current + 1);
                else finishCutscene();
            }
            if (e.key === "ArrowLeft" && current > 0) {
                goToSlide(current - 1);
            }
            if (e.key === "Escape") {
                finishCutscene();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [current, goToSlide, finishCutscene]);

    const isLast = current === SLIDES.length - 1;

    return (
        <div className="cutscene-container">
            {/* Slide counter */}
            <span className="cutscene-slide-counter">
                {current + 1} / {SLIDES.length}
            </span>

            {/* Skip button */}
            <button className="cutscene-skip" onClick={finishCutscene}>
                Skip ▸▸
            </button>

            {/* Image + vignette + caption */}
            <div className="cutscene-slide-wrapper">
                <div className={`cutscene-image-container ${fadeClass}`}>
                    <img
                        className="cutscene-image"
                        src={SLIDES[current].image}
                        alt={`Story slide ${current + 1}`}
                        draggable={false}
                    />
                </div>

                <div className="cutscene-vignette" />

                <div className="cutscene-caption-bar" key={current}>
                    <p className="cutscene-caption-text">
                        {SLIDES[current].text}
                    </p>
                </div>
            </div>

            {/* Bottom controls */}
            <div className="cutscene-controls">
                <button
                    className="cutscene-btn"
                    onClick={() => goToSlide(current - 1)}
                    disabled={current === 0}
                >
                    ← Back
                </button>

                <div className="cutscene-progress">
                    {SLIDES.map((_, i) => (
                        <span
                            key={i}
                            className={`cutscene-dot ${i === current
                                    ? "active"
                                    : i < current
                                        ? "visited"
                                        : ""
                                }`}
                            onClick={() => goToSlide(i)}
                        />
                    ))}
                </div>

                {isLast ? (
                    <button
                        className="cutscene-btn primary"
                        onClick={finishCutscene}
                    >
                        Begin Quest →
                    </button>
                ) : (
                    <button
                        className="cutscene-btn primary"
                        onClick={() => goToSlide(current + 1)}
                    >
                        Next →
                    </button>
                )}
            </div>
        </div>
    );
};

export default StoryCutscene;
