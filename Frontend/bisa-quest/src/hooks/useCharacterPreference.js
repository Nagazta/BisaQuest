// hooks/useCharacterPreference.js
// Updated to use bisaquest_player_id and /api/player/:playerId/character

import { useState, useEffect } from 'react';
import { updateCharacter as updateCharacterAPI } from '../services/playerServices';
import { getPlayerId, getCharacter, saveCharacter } from '../utils/playerStorage';

/**
 * Hook to manage a player's character selection
 * Reads from localStorage first, falls back to DB
 */
export const useCharacterPreference = () => {
    const [character, setCharacterState] = useState('male');
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                // Check localStorage first (faster)
                const cached = getCharacter(); // reads bisaquest_character
                if (cached) {
                    setCharacterState(cached);
                    setLoading(false);
                    return;
                }

                // Fall back to DB
                const playerId = getPlayerId();
                if (!playerId) {
                    setCharacterState('male');
                    setLoading(false);
                    return;
                }

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/player/${playerId}`
                );
                const result = await response.json();
                const preferred = result.data?.character || 'male';

                setCharacterState(preferred);
                saveCharacter(preferred); // cache for next time

            } catch (err) {
                setError(err.message);
                setCharacterState('male'); // safe fallback
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const updateCharacter = async (newCharacter) => {
        const playerId = getPlayerId();

        if (!playerId) {
            setError('No player ID found. Please restart the app.');
            return;
        }

        try {
            await updateCharacterAPI(playerId, newCharacter);
            saveCharacter(newCharacter);         // update localStorage
            setCharacterState(newCharacter);     // update state
        } catch (err) {
            setError(err.message);
            // Still update locally so UI isn't blocked
            saveCharacter(newCharacter);
            setCharacterState(newCharacter);
        }
    };

    return {
        character,
        setCharacter: updateCharacter,
        loading,
        error
    };
};

export default useCharacterPreference;