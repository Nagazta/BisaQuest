// hooks/useGlobalPreloader.js
// Preloads ALL game assets using the existing AssetManager singleton.
// Uses getAllAssets() from AssetManifest so there's a single source of truth.

import { useState, useEffect, useRef } from "react";
import AssetManager from "../services/AssetManager";
import { getAllAssets } from "../services/AssetManifest";

/**
 * @returns {{ progress: number, currentAsset: string, done: boolean }}
 */
const useGlobalPreloader = () => {
    const [progress, setProgress]         = useState(0);
    const [currentAsset, setCurrentAsset] = useState("");
    const [done, setDone]                 = useState(false);
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        const urls   = getAllAssets();
        const total  = urls.length;
        const manager = AssetManager.getInstance();

        let loaded = 0;

        manager.preloadAll(
            urls,
            6, // concurrency — 6 parallel loads
            (loadedCount, totalCount) => {
                loaded = loadedCount;
                const url = urls[loadedCount - 1] ?? "";
                setCurrentAsset(url.split("/").pop()); // just the filename
                setProgress(Math.round((loadedCount / totalCount) * 100));
            }
        ).then(() => {
            setProgress(100);
            setDone(true);
        });
    }, []);

    return { progress, currentAsset, done };
};

export default useGlobalPreloader;
