// Core singleton — in-memory cache, lazy loading, IndexedDB persistent cache

const DB_NAME = "bisaquest_assets";
const DB_VERSION = 1;
const STORE_NAME = "images";

// Bump this to invalidate all cached assets after an update
const ASSET_VERSION = "1.0.0";

class AssetManager {
    /** @type {AssetManager|null} */
    static _instance = null;

    /** @returns {AssetManager} */
    static getInstance() {
        if (!AssetManager._instance) {
            AssetManager._instance = new AssetManager();
        }
        return AssetManager._instance;
    }

    constructor() {
        /** @type {Map<string, HTMLImageElement>} In-memory image cache */
        this._cache = new Map();

        /** @type {Map<string, Promise<HTMLImageElement>>} Pending loads (dedup) */
        this._pending = new Map();

        /** @type {IDBDatabase|null} */
        this._db = null;

        /** @type {Promise<void>|null} */
        this._dbReady = null;

        // Start opening IndexedDB immediately
        this._dbReady = this._openDB();
    }

    // ── IndexedDB setup ──────────────────────────────────────────────────────

    /** @returns {Promise<void>} */
    async _openDB() {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: "url" });
                    }
                };

                request.onsuccess = (e) => {
                    this._db = e.target.result;
                    resolve();
                };

                request.onerror = () => {
                    console.warn("[AssetManager] IndexedDB unavailable, using memory-only cache");
                    resolve(); // Graceful degradation — still works without IDB
                };
            } catch {
                console.warn("[AssetManager] IndexedDB not supported");
                resolve();
            }
        });
    }

    /** Store a blob in IndexedDB */
    async _persistBlob(url, blob) {
        await this._dbReady;
        if (!this._db) return;

        return new Promise((resolve) => {
            try {
                const tx = this._db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                store.put({ url, blob, version: ASSET_VERSION, timestamp: Date.now() });
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve(); // Don't crash on write failure
            } catch {
                resolve();
            }
        });
    }

    /** Retrieve a blob from IndexedDB */
    async _getPersistedBlob(url) {
        await this._dbReady;
        if (!this._db) return null;

        return new Promise((resolve) => {
            try {
                const tx = this._db.transaction(STORE_NAME, "readonly");
                const store = tx.objectStore(STORE_NAME);
                const request = store.get(url);

                request.onsuccess = () => {
                    const record = request.result;
                    // Version mismatch = stale cache
                    if (record && record.version === ASSET_VERSION) {
                        resolve(record.blob);
                    } else {
                        resolve(null);
                    }
                };

                request.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
    }

    // ── Core loading ─────────────────────────────────────────────────────────

    /**
     * Load a single image. Uses in-memory cache first, then IndexedDB,
     * then network. Deduplicates concurrent requests for the same URL.
     *
     * @param {string} url  — Vite-resolved URL (from static import or AssetManifest)
     * @returns {Promise<HTMLImageElement>}
     */
    load(url) {
        // 1. In-memory cache hit
        if (this._cache.has(url)) {
            return Promise.resolve(this._cache.get(url));
        }

        // 2. Already loading — deduplicate
        if (this._pending.has(url)) {
            return this._pending.get(url);
        }

        // 3. Start a new load
        const promise = this._loadFromSource(url);
        this._pending.set(url, promise);

        promise.finally(() => {
            this._pending.delete(url);
        });

        return promise;
    }

    /** @private */
    async _loadFromSource(url) {
        // Try IndexedDB first
        const persistedBlob = await this._getPersistedBlob(url);
        if (persistedBlob) {
            const objectUrl = URL.createObjectURL(persistedBlob);
            const img = await this._createImage(objectUrl);
            this._cache.set(url, img);
            return img;
        }

        // Network fetch
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            // Persist for next session (fire-and-forget)
            this._persistBlob(url, blob).catch(() => { });

            const objectUrl = URL.createObjectURL(blob);
            const img = await this._createImage(objectUrl);
            this._cache.set(url, img);
            return img;
        } catch (err) {
            // Fallback: use Image() directly with the URL
            console.warn(`[AssetManager] Fetch failed for ${url}, using direct load`);
            const img = await this._createImage(url);
            this._cache.set(url, img);
            return img;
        }
    }

    /** Create an HTMLImageElement from a source */
    _createImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    // ── Batch operations ─────────────────────────────────────────────────────

    /**
     * Preload multiple assets in parallel with a concurrency limit.
     *
     * @param {string[]} urls        — Array of URLs to preload
     * @param {number}   concurrency — Max parallel loads (default: 4)
     * @param {function} onProgress  — Callback(loaded, total) for progress updates
     * @returns {Promise<HTMLImageElement[]>}
     */
    async preloadAll(urls, concurrency = 4, onProgress = null) {
        const results = [];
        let loaded = 0;
        const total = urls.length;

        // Process in batches
        for (let i = 0; i < total; i += concurrency) {
            const batch = urls.slice(i, i + concurrency);
            const batchResults = await Promise.allSettled(
                batch.map((url) => this.load(url))
            );

            batchResults.forEach((result) => {
                loaded++;
                results.push(result.status === "fulfilled" ? result.value : null);
                if (onProgress) onProgress(loaded, total);
            });
        }

        return results;
    }

    // ── Utilities ────────────────────────────────────────────────────────────

    /**
     * Check if an asset is already cached in memory.
     * @param {string} url
     * @returns {boolean}
     */
    has(url) {
        return this._cache.has(url);
    }

    /**
     * Get a cached image synchronously (returns null if not loaded yet).
     * @param {string} url
     * @returns {HTMLImageElement|null}
     */
    get(url) {
        return this._cache.get(url) || null;
    }

    /**
     * Get the resolved src URL for a cached image.
     * Useful for React <img> tags — returns the URL string, not the element.
     * @param {string} url — original Vite URL
     * @returns {string} — the src (objectURL or original)
     */
    getSrc(url) {
        const img = this._cache.get(url);
        return img ? img.src : url;
    }

    /**
     * Clear the in-memory cache (IndexedDB cache persists).
     */
    clearMemory() {
        this._cache.clear();
    }

    /**
     * Clear everything — memory + IndexedDB.
     */
    async clearAll() {
        this._cache.clear();
        await this._dbReady;
        if (!this._db) return;

        return new Promise((resolve) => {
            try {
                const tx = this._db.transaction(STORE_NAME, "readwrite");
                tx.objectStore(STORE_NAME).clear();
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch {
                resolve();
            }
        });
    }

    /**
     * Get cache statistics for debugging.
     * @returns {{ memoryCount: number, memoryUrls: string[] }}
     */
    getStats() {
        return {
            memoryCount: this._cache.size,
            memoryUrls: [...this._cache.keys()],
        };
    }
}

export default AssetManager;
