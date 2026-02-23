// services/castleService.js
// UC-2.4: Castle state + village AND forest quest unlock verification

import { supabase } from '../config/supabaseClient.js';

export const castleService = {

    /**
     * Check if both village and forest quests are complete, get castle progress
     */
    async getCastleProgress(playerId) {
        const { data, error } = await supabase
            .from('players')
            .select('player_id, progress_data')
            .eq('player_id', playerId)
            .single();

        if (error) throw error;

        const progress       = data?.progress_data || {};
        const villageComplete = (progress.village_progress || 0) >= 100;
        const forestComplete  = (progress.forest_progress  || 0) >= 100;

        return {
            player_id:       data.player_id,
            unlocked:        villageComplete && forestComplete,
            castle_progress: progress.castle_progress || 0,
            completed:       (progress.castle_progress || 0) >= 100,
            npc_completions: progress.castle_npcs || {},
            prerequisites: {
                village: { progress: progress.village_progress || 0, completed: villageComplete },
                forest:  { progress: progress.forest_progress  || 0, completed: forestComplete  },
            },
        };
    },

    /**
     * Update castle progress
     */
    async updateCastleProgress(playerId, castleProgress, npcCompletions = {}) {
        const { data: existing } = await supabase
            .from('players')
            .select('progress_data')
            .eq('player_id', playerId)
            .single();

        const merged = {
            ...(existing?.progress_data || {}),
            castle_progress: castleProgress,
            castle_npcs: { ...(existing?.progress_data?.castle_npcs || {}), ...npcCompletions },
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