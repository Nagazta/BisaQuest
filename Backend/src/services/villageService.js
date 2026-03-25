import { supabase } from '../config/supabaseClient.js';

export const villageService = {

    async getVillageProgress(playerId) {
        const { data, error } = await supabase
            .from('player_environment_progress')
            .select('*')
            .eq('player_id', playerId)
            .eq('environment_name', 'village')
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return {
            player_id: playerId,
            village_progress: data?.completion_percentage || 0,
            completed: data?.is_completed || false,
            is_unlocked: true, // village is always unlocked
            last_updated: data?.last_updated || null,
        };
    },

    async updateVillageProgress(playerId, completionPercentage) {
        const isCompleted = completionPercentage >= 100;
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('player_environment_progress')
            .upsert(
                {
                    player_id: playerId,
                    environment_name: 'village',
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

        // Auto-unlock forest when village hits 100%
        if (isCompleted) {
            await supabase
                .from('player_environment_progress')
                .upsert(
                    {
                        player_id: playerId,
                        environment_name: 'forest',
                        completion_percentage: 0,
                        is_completed: false,
                        is_unlocked: true,
                        last_updated: now,
                    },
                    { onConflict: 'player_id,environment_name' }
                );
        }

        return data;
    },
};