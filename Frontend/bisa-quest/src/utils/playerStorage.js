// utils/playerStorage.js
// Centralized localStorage management for BisaQuest player data

const KEYS = {
    PLAYER_ID:   'bisaquest_player_id',
    NICKNAME:    'bisaquest_nickname',
    CHARACTER:   'bisaquest_character',
    PROGRESS:    'bisaquest_progress',
    PREFERENCES: 'bisaquest_preferences'
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

// ─── Get ─────────────────────────────────────────────────────────────────────

export const getPlayerId = () => localStorage.getItem(KEYS.PLAYER_ID);

export const getNickname = () => localStorage.getItem(KEYS.NICKNAME);

export const getCharacter = () => localStorage.getItem(KEYS.CHARACTER);

export const getProgress = () => {
    const raw = localStorage.getItem(KEYS.PROGRESS);
    return raw ? JSON.parse(raw) : {};
};

export const getPreferences = () => {
    const raw = localStorage.getItem(KEYS.PREFERENCES);
    return raw ? JSON.parse(raw) : {};
};

// ─── Check ───────────────────────────────────────────────────────────────────

/**
 * Returns true if a player profile exists in localStorage (UC-1.2)
 */
export const hasExistingPlayer = () => {
    return !!localStorage.getItem(KEYS.PLAYER_ID);
};

/**
 * Returns the full saved player profile or null
 */
export const getSavedPlayer = () => {
    const player_id = getPlayerId();
    if (!player_id) return null;

    return {
        player_id,
        nickname:     getNickname(),
        character:    getCharacter(),
        progress:     getProgress(),
        preferences:  getPreferences()
    };
};

// ─── Clear ───────────────────────────────────────────────────────────────────

/**
 * Clears ALL BisaQuest data from localStorage (UC-1.2 New Game)
 */
export const clearPlayerData = () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
};