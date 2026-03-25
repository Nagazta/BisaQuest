import { supabase } from '../config/supabaseClient.js';

export const castleService = {

    /**
     * Check if both village and forest quests are complete, get castle progress
     */
    async getCastleProgress(playerId) {
        const { data: rows, error } = await supabase
            .from('player_environment_progress')
            .select('*')
            .eq('player_id', playerId)
            .in('environment_name', ['village', 'forest', 'castle']);

        if (error) throw error;

        const village = rows?.find(r => r.environment_name === 'village');
        const forest = rows?.find(r => r.environment_name === 'forest');
        const castle = rows?.find(r => r.environment_name === 'castle');
        const villageComplete = village?.is_completed || false;
        const forestComplete = forest?.is_completed || false;

        return {
            player_id: playerId,
            unlocked: castle?.is_unlocked || false,
            castle_progress: castle?.completion_percentage || 0,
            completed: castle?.is_completed || false,
            last_updated: castle?.last_updated || null,
            prerequisites: {
                village: { progress: village?.completion_percentage || 0, completed: villageComplete },
                forest: { progress: forest?.completion_percentage || 0, completed: forestComplete },
            },
        };
    },

    /**
     * Update castle progress
     */
    async updateCastleProgress(playerId, completionPercentage) {
        const isCompleted = completionPercentage >= 100;
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('player_environment_progress')
            .upsert(
                {
                    player_id: playerId,
                    environment_name: 'castle',
                    completion_percentage: completionPercentage,
                    is_completed: isCompleted,
                    is_unlocked: true,
                    last_updated: now,
                },
                { onConflict: 'player_id,environment_name' }
            )
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};