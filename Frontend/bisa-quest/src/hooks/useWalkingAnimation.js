import { useState, useEffect, useRef, useMemo } from "react";
import AssetManifest from "../services/AssetManifest";
import { useAsset } from "./useAsset";

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

    const sprites = useMemo(() => AssetManifest.animation[characterType] || AssetManifest.animation.boy, [characterType]);

    //  Determine direction from keys 
    useEffect(() => {
        if (keysPressed["a"] || keysPressed["ArrowLeft"]) setDirection("left");
        else if (keysPressed["d"] || keysPressed["ArrowRight"]) setDirection("right");
        else if (keysPressed["w"] || keysPressed["s"] || keysPressed["ArrowUp"] || keysPressed["ArrowDown"]) setDirection("down");
        // If nothing pressed, keep last direction (idle pose)
    }, [keysPressed]);

    //  Animate frames while moving 
    const isMoving = keysPressed["w"] || keysPressed["a"] || keysPressed["s"] || keysPressed["d"]
        || keysPressed["ArrowUp"] || keysPressed["ArrowLeft"] || keysPressed["ArrowDown"] || keysPressed["ArrowRight"];

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

    const currentSpriteUrl = sprites[direction][frame];

    // Load the current sprite through AssetManager
    const { src: loadedSpriteSrc } = useAsset(currentSpriteUrl);

    return loadedSpriteSrc;
};

export default useWalkingAnimation;
