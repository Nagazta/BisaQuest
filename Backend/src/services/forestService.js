import { supabase } from '../config/supabaseClient.js';

export const forestService = {

    /**
     * Check if village quest is complete and get forest progress
     */
    async getForestProgress(playerId) {
        const { data: rows, error } = await supabase
            .from('player_environment_progress')
            .select('*')
            .eq('player_id', playerId)
            .in('environment_name', ['village', 'forest']);

        if (error) throw error;

        const village = rows?.find(r => r.environment_name === 'village');
        const forest = rows?.find(r => r.environment_name === 'forest');
        const villageComplete = village?.is_completed || false;

        return {
            player_id: playerId,
            unlocked: forest?.is_unlocked || false,
            forest_progress: forest?.completion_percentage || 0,
            completed: forest?.is_completed || false,
            last_updated: forest?.last_updated || null,
            prerequisites: {
                village: { progress: village?.completion_percentage || 0, completed: villageComplete },
            },
        };
    },

    /**
     * Update forest progress
     */
    async updateForestProgress(playerId, completionPercentage) {
        const isCompleted = completionPercentage >= 100;
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('player_environment_progress')
            .upsert(
                {
                    player_id: playerId,
                    environment_name: 'forest',
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

        if (isCompleted) {
            await supabase
                .from('player_environment_progress')
                .upsert(
                    {
                        player_id: playerId,
                        environment_name: 'castle',
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