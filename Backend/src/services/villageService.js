// services/villageService.js
// UC-2.2: Village state and player progress retrieval

import { supabase } from '../config/supabaseClient.js';

export const villageService = {

    /**
     * Get village progress for a player
     */
    async getVillageProgress(playerId) {
        const { data, error } = await supabase
            .from('players')
            .select('player_id, progress_data')
            .eq('player_id', playerId)
            .single();

        if (error) throw error;

        const progress = data?.progress_data || {};
        return {
            player_id:        data.player_id,
            village_progress: progress.village_progress || 0,
            completed:        (progress.village_progress || 0) >= 100,
            npc_completions:  progress.village_npcs     || {},
        };
    },

    /**
     * Update village progress for a player
     */
    async updateVillageProgress(playerId, villageProgress, npcCompletions = {}) {
        // Fetch existing progress first to merge
        const { data: existing } = await supabase
            .from('players')
            .select('progress_data')
            .eq('player_id', playerId)
            .single();

        const merged = {
            ...(existing?.progress_data || {}),
            village_progress: villageProgress,
            village_npcs:     { ...(existing?.progress_data?.village_npcs || {}), ...npcCompletions },
        };

        const { data, error } = await supabase
            .from('players')
            .update({ progress_data: merged })
            .eq('player_id', playerId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};