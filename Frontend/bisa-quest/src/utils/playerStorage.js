// utils/playerStorage.js
// Centralized localStorage management for BisaQuest player data

const KEYS = {
    PLAYER_ID:          'bisaquest_player_id',
    NICKNAME:           'bisaquest_nickname',
    CHARACTER:          'bisaquest_character',
    PROGRESS:           'bisaquest_progress',
    PREFERENCES:        'bisaquest_preferences',
    UNLOCKS:            'bisaquest_unlocks',
    CUTSCENE_SEEN:      'bisaquest_cutscene_seen',
    CUTSCENES:          'bisaquest_cutscenes',
    LIBRO_PAGES:        'bisaquest_libro_pages',
    COMPLETE_DISMISSED: 'bisaquest_complete_dismissed',
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
 * @param {string}   environment  'village' | 'forest' | 'castle'
 * @param {string}   npcId        e.g. 'village_npc_1'
 * @param {number}   score        items/words answered correctly
 * @param {boolean}  passed       whether the challenge counts as complete
 * @param {number}   npcCount     total NPCs in this environment (default 3)
 * @param {string[]} words        vocabulary words learned in this quest
 */
export const saveNPCProgress = (environment, npcId, score, passed, npcCount = 3, words = []) => {
    const progress = getProgress();
    const npcKey   = `${environment}_npcs`;
    const prev     = progress[npcKey]?.[npcId] || {
        completed:  false,
        score:      0,
        encounters: 0,
        words:      [],
    };

    progress[npcKey] = {
        ...progress[npcKey],
        [npcId]: {
            completed:  passed || prev.completed,
            score:      Math.max(score, prev.score),
            encounters: prev.encounters + 1,
            words:      passed
                ? [...new Set([...(prev.words || []), ...words])]
                : (prev.words || []),
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

export const hasCutsceneSeen = (key) => {
    if (!key) {
        return localStorage.getItem(KEYS.CUTSCENE_SEEN) === 'true';
    }
    const raw  = localStorage.getItem(KEYS.CUTSCENES);
    const seen = raw ? JSON.parse(raw) : {};
    return !!seen[key];
};

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

// ─── Environment complete dismissed helpers ───────────────────────────────────

/**
 * Mark the completion modal for an environment as permanently dismissed.
 * Once dismissed, it will never auto-show again even if progress = 100%.
 * @param {string} environment  'village' | 'forest' | 'castle'
 */
export const markCompleteDismissed = (environment) => {
    const raw  = localStorage.getItem(KEYS.COMPLETE_DISMISSED);
    const data = raw ? JSON.parse(raw) : {};
    data[environment] = true;
    localStorage.setItem(KEYS.COMPLETE_DISMISSED, JSON.stringify(data));
};

/**
 * Returns true if the completion modal was already dismissed for this environment.
 * @param {string} environment  'village' | 'forest' | 'castle'
 */
export const isCompleteDismissed = (environment) => {
    const raw  = localStorage.getItem(KEYS.COMPLETE_DISMISSED);
    const data = raw ? JSON.parse(raw) : {};
    return !!data[environment];
};

// ─── Libro page collectible helpers ──────────────────────────────────────────

export const awardLibroPage = (environment, npcId) => {
    const pages = getLibroPages();
    if (!pages[environment]) pages[environment] = [];
    if (pages[environment].includes(npcId)) return false;
    pages[environment].push(npcId);
    localStorage.setItem(KEYS.LIBRO_PAGES, JSON.stringify(pages));
    return true;
};

export const getLibroPages = () => {
    const raw = localStorage.getItem(KEYS.LIBRO_PAGES);
    return raw ? JSON.parse(raw) : {};
};

export const getLibroPageCount = () => {
    const pages = getLibroPages();
    return Object.values(pages).reduce((total, arr) => total + arr.length, 0);
};

export const getLibroPageCountForEnv = (environment) => {
    return (getLibroPages()[environment] || []).length;
};

export const hasLibroPage = (environment, npcId) => {
    return (getLibroPages()[environment] || []).includes(npcId);
};

// ─── Word summary helper ──────────────────────────────────────────────────────

/**
 * getLearnedWords
 * Returns words actually learned (stored in progress) for completed NPCs.
 * Falls back to npcMeta words if no stored words found.
 *
 * @param {string} environment   'village' | 'forest' | 'castle'
 * @param {Array}  npcMeta       [{ npcId, npcName, words }]
 * @returns {Array}  [{ npcName, words }]  — only for completed NPCs
 */
export const getLearnedWords = (environment, npcMeta = []) => {
    const progress = getProgress();
    const npcKey   = `${environment}_npcs`;
    const npcData  = progress[npcKey] || {};

    return npcMeta
        .filter(n => npcData[n.npcId]?.completed)
        .map(n => ({
            npcName: n.npcName,
            words: npcData[n.npcId]?.words?.length
                ? npcData[n.npcId].words
                : n.words,
        }));
};

// ─── Clear ───────────────────────────────────────────────────────────────────

export const clearPlayerData = () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
};