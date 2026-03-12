// hooks/useSpriteSheet.js
// Sprite sheet animation hook — frame-by-frame from a single image

import { useState, useEffect, useRef, useCallback } from "react";
import AssetManager from "../services/AssetManager";

/**
 * Animate frames from a single sprite sheet image.
 *
 * @param {Object} options
 * @param {string} options.src          — URL of the sprite sheet image
 * @param {number} options.frameWidth   — Width of a single frame in px
 * @param {number} options.frameHeight  — Height of a single frame in px
 * @param {number} options.totalFrames  — Total number of frames in the sheet
 * @param {number} [options.columns]    — Frames per row (defaults to totalFrames for a single-row sheet)
 * @param {number} [options.fps=10]     — Frames per second
 * @param {boolean} [options.autoPlay=true] — Start animating immediately
 *
 * @returns {{
 *   frameStyle: Object,      — CSS style for DOM rendering (background-image + position)
 *   currentFrame: number,    — Current frame index (0-based)
 *   loaded: boolean,         — Whether the sprite sheet has loaded
 *   nextFrame: () => void,   — Manually advance to next frame
 *   setFrame: (n) => void,   — Jump to a specific frame
 *   play: () => void,        — Start animation
 *   pause: () => void,       — Pause animation
 *   draw: (ctx, x, y, scale?) => void — Draw current frame to a Canvas context
 * }}
 */
export const useSpriteSheet = ({
    src,
    frameWidth,
    frameHeight,
    totalFrames,
    columns = null,
    fps = 10,
    autoPlay = true,
}) => {
    const cols = columns || totalFrames; // default: single row
    const [currentFrame, setCurrentFrame] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [playing, setPlaying] = useState(autoPlay);
    const [resolvedSrc, setResolvedSrc] = useState(src);
    const intervalRef = useRef(null);
    const imgRef = useRef(null);

    // Load the sprite sheet through AssetManager
    useEffect(() => {
        if (!src) return;
        const manager = AssetManager.getInstance();

        manager
            .load(src)
            .then((img) => {
                imgRef.current = img;
                setResolvedSrc(img.src);
                setLoaded(true);
            })
            .catch(() => {
                // Fallback to direct URL
                setResolvedSrc(src);
                setLoaded(true);
            });
    }, [src]);

    // Animation loop
    useEffect(() => {
        if (!playing || !loaded) return;

        intervalRef.current = setInterval(() => {
            setCurrentFrame((prev) => (prev + 1) % totalFrames);
        }, 1000 / fps);

        return () => clearInterval(intervalRef.current);
    }, [playing, loaded, totalFrames, fps]);

    // ── Manual controls ──────────────────────────────────────────────────────

    const nextFrame = useCallback(() => {
        setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, [totalFrames]);

    const setFrame = useCallback(
        (n) => setCurrentFrame(Math.max(0, Math.min(n, totalFrames - 1))),
        [totalFrames]
    );

    const play = useCallback(() => setPlaying(true), []);
    const pause = useCallback(() => {
        setPlaying(false);
        clearInterval(intervalRef.current);
    }, []);

    // ── CSS style for DOM rendering ──────────────────────────────────────────

    const col = currentFrame % cols;
    const row = Math.floor(currentFrame / cols);

    const frameStyle = {
        width: frameWidth,
        height: frameHeight,
        backgroundImage: `url(${resolvedSrc})`,
        backgroundPosition: `-${col * frameWidth}px -${row * frameHeight}px`,
        backgroundSize: `${cols * frameWidth}px auto`,
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
    };

    // ── Canvas draw function ─────────────────────────────────────────────────

    const draw = useCallback(
        (ctx, x, y, scale = 1) => {
            if (!imgRef.current) return;

            const sx = col * frameWidth;
            const sy = row * frameHeight;

            ctx.drawImage(
                imgRef.current,
                sx,
                sy,
                frameWidth,
                frameHeight,
                x,
                y,
                frameWidth * scale,
                frameHeight * scale
            );
        },
        [currentFrame, frameWidth, frameHeight, cols]
    );

    return {
        frameStyle,
        currentFrame,
        loaded,
        nextFrame,
        setFrame,
        play,
        pause,
        draw,
    };
};

export default useSpriteSheet;
