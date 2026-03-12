// hooks/useAsset.js
// React hook for lazy-loading a single image via AssetManager

import { useState, useEffect } from "react";
import AssetManager from "../services/AssetManager";

// 1×1 transparent PNG data URI (placeholder while loading)
const PLACEHOLDER =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

/**
 * Lazy-load a single image through the AssetManager cache.
 *
 * @param {string} src  — Vite-resolved image URL (from import or AssetManifest)
 * @returns {{ src: string, loaded: boolean, error: string|null }}
 */
export const useAsset = (src) => {
    const [state, setState] = useState(() => {
        // If already cached, return immediately (no flash)
        const manager = AssetManager.getInstance();
        if (manager.has(src)) {
            return { src: manager.getSrc(src), loaded: true, error: null };
        }
        return { src: PLACEHOLDER, loaded: false, error: null };
    });

    useEffect(() => {
        if (!src) return;

        const manager = AssetManager.getInstance();

        // Already cached — sync return
        if (manager.has(src)) {
            setState({ src: manager.getSrc(src), loaded: true, error: null });
            return;
        }

        let cancelled = false;

        manager
            .load(src)
            .then((img) => {
                if (!cancelled) {
                    setState({ src: img.src, loaded: true, error: null });
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    // Fallback: use original URL directly
                    setState({ src, loaded: true, error: err.message });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [src]);

    return state;
};

export default useAsset;
