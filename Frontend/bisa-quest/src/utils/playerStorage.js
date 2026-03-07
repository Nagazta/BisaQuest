// utils/playerStorage.js
// Centralized localStorage management for BisaQuest player data

const KEYS = {
    PLAYER_ID:      'bisaquest_player_id',
    NICKNAME:       'bisaquest_nickname',
    CHARACTER:      'bisaquest_character',
    PROGRESS:       'bisaquest_progress',
    PREFERENCES:    'bisaquest_preferences',
    UNLOCKS:        'bisaquest_unlocks',        // environment unlock flags
    CUTSCENE_SEEN:  'bisaquest_cutscene_seen',  // legacy global story intro flag
    CUTSCENES:      'bisaquest_cutscenes',      // named per-cutscene flags
    LIBRO_PAGES:    'bisaquest_libro_pages',    // collected book page fragments
};

// ─── Save ────────────────────────────────────────────────────────────────────

export const savePlayer = ({ player_id, nickname }) => {
    localStorage.setItem(KEYS.PLAYER_ID, player_id);
    localStorage.setItem(KEYS.NICKNAME,   nickname);
};

export const saveCharacter = (character) => {
    localStorage.setItem(KEYS.CHARACTER, character);
};

export const saveProgress = (progress_data) => {
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress_data));
};

export const savePreferences = (preferences) => {
    localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(preferences));
};

/**
 * saveNPCProgress
 * Called immediately after any challenge completes.
 * Also auto-unlocks the NEXT environment when this one hits 100%.
 *
 *   village 100% → unlocks forest
 *   forest  100% → unlocks castle
 *
 * NOTE: Libro page awarding is intentionally NOT done here.
 * Each quest page (HousePage, MarketStallPage, FarmPage) calls
 * awardLibroPage() manually after this function so it can show
 * the BookCollectModal before navigating away.
 *
 * @param {string}  environment  'village' | 'forest' | 'castle'
 * @param {string}  npcId        e.g. 'village_npc_1'
 * @param {number}  score        items/words answered correctly
 * @param {boolean} passed       whether the challenge counts as complete
 * @param {number}  npcCount     total NPCs in this environment (default 3)
 */
export const saveNPCProgress = (environment, npcId, score, passed, npcCount = 3) => {
    const progress = getProgress();
    const npcKey   = `${environment}_npcs`;
    const prev     = progress[npcKey]?.[npcId] || {
        completed:  false,
        score:      0,
        encounters: 0,
    };

    progress[npcKey] = {
        ...progress[npcKey],
        [npcId]: {
            completed:  passed || prev.completed,
            score:      Math.max(score, prev.score),
            encounters: prev.encounters + 1,
        },
    };

    const completedCount = Object.values(progress[npcKey])
        .filter(npc => npc.completed).length;
    const pct = Math.round((completedCount / npcCount) * 100);
    progress[`${environment}_progress`] = pct;

    saveProgress(progress);

    // Auto-unlock next environment at 100%
    if (pct >= 100) {
        const NEXT = { village: 'forest', forest: 'castle' };
        const next = NEXT[environment];
        if (next) saveEnvironmentUnlock(next);
    }
};

// ─── Unlock helpers ──────────────────────────────────────────────────────────

export const saveEnvironmentUnlock = (environment) => {
    const unlocks = getUnlocks();
    unlocks[environment] = true;
    localStorage.setItem(KEYS.UNLOCKS, JSON.stringify(unlocks));
};

export const isEnvironmentUnlocked = (environment) => {
    if (environment === 'village') return true;
    return !!getUnlocks()[environment];
};

export const getUnlocks = () => {
    const raw = localStorage.getItem(KEYS.UNLOCKS);
    return raw ? JSON.parse(raw) : {};
};

// ─── Get ─────────────────────────────────────────────────────────────────────

export const getPlayerId   = () => localStorage.getItem(KEYS.PLAYER_ID);
export const getNickname   = () => localStorage.getItem(KEYS.NICKNAME);
export const getCharacter  = () => localStorage.getItem(KEYS.CHARACTER);

export const getProgress = () => {
    const raw = localStorage.getItem(KEYS.PROGRESS);
    return raw ? JSON.parse(raw) : {};
};

export const getPreferences = () => {
    const raw = localStorage.getItem(KEYS.PREFERENCES);
    return raw ? JSON.parse(raw) : {};
};

// ─── Check ───────────────────────────────────────────────────────────────────

export const hasExistingPlayer = () => !!localStorage.getItem(KEYS.PLAYER_ID);

export const getSavedPlayer = () => {
    const player_id = getPlayerId();
    if (!player_id) return null;
    return {
        player_id,
        nickname:    getNickname(),
        character:   getCharacter(),
        progress:    getProgress(),
        preferences: getPreferences(),
    };
};

