// services/playerService.js
// Replaces autoUserService.js — all API calls use /api/player and player_id

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

// ── Progress ──────────────────────────────────────────────────────────────────

export const updateProgress = async (playerId, progress_data) => {
    const response = await fetch(`${BASE_URL}/api/player/${playerId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress_data })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to update progress');
    return result.data;
};

export const getProgress = async (playerId) => {
    const response = await fetch(`${BASE_URL}/api/player/${playerId}/progress`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to get progress');
    return result.data;
};

export const getStats = async (playerId) => {
    const response = await fetch(`${BASE_URL}/api/player/${playerId}/stats`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to get stats');
    return result.data;
};

export const resetProgress = async (playerId) => {
    const response = await fetch(`${BASE_URL}/api/player/${playerId}/reset`, {
        method: 'DELETE'
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to reset progress');
    return result.data;
};