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