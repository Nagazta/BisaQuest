// hooks/useWalkingAnimation.js
// Sprite-based walking animation hook for WASD movement

import { useState, useEffect, useRef, useMemo } from "react";

// ── Boy sprites ──────────────────────────────────────────────────────────────
import boyDown1 from "../assets/animation/boy_down_1.png";
import boyDown2 from "../assets/animation/boy_down_2.png";
import boyLeft1 from "../assets/animation/boy_left_1.png";
import boyLeft2 from "../assets/animation/boy_left_2.png";
import boyRight1 from "../assets/animation/boy_right_1.png";
import boyRight2 from "../assets/animation/boy_right_2.png";

// ── Girl sprites ─────────────────────────────────────────────────────────────
import girlDown1 from "../assets/animation/girl_down_1.png";
import girlDown2 from "../assets/animation/girl_down_2.png";
import girlLeft1 from "../assets/animation/girl_left_1.png";
import girlLeft2 from "../assets/animation/girl_left_2.png";
import girlRight1 from "../assets/animation/girl_right_1.png";
import girlRight2 from "../assets/animation/girl_right_2.png";

const SPRITES = {
    boy: {
        down: [boyDown1, boyDown2],
        left: [boyLeft1, boyLeft2],
        right: [boyRight1, boyRight2],
    },
    girl: {
        down: [girlDown1, girlDown2],
        left: [girlLeft1, girlLeft2],
        right: [girlRight1, girlRight2],
    },
};

const FRAME_INTERVAL = 200; // ms between frame toggles

/**
 * Returns the current walking sprite based on character type and pressed keys.
 *
 * @param {"boy"|"girl"} characterType
 * @param {Object}       keysPressed   – { w: bool, a: bool, s: bool, d: bool }
 * @returns {string}     The import path of the current sprite image
 */
export const useWalkingAnimation = (characterType = "boy", keysPressed = {}) => {
    const [frame, setFrame] = useState(0);            // 0 or 1
    const [direction, setDirection] = useState("down"); // "down" | "left" | "right"
    const intervalRef = useRef(null);

    const sprites = useMemo(() => SPRITES[characterType] || SPRITES.boy, [characterType]);

    // ── Determine direction from keys ────────────────────────────────────────
    useEffect(() => {
        if (keysPressed["a"]) setDirection("left");
        else if (keysPressed["d"]) setDirection("right");
        else if (keysPressed["w"] || keysPressed["s"]) setDirection("down");
        // If nothing pressed, keep last direction (idle pose)
    }, [keysPressed]);

    // ── Animate frames while moving ──────────────────────────────────────────
    const isMoving = keysPressed["w"] || keysPressed["a"] || keysPressed["s"] || keysPressed["d"];

    useEffect(() => {
        if (isMoving) {
            // Start cycling frames
            intervalRef.current = setInterval(() => {
                setFrame((prev) => (prev === 0 ? 1 : 0));
            }, FRAME_INTERVAL);
        } else {
            // Stop on frame 0 (idle pose)
            clearInterval(intervalRef.current);
            setFrame(0);
        }
        return () => clearInterval(intervalRef.current);
    }, [isMoving]);

    return sprites[direction][frame];
};

export default useWalkingAnimation;
