// services/forestService.js
// UC-2.3: Forest state + village quest unlock verification

import { supabase } from '../config/supabaseClient.js';

export const forestService = {

    /**
     * Check if village quest is complete and get forest progress
     */
    async getForestProgress(playerId) {
        const { data, error } = await supabase
            .from('players')
            .select('player_id, progress_data')
            .eq('player_id', playerId)
            .single();

        if (error) throw error;

        const progress = data?.progress_data || {};
        const villageComplete = (progress.village_progress || 0) >= 100;

        return {
            player_id:       data.player_id,
            unlocked:        villageComplete,
            forest_progress: progress.forest_progress || 0,
            completed:       (progress.forest_progress || 0) >= 100,
            npc_completions: progress.forest_npcs || {},
            // Prerequisite status
            prerequisites: {
                village: { progress: progress.village_progress || 0, completed: villageComplete },
            },
        };
    },

    /**
     * Update forest progress
     */
    async updateForestProgress(playerId, forestProgress, npcCompletions = {}) {
        const { data: existing } = await supabase
            .from('players')
            .select('progress_data')
            .eq('player_id', playerId)
            .single();

        const merged = {
            ...(existing?.progress_data || {}),
            forest_progress: forestProgress,
            forest_npcs: { ...(existing?.progress_data?.forest_npcs || {}), ...npcCompletions },
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