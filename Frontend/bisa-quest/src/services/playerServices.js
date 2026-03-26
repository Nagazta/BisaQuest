
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

// ── UC-1.1 ────────────────────────────────────────────────────────────────────

export const createPlayer = async (nickname = 'Guest Player') => {
    const response = await fetch(`${BASE_URL}/api/player/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to create player');
    return result.data;
};

// ── UC-1.2 ────────────────────────────────────────────────────────────────────

export const fetchPlayer = async (playerId) => {
    const response = await fetch(`${BASE_URL}/api/player/${playerId}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Player not found');
    return result.data;
};

// ── UC-1.3 ────────────────────────────────────────────────────────────────────

export const updateCharacter = async (playerId, character) => {
    const response = await fetch(`${BASE_URL}/api/player/${playerId}/character`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to update character');
    return result.data;
};

export const submitChallenge = async (playerId, questId, npcId, score, maxScore, passed) => {
    const response = await fetch(`${BASE_URL}/api/challenge/quest/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, questId, npcId, score, maxScore, passed })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to submit challenge');
    return result.data;
};