// ─── Cutscene helpers ─────────────────────────────────────────────────────────
//
//  Two modes — backward compatible:
//
//  NO KEY  — legacy, used by the original StoryCutscene.jsx
//    hasCutsceneSeen()       reads CUTSCENE_SEEN flag
//    markCutsceneSeen()      writes CUTSCENE_SEEN flag
//
//  NAMED KEY  — used by village/forest/castle entry + complete cutscenes
//    hasCutsceneSeen("village_entry")      reads from CUTSCENES object
//    markCutsceneSeen("village_complete")  writes to  CUTSCENES object
//
//  Named keys in use:
//    "village_entry"    | "village_complete"
//    "forest_entry"     | "forest_complete"
//    "castle_entry"     | "castle_complete"
//
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if a cutscene has already been played.
 * @param {string} [key]  Named key. Omit for the legacy global story flag.
 */
export const hasCutsceneSeen = (key) => {
    if (!key) {
        return localStorage.getItem(KEYS.CUTSCENE_SEEN) === 'true';
    }
    const raw  = localStorage.getItem(KEYS.CUTSCENES);
    const seen = raw ? JSON.parse(raw) : {};
    return !!seen[key];
};

/**
 * Mark a cutscene as seen so it never auto-plays again.
 * @param {string} [key]  Named key. Omit for the legacy global story flag.
 */
export const markCutsceneSeen = (key) => {
    if (!key) {
        localStorage.setItem(KEYS.CUTSCENE_SEEN, 'true');
        return;
    }
    const raw  = localStorage.getItem(KEYS.CUTSCENES);
    const seen = raw ? JSON.parse(raw) : {};
    seen[key]  = true;
    localStorage.setItem(KEYS.CUTSCENES, JSON.stringify(seen));
};


// ─── Libro page collectible helpers ──────────────────────────────────────────
//
//  Each NPC that is completed for the FIRST TIME awards one Libro page.
//  Structure stored in LIBRO_PAGES:
//    {
//      village: ["village_npc_2", "village_npc_3", "village_npc_1"],
//      forest:  [...],
//      castle:  [...],
//    }
//
//  9 pages total — 3 per environment.
//
//  IMPORTANT: awardLibroPage is called manually by each quest page
//  (HousePage, MarketStallPage, FarmPage) — NOT inside saveNPCProgress —
//  so the BookCollectModal can be shown before navigation occurs.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Award a Libro page for completing an NPC for the first time.
 * Called manually by quest pages after saveNPCProgress.
 * @param {string} environment  'village' | 'forest' | 'castle'
 * @param {string} npcId        e.g. 'village_npc_2'
 * @returns {boolean}  true if this was a NEW page (not already collected)
 */
export const awardLibroPage = (environment, npcId) => {
    const pages = getLibroPages();
    if (!pages[environment]) pages[environment] = [];

    // Don't double-award
    if (pages[environment].includes(npcId)) return false;

    pages[environment].push(npcId);
    localStorage.setItem(KEYS.LIBRO_PAGES, JSON.stringify(pages));
    return true;
};

/**
 * Returns all collected Libro pages.
 * @returns {{ village: string[], forest: string[], castle: string[] }}
 */
export const getLibroPages = () => {
    const raw = localStorage.getItem(KEYS.LIBRO_PAGES);
    return raw ? JSON.parse(raw) : {};
};

/**
 * Returns the total number of collected pages across all environments.
 * Max = 9 (3 environments × 3 NPCs each).
 */
export const getLibroPageCount = () => {
    const pages = getLibroPages();
    return Object.values(pages).reduce((total, arr) => total + arr.length, 0);
};

/**
 * Returns how many pages have been collected for a specific environment.
 * @param {string} environment  'village' | 'forest' | 'castle'
 */
export const getLibroPageCountForEnv = (environment) => {
    return (getLibroPages()[environment] || []).length;
};

/**
 * Returns true if a page was already collected for this NPC.
 * Useful to show a "already collected" badge instead of popup.
 * @param {string} environment
 * @param {string} npcId
 */
export const hasLibroPage = (environment, npcId) => {
    return (getLibroPages()[environment] || []).includes(npcId);
};

// ─── Word summary helper ──────────────────────────────────────────────────────

/**
 * getLearnedWords
 * Returns words learned per NPC for a given environment.
 * Used by EnvironmentCompleteModal to display the word summary.
 *
 * @param {string} environment   'village' | 'forest' | 'castle'
 * @param {Array}  npcMeta       [{ npcId: 'village_npc_1', npcName: 'Vicente', words: [...] }]
 * @returns {Array}  [{ npcName, words }]  — only for completed NPCs
 */
export const getLearnedWords = (environment, npcMeta = []) => {
    const progress = getProgress();
    const npcKey   = `${environment}_npcs`;
    const npcData  = progress[npcKey] || {};

    return npcMeta
        .filter(n => npcData[n.npcId]?.completed)
        .map(n => ({ npcName: n.npcName, words: n.words }));
};

// ─── Clear ───────────────────────────────────────────────────────────────────

/**
 * Clears ALL BisaQuest data from localStorage (UC-1.2 New Game).
 * Wipes both the legacy cutscene flag and all named cutscene flags.
 */
export const clearPlayerData = () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
};