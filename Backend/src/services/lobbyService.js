// services/lobbyService.js
// UC-2.1: Retrieves per-environment progress from players table

import { supabase } from '../config/supabaseClient.js';

export const lobbyService = {

    /**
     * Get all environment progress for a player
     * Reads from progress_data JSONB column in players table
     */
    async getEnvironmentProgress(playerId) {
        const { data, error } = await supabase
            .from('players')
            .select('player_id, nickname, progress_data')
            .eq('player_id', playerId)
            .single();

        if (error) throw error;
        if (!data)  throw new Error('Player not found');

        const progress = data.progress_data || {};

        return {
            player_id: data.player_id,
            nickname:  data.nickname,
            environments: {
                village: {
                    progress:  progress.village_progress  || 0,
                    completed: (progress.village_progress || 0) >= 100,
                },
                forest: {
                    progress:  progress.forest_progress   || 0,
                    completed: (progress.forest_progress  || 0) >= 100,
                    locked:    (progress.village_progress || 0) < 100,
                },
                castle: {
                    progress:  progress.castle_progress   || 0,
                    completed: (progress.castle_progress  || 0) >= 100,
                    locked:    (progress.village_progress || 0) < 100 || (progress.forest_progress || 0) < 100,
                },
            },
        };
    },
};