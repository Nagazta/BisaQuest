// context/ResourceLoaderContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const ResourceLoaderContext = createContext(null);

export const useResourceLoader = () => {
    const ctx = useContext(ResourceLoaderContext);
    if (!ctx) throw new Error("useResourceLoader must be used inside ResourceLoaderProvider");
    return ctx;
};

export const ResourceLoaderProvider = ({ children }) => {
    const [loaded, setLoaded] = useState(false);

    const markLoaded = useCallback(() => setLoaded(true), []);

    return (
        <ResourceLoaderContext.Provider value={{ loaded, markLoaded }}>
            {children}
        </ResourceLoaderContext.Provider>
    );
};
