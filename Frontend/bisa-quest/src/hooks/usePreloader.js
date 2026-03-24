// Hook for preloading all assets for a specific environment
import { useState, useEffect } from "react";
import AssetManager from "../services/AssetManager";
import { getAssetsForEnvironment } from "../services/AssetManifest";

/**
 * Preloads all assets associated with a specific environment.
 * @param {"village"|"forest"|"castle"} environment
 * @returns {{ progress: number, ready: boolean, total: number }}
 */
export const usePreloader = (environment) => {
    const [progress, setProgress] = useState(0);
    const [ready, setReady] = useState(false);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (!environment) return;

        const urls = getAssetsForEnvironment(environment);
        if (urls.length === 0) {
            setReady(true);
            return;
        }

        setTotal(urls.length);
        setProgress(0);
        setReady(false);

        let cancelled = false;
        const manager = AssetManager.getInstance();

        manager.preloadAll(
            urls,
            4, // max 4 concurrent requests
            (loaded, totalAmount) => {
                if (!cancelled) {
                    // Update progress as a percentage 0-100
                    setProgress(Math.round((loaded / totalAmount) * 100));
                }
            }
        ).then(() => {
            if (!cancelled) {
                setProgress(100);
                setReady(true);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [environment]);

    return { progress, ready, total };
};

export default usePreloader;
