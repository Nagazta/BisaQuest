// context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { createPlayer, fetchPlayer, resetProgress as resetPlayerProgress } from '../services/playerServices'
import { savePlayer, getSavedPlayer, hasExistingPlayer, clearPlayerData, getPlayerId } from '../utils/playerStorage';
import LoadingScreen from '../components/LoadingScreen';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkExistingPlayer();
    }, []);

    // ── UC-1.2: Check for returning player ───────────────────────────────────
    const checkExistingPlayer = async () => {
        console.log('🔍 Checking for existing player...');

        try {
            if (hasExistingPlayer()) {
                const saved = getSavedPlayer();
                console.log('✅ Found player in localStorage, verifying with DB...');

                const result = await fetchPlayer(saved.player_id);

                const playerData = {
                    player_id:  result.player_id,
                    nickname:   result.nickname,
                    character:  result.character,
                    progress:   [] // Progress is now handled per-environment
                };

                setPlayer(playerData);
                console.log('✅ Player loaded:', playerData.nickname);
            } else {
                console.log('ℹ️ No existing player found');
                setPlayer(null);
            }
        } catch (error) {
            console.error('❌ Player check failed — clearing localStorage:', error);
            clearPlayerData();
            setPlayer(null);
        } finally {
            setLoading(false);
        }
    };

    // ── UC-1.1: Create new player ─────────────────────────────────────────────
    const createNewPlayer = async (nickname = 'Guest Player') => {
        console.log('=== CREATE PLAYER START ===');

        try {
            const data = await createPlayer(nickname);

            savePlayer({ player_id: data.player_id, nickname: data.nickname });

            const playerData = {
                player_id: data.player_id,
                nickname:  data.nickname,
                character: data.character,
                progress:  [] 
            };

            setPlayer(playerData);
            console.log('✅ Player created:', playerData.nickname);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Create player error:', error);
            return { success: false, error: error.message };
        }
    };

    // ── UC-1.3: Set character on player state after selection ─────────────────
    const setCharacter = (character) => {
        setPlayer(prev => ({ ...prev, character }));
    };


    const resetProgress = async () => {
        if (!player?.player_id) return { success: false, error: 'No player loaded' };

        const confirmed = window.confirm(
            'Are you sure you want to reset all progress? This cannot be undone!'
        );
        if (!confirmed) return { success: false, message: 'Reset cancelled' };

        try {
            const data = await resetPlayerProgress(player.player_id);
            setPlayer(prev => ({ ...prev, progress: [] }));
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // ── UC-1.2: New Game — hard clear ─────────────────────────────────────────
    const startNewGame = () => {
        console.log('🗑️ New Game — clearing all player data');
        clearPlayerData();
        setPlayer(null);
    };

    // ── Soft logout — keeps localStorage ─────────────────────────────────────
    const logout = () => {
        console.log('👋 Soft logout — localStorage preserved');
        setPlayer(null);
    };

    const value = {
        player,
        loading,
        createNewPlayer,
        setCharacter,
        // saveProgress, // Removed
        resetProgress,
        startNewGame,
        logout
    };

    if (loading) {
        return <LoadingScreen message="Preparing your adventure..." />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};