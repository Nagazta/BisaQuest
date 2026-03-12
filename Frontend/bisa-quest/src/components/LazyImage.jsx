// components/LazyImage.jsx
// Drop-in replacement for <img> tags that supports lazy loading via AssetManager

import React, { useState } from "react";
import { useAsset } from "../hooks/useAsset";
import "./LazyImage.css";

/**
 * A drop-in replacement for standard <img> tags.
 * Uses AssetManager to prevent redundant loading and provides a smooth fade-in.
 *
 * @param {Object} props
 * @param {string} props.src - The image URL (Vite resolved)
 * @param {string} props.alt - Alternate text
 * @param {string} props.className - CSS class names
 * @param {boolean} props.showShimmer - Whether to show a shimmer effect while loading (default: true)
 */
const LazyImage = ({ src, alt = "", className = "", showShimmer = true, style = {}, ...props }) => {
    const { src: loadedSrc, loaded, error } = useAsset(src);
    const [imgLoaded, setImgLoaded] = useState(false);

    // We consider it "fully loaded" when both the AssetManager has the src AND the <img> tag has rendered it
    const isFullyLoaded = loaded && imgLoaded;
    const isError = error !== null;

    return (
        <div 
            className={`lazy-image-wrapper ${className} ${!isFullyLoaded && showShimmer ? 'shimmer' : ''} ${isError ? 'error' : ''}`}
            style={style}
        >
            {/* Show fallback if error */}
            {isError && <div className="lazy-image-error">⚠️</div>}
            
            {/* The actual image */}
            <img
                src={loadedSrc}
                alt={alt}
                className={`lazy-image-content ${isFullyLoaded ? 'loaded' : ''}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(true)} // Don't hang on error
                draggable={false}
                {...props}
            />
        </div>
    );
};

export default LazyImage;
