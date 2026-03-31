// services/lobbyService.js
// UC-2.1: Retrieves per-environment progress from players table

import { supabase } from '../config/supabaseClient.js';

export const lobbyService = {

     /**
     * Get all environment progress for a player
     * Reads from player_environment_progress table
     */
    async getEnvironmentProgress(playerId) {
        // 1. Get player info
        const { data: player, error: playerError } = await supabase
            .from('players')
            .select('player_id, nickname')
            .eq('player_id', playerId)
            .single();

        if (playerError) throw playerError;
        if (!player) throw new Error('Player not found');

        // 2. Get all environment progress
        const { data: progressRows, error: progressError } = await supabase
            .from('player_environment_progress')
            .select('*')
            .eq('player_id', playerId);

        if (progressError) throw progressError;

        const progressMap = (progressRows || []).reduce((acc, row) => {
            acc[row.environment_name] = row;
            return acc;
        }, {});

        const village = progressMap['village'] || { completion_percentage: 0, is_completed: false };
        const forest = progressMap['forest'] || { completion_percentage: 0, is_completed: false, is_unlocked: false };
        const castle = progressMap['castle'] || { completion_percentage: 0, is_completed: false, is_unlocked: false };

        return {
            player_id: player.player_id,
            nickname: player.nickname,
            environments: {
                village: {
                    progress: village.completion_percentage,
                    completed: village.is_completed,
                },
                forest: {
                    progress: forest.completion_percentage,
                    completed: forest.is_completed,
                    locked: !forest.is_unlocked,
                },
                castle: {
                    progress: castle.completion_percentage,
                    completed: castle.is_completed,
                    locked: !castle.is_unlocked,
                },
            },
        };
    },
